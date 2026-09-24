'use client'

/**
 * Véu de carregamento global: primeiro acesso e toda troca de página interna.
 *
 * Ordem, e ela importa: cobre, mostra a marca, monta a página nova, prepara o
 * trabalho pesado, sai. Montar a página, cenas de canvas e amostragem de imagem
 * são main thread puro. Rodando durante o ENTRY, a marca trava; rodando na
 * saída, a cortina congela. Por isso a rota só muda depois do ENTRY, e o
 * trabalho pesado acontece com a marca parada, pulsando por CSS (compositor).
 *
 *   1. clique interno interceptado; o véu faz fade-in (0,25 s)
 *   2. ENTRY da marca (quadros 0 a 58) com a página antiga parada
 *   3. rolagem a zero, com o véu opaco, e SÓ ENTÃO a rota muda
 *   4. marca pulsa em CSS; a página nova monta atrás. Espera: mínimo de 800 ms
 *      desde o começo do ENTRY, fontes, imagens da primeira dobra e o trabalho
 *      registrado em `prepare()`. Teto de 8 s
 *   5. cortina: a marca sobe e some, o véu sobe. Quem revela a página é a borda
 *      de baixo passando
 *
 * Primeiro acesso: mesma sequência, sem trocar de rota. O véu já vem opaco no
 * HTML do servidor.
 */
import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { AnimationItem } from 'lottie-web'

import { gsap, ScrollTrigger } from '@/features/animation/gsap'
import { useLenis } from '@/features/animation/SmoothScroll'
import { holdBoot, markBooted, markCovered, whenPrepared } from './boot'
import {
  CAP_MS,
  ENTRY_END_FRAME,
  ENTRY_SPEED,
  ENTRY_TIMEOUT_MS,
  MIN_HOLD_MS,
  VEIL_SRC,
  VEIL_Z_INDEX,
} from './config'
import { isScrollLocked, lockScroll, pin, unlockScroll } from './scroll-lock'

/* O player e o JSON começam a baixar quando o MÓDULO é avaliado, e não no efeito
   do componente (que só roda depois da hidratação inteira). O JSON não entra no
   bundle. `lottie_light` é só SVG. */
const playerPromise =
  typeof window === 'undefined'
    ? null
    : import('lottie-web/build/player/lottie_light').then((m) => m.default).catch(() => null)
const dataPromise =
  typeof window === 'undefined'
    ? null
    : fetch(VEIL_SRC)
        .then((r) => r.json())
        .catch(() => null)

/** `token` invalida fluxos de um efeito antigo (StrictMode, remontagem). `firstDone` sobrevive à remontagem por troca de idioma. */
const session = { token: 0, firstDone: false }

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, Math.max(0, ms)))
const nextPaint = () =>
  new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))
/** Main thread ociosa (sem tarefa na fila). Safari não tem requestIdleCallback: cai num timeout curto. */
const whenIdle = (timeout: number) =>
  new Promise<void>((r) => {
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(() => r(), { timeout })
    else setTimeout(r, 200)
  })
const windowLoaded = () =>
  new Promise<void>((r) => {
    if (document.readyState === 'complete') r()
    else window.addEventListener('load', () => r(), { once: true })
  })
/** Marcas na timeline de performance: âncora para medir cada fase do véu. */
const mark = (name: string) => performance.mark(`veil:${name}`)
const isReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Imagens de prioridade visíveis na primeira dobra: decodificadas antes de o véu sair. */
function firstFoldImages(): Promise<unknown> {
  const pending = Array.from(document.images).filter((img) => {
    if (img.closest('#veil')) return false
    if (img.loading === 'lazy' && img.fetchPriority !== 'high') return false
    const r = img.getBoundingClientRect()
    return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth
  })
  return Promise.allSettled(pending.map((img) => img.decode()))
}

export function Veil() {
  const router = useRouter()
  const pathname = usePathname()
  const lenis = useLenis()

  const veilRef = useRef<HTMLDivElement>(null)
  const holdRef = useRef<HTMLStyleElement>(null)
  const pulseRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const routerRef = useRef(router)
  const lenisRef = useRef(lenis)
  const pathRef = useRef(pathname)
  const pathWaiterRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    routerRef.current = router
  }, [router])

  useEffect(() => {
    lenisRef.current = lenis
    // O Lenis nasce depois do véu: se já há trava de pé, ele nasce parado.
    if (isScrollLocked()) lenis?.stop()
  }, [lenis])

  useEffect(() => {
    pathRef.current = pathname
    const waiter = pathWaiterRef.current
    pathWaiterRef.current = null
    waiter?.()
  }, [pathname])

  useEffect(() => {
    const veil = veilRef.current
    const stage = stageRef.current
    const pulse = pulseRef.current
    const hold = holdRef.current
    if (!veil || !stage || !pulse) return

    const token = ++session.token
    const alive = () => token === session.token
    let phase: 'idle' | 'busy' | 'exit' = 'idle'
    let anim = null as AnimationItem | null
    let exitTl = null as gsap.core.Timeline | null

    // Centraliza por GSAP: o palco vertical é mais alto que a tela, e o desenho
    // fica 0,93% da altura da composição abaixo do centro.
    gsap.set(stage, { xPercent: -50, yPercent: -50.93 })

    const ready: Promise<boolean> = Promise.all([playerPromise, dataPromise])
      .then(([lottie, data]) => {
        if (!alive() || !lottie || !data) return false
        anim = lottie.loadAnimation({
          container: stage,
          renderer: 'svg',
          loop: false,
          autoplay: false,
          animationData: data,
          // Monta os elementos aos poucos: o pico do primeiro quadro cai bastante.
          rendererSettings: { progressiveLoad: true },
        })
        anim.setSpeed(ENTRY_SPEED)
        anim.goToAndStop(isReduced() ? ENTRY_END_FRAME : 0, true)
        return true
      })
      .catch(() => false)

    /* ENTRY: quadros 0 a 58. `stop.cancelled` impede um ENTRY tardio de começar
       depois que o timeout de segurança já mandou seguir. */
    const playEntry = (stop: { cancelled: boolean }) =>
      new Promise<void>((resolve) => {
        const a = anim
        if (!a || stop.cancelled) return resolve()
        if (isReduced()) {
          a.goToAndStop(ENTRY_END_FRAME, true)
          return resolve()
        }
        let settled = false
        const done = () => {
          if (settled) return
          settled = true
          a.removeEventListener('complete', done)
          a.goToAndStop(ENTRY_END_FRAME, true)
          resolve()
        }
        a.addEventListener('complete', done)
        a.setSpeed(ENTRY_SPEED)
        a.playSegments([0, ENTRY_END_FRAME], true)
        // Rede de segurança: ENTRY dura ~1,14 s.
        setTimeout(done, (ENTRY_END_FRAME / 30 / ENTRY_SPEED) * 1000 + 600)
      })

    // A marca fica PARADA no quadro 58; o pulso é CSS, que roda no compositor
    // e segue liso com a main thread ocupada montando a página nova.
    const pulseOn = () => {
      if (!isReduced()) pulse.classList.add('veil-pulse')
    }
    const pulseOff = () => pulse.classList.remove('veil-pulse')

    const cover = (instant: boolean) =>
      new Promise<void>((resolve) => {
        mark('cover')
        exitTl?.kill()
        gsap.set(veil, { yPercent: 0 })
        gsap.set(stage, { opacity: 1, y: 0 })
        veil.style.pointerEvents = 'auto'
        if (instant) {
          gsap.set(veil, { autoAlpha: 1 })
          return resolve()
        }
        gsap.to(veil, { autoAlpha: 1, duration: 0.25, ease: 'power1.out', onComplete: resolve })
      })

    /** Recomeça a marca do zero: página de destino, novo ENTRY. */
    const rewind = (atEntryEnd = false) => {
      pulseOff()
      anim?.goToAndStop(atEntryEnd || isReduced() ? ENTRY_END_FRAME : 0, true)
    }

    const waitPathChange = () =>
      new Promise<void>((resolve) => {
        pathWaiterRef.current = resolve
      })

    /** O que o véu espera antes de sair, com teto contra rede ruim. */
    const settle = async (entryStart: number, deadlineAt: number, waitLoad: boolean) => {
      const gates = Promise.all([
        delay(MIN_HOLD_MS - (performance.now() - entryStart)),
        document.fonts?.ready,
        waitLoad ? windowLoaded() : null,
        firstFoldImages(),
        whenPrepared(),
      ])
      await Promise.race([gates, delay(deadlineAt - performance.now())])
    }

    /** Saída em cortina. O `refresh` é síncrono e caro: roda com o véu opaco e ANTES da saída. */
    const exit = () =>
      new Promise<void>((resolve) => {
        ScrollTrigger.refresh()

        const finish = () => {
          gsap.set(veil, { autoAlpha: 0, yPercent: 0 })
          gsap.set(stage, { opacity: 1, y: 0 })
          veil.style.pointerEvents = 'none'
          pulseOff()
          unlockScroll()
          lenisRef.current?.start()
          phase = 'idle'
          session.firstDone = true
          mark('exit-end')
          resolve()
        }

        /* Um tick do relógio do GSAP depois do refresh: sem isso o refresh
           consome o tempo e a saída começa adiantada, como um tranco. */
        gsap.ticker.add(function step() {
          gsap.ticker.remove(step)
          if (!alive()) return resolve()
          phase = 'exit'
          mark('exit-start')
          // Segundo clique com o véu subindo: passa direto, a navegação segue normal.
          veil.style.pointerEvents = 'none'
          exitTl = gsap.timeline({ onComplete: finish })
          if (isReduced()) {
            exitTl.to(veil, { autoAlpha: 0, duration: 0.3, ease: 'power1.out' })
          } else {
            exitTl.to(stage, { y: '-12vh', opacity: 0, duration: 0.5, ease: 'power2.in' }, 0)
            exitTl.to(veil, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, 0.1)
          }
          // A entrada do hero da página nova começa junto com a saída.
          markBooted()
        })
      })

    /** Passos 2 a 5, a partir do ENTRY. `routeChange` dispara a troca de rota (ou nada, no popstate). */
    const run = async (
      t0: number,
      routeChange: (() => Promise<void>) | null,
      skipEntry = false,
    ) => {
      const entryStart = performance.now()
      const stop = { cancelled: skipEntry }
      if (!skipEntry) {
        mark('entry-start')
        await Promise.race([
          ready.then(() => playEntry(stop)),
          delay(ENTRY_TIMEOUT_MS - (entryStart - t0)),
        ])
        stop.cancelled = true
        if (!alive()) return
        mark('entry-end')
      }
      anim?.goToAndStop(ENTRY_END_FRAME, true)
      pulseOn()

      // Rolagem a zero com o véu opaco, e SÓ ENTÃO a rota muda.
      pin(0)
      lenisRef.current?.scrollTo(0, { immediate: true, force: true })
      await routeChange?.()
      if (!alive()) return
      mark('route')

      await nextPaint()
      markCovered()
      mark('covered')
      await settle(entryStart, t0 + CAP_MS, false)
      if (!alive()) return
      await exit()
    }

    const navigate = async (href: string) => {
      phase = 'busy'
      const t0 = performance.now()
      lockScroll()
      lenisRef.current?.stop()
      await cover(false)
      if (!alive()) return
      rewind()
      await run(t0, async () => {
        holdBoot()
        const changed = waitPathChange()
        routerRef.current.push(href)
        await Promise.race([changed, delay(t0 + CAP_MS - performance.now())])
      })
    }

    /** Voltar/avançar: a rota já está mudando. Cobre de uma vez e segue do passo 3. */
    const onPopState = () => {
      if (phase !== 'idle' || window.location.pathname === pathRef.current) return
      phase = 'busy'
      const t0 = performance.now()
      holdBoot()
      lockScroll()
      lenisRef.current?.stop()
      gsap.set(veil, { yPercent: 0, autoAlpha: 1 })
      gsap.set(stage, { opacity: 1, y: 0 })
      veil.style.pointerEvents = 'auto'
      /* Sem ENTRY: o Next já está commitando a rota, e montar a marca junto com
         esse trabalho a travaria. A marca entra pronta, no quadro 58, e pulsa. */
      rewind(true)
      const changed = waitPathChange()
      void run(
        t0,
        async () => {
          await Promise.race([changed, delay(t0 + CAP_MS - performance.now())])
        },
        true,
      )
    }

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const anchor = (e.target as Element | null)?.closest?.('a')
      if (!anchor) return
      const raw = anchor.getAttribute('href')
      if (!raw || raw.startsWith('#') || /^(mailto|tel|sms|javascript):/i.test(raw)) return
      const target = anchor.getAttribute('target')
      if (target && target !== '_self') return
      if (anchor.hasAttribute('download')) return
      let url: URL
      try {
        url = new URL(anchor.href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return
      // Mesmo pathname (âncora ou só query): navegação normal.
      if (url.pathname === window.location.pathname) return

      if (phase === 'exit') return // véu subindo: segue direto para o destino novo
      // Véu coberto e o clique veio do teclado: não empilha uma segunda troca.
      e.preventDefault()
      e.stopPropagation()
      if (phase === 'busy') return
      void navigate(url.pathname + url.search + url.hash)
    }

    // Captura na `window`: chega antes do onClick do <Link>, que não vê o clique.
    window.addEventListener('click', onClick, true)
    window.addEventListener('popstate', onPopState)

    // Primeiro acesso: o véu já veio opaco no HTML. ENTRY uma vez, segura e pulsa até
    // `load` + fontes + preparo, e sai pela mesma cortina.
    if (!session.firstDone) {
      phase = 'busy'
      const t0 = performance.now()
      lockScroll()
      void (async () => {
        const stop = { cancelled: false }
        /* A hidratação e os re-renders em cascata dos efeitos são main thread puro e
           travariam a marca. O ENTRY espera a main thread ficar ociosa. */
        await Promise.race([Promise.all([ready, whenIdle(1500)]), delay(ENTRY_TIMEOUT_MS + 1500)])
        if (!alive()) return
        const entryStart = performance.now()
        mark('entry-start')
        await Promise.race([ready.then(() => playEntry(stop)), delay(ENTRY_TIMEOUT_MS)])
        stop.cancelled = true
        if (!alive()) return
        anim?.goToAndStop(ENTRY_END_FRAME, true)
        pulseOn()
        mark('entry-end')
        /* Até aqui o conteúdo por baixo ficou `visibility: hidden`: o raster e a
           decodificação do hero (GPU) disputavam quadros com o ENTRY. Agora que
           a marca só pulsa (CSS, no compositor), a página pode ser pintada. */
        if (hold) hold.media = 'not all'
        // A página já montou atrás do véu: os componentes pesados podem começar.
        markCovered()
        mark('covered')
        await nextPaint()
        await settle(entryStart, t0 + CAP_MS, true)
        if (!alive()) return
        await exit()
      })()
    }

    return () => {
      window.removeEventListener('click', onClick, true)
      window.removeEventListener('popstate', onPopState)
      exitTl?.kill()
      anim?.destroy()
      anim = null
      // Remontagem no meio da cortina (troca de idioma): não deixa a rolagem presa.
      if (phase === 'exit') {
        unlockScroll()
        lenisRef.current?.start()
      }
    }
  }, [])

  return (
    <>
    {!session.firstDone && (
      /* Primeiro acesso: o conteúdo por baixo fica sem pintar até o ENTRY terminar
         (o efeito o desliga por `media`, sem mexer no DOM que o React gerencia). */
      <style ref={holdRef}>{'body>*:not(#veil){visibility:hidden}'}</style>
    )}
    <div
      id="veil"
      ref={veilRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: VEIL_Z_INDEX,
        overflow: 'hidden',
        background: '#fff',
        // Remontado por troca de idioma depois do primeiro véu: nasce escondido.
        ...(session.firstDone ? { opacity: 0, visibility: 'hidden', pointerEvents: 'none' } : null),
      }}
    >
      {/* Pulso: wrapper EXTERNO ao palco. O GSAP transforma o palco; o pulso CSS transforma este. */}
      <div ref={pulseRef} style={{ position: 'absolute', inset: 0 }}>
        <div
          ref={stageRef}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            aspectRatio: '9 / 16',
            width: 'calc(min(600px, 78vw) * 0.936)',
            minWidth: 393,
          }}
        />
      </div>
    </div>
    </>
  )
}
