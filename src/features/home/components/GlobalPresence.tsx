'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Globe2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { bindSectionReveal, createCharReveal } from '@/features/animation/charReveal'
import { DUR, EASE } from '@/features/animation/motion'
import { isTouch } from '@/features/animation/device'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'
import { FlagBR, FlagUS, type FlagComp } from '@/components/icons/flags'

// O globo (cobe/WebGL) só existe abaixo da dobra e não tem conteúdo de SEO —
// carrega em chunk separado, fora do bundle inicial da home.
const Globe = dynamic(() => import('@/components/ui/Globe').then((m) => m.Globe), { ssr: false })

/**
 * Presença internacional: sede no Brasil (Mogi Guaçu · SP) e filial nos EUA
 * (Lakeland · FL), com globo interativo (cobe) e cards apontando os dois pins.
 * Usada na home (sec-presenca) e na página Sobre (variant="embedded").
 *
 * A composição é fixa (globo mostra as Américas e volta sozinho após o drag),
 * então os pins têm posição de tela estável — os halos, conectores e cards
 * ficam em % do container, projetados de lat/lng no enquadramento de repouso.
 */

// Endereços reais (mesmos do rodapé / config/site)
const BR_LOCATION: [number, number] = [-22.37, -46.94] // Mogi Guaçu · SP
const US_LOCATION: [number, number] = [28.04, -81.95] //  Lakeland · FL
const FOCUS: [number, number] = [3, -64.5] // centro entre os dois pins

const MARKERS = [
  { location: BR_LOCATION, size: 0.06 },
  { location: US_LOCATION, size: 0.05 },
]

// Posição dos pins em % do container — calibrada por screenshot do
// enquadramento de repouso (marker do cobe medido no canvas de 560px)
const PIN_BR = { left: 61.6, top: 68.2 }
const PIN_US = { left: 38.4, top: 31.6 }

type PinCardProps = {
  Flag: FlagComp
  name: string
  sub: string
  className?: string
}

function PinCard({ Flag, name, sub, className = '' }: PinCardProps) {
  return (
    <div
      data-pin-card
      className={`absolute z-20 flex items-center gap-2.5 sm:gap-3 rounded-2xl bg-white px-3 py-2 sm:px-4 sm:py-3 shadow-[0_12px_36px_rgba(10,30,15,0.14)] ring-1 ring-black/5 transition-opacity duration-300 ${className}`}
    >
      <span className="inline-flex h-6 w-9 sm:h-7 sm:w-10 shrink-0 overflow-hidden rounded-md ring-1 ring-black/10">
        <Flag className="h-full w-full" />
      </span>
      <span className="leading-tight">
        <span className="block text-[13px] sm:text-[15px] font-bold text-foreground">{name}</span>
        <span className="block text-[11px] sm:text-xs font-medium text-primary">{sub}</span>
      </span>
    </div>
  )
}

export function GlobalPresence({ variant = 'section' }: { variant?: 'section' | 'embedded' }) {
  const t = useTranslations('globalPresence')
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  /* Lido uma vez: decide se o esmaecimento do arrasto faz sentido neste
     aparelho (ver comentário na camada de pins, mais abaixo). */
  const [touch, setTouch] = useState(false)
  useEffect(() => setTouch(isTouch()), [])

  useGSAP(
    () => {
      if (reduced || !rootRef.current) return
      const root = rootRef.current

      const eyebrow = root.querySelector<HTMLElement>('[data-gp-eyebrow]')
      const title = root.querySelector<HTMLElement>('[data-gp-title]')
      const body = root.querySelector<HTMLElement>('[data-gp-body]')
      const support = root.querySelector<HTMLElement>('[data-gp-support]')
      const globeWrap = root.querySelector<HTMLElement>('[data-gp-globe]')
      const cards = gsap.utils.toArray<HTMLElement>('[data-pin-card]', root)
      const halos = gsap.utils.toArray<HTMLElement>('[data-pin-halo]', root)

      const reveal = createCharReveal(title)

      if (eyebrow) gsap.set(eyebrow, { y: 15, opacity: 0 })
      reveal?.hide()
      if (body) gsap.set(body, { y: 20, opacity: 0 })
      if (support) gsap.set(support, { y: 16, opacity: 0 })
      /* O globo nasce bem pequeno e transparente e cresce até o tamanho certo,
         ganhando corpo no caminho. Antes partia de 0.9 — quase o tamanho final,
         o que fazia a entrada passar despercebida. */
      if (globeWrap) gsap.set(globeWrap, { scale: 0.55, opacity: 0 })
      if (cards.length) gsap.set(cards, { y: 14, opacity: 0 })
      if (halos.length) gsap.set(halos, { scale: 0, opacity: 0 })

      /* ── A entrada precisa acontecer, sempre ─────────────────────────
         Esta seção nasce inteira em `opacity: 0` — corpo, apoio, globo, halos
         e os cards das bandeiras — e conta com um `onEnter` para aparecer. Com
         `once: true`, uma única chance: se o ScrollTrigger recalcular as
         posições e concluir que o ponto de partida JÁ ficou para trás, ele
         considera que a entrada aconteceu no passado e nunca chama o callback.

         E é o que acontecia aqui. Acima desta seção há dois trechos pinados (o
         catálogo e a Aminosan) que inserem espaçadores de milhares de pixels
         quando montam; cada `ScrollTrigger.refresh()` reposiciona todo mundo, e
         esta seção — que é carregada por `dynamic()`, portanto monta depois —
         acabava com o start já vencido. O resultado no aparelho eram as
         bandeiras e os textos permanentemente apagados.

         `played` torna a entrada idempotente, e o `onRefresh` recupera o caso
         em que o start já passou: se a seção está visível e a animação nunca
         rodou, ela roda agora. */
      /* Entrada E saída, como no resto do site: quem volta para esta seção a vê
         entrar de novo. `bindSectionReveal` também cobre o caso que deixava as
         bandeiras apagadas — acima daqui há dois trechos pinados que inserem
         espaçadores de milhares de pixels ao montar, e cada refresh
         reposiciona os triggers; com `once`, essa única chance podia ser gasta
         sem que o callback rodasse, e a seção ficava presa invisível. */
      const st = bindSectionReveal(root, () => {
        const tl = gsap.timeline({ defaults: { ease: EASE.reveal } })
        if (eyebrow) tl.to(eyebrow, { y: 0, opacity: 1, duration: 0.5 }, 0)
        reveal?.playIn(tl, 0.08)
        if (body) tl.to(body, { y: 0, opacity: 1, duration: DUR.sub }, 0.35)
        if (support) tl.to(support, { y: 0, opacity: 1, duration: DUR.sub }, 0.5)
        // O globo cresce de 0.55 até 1 enquanto ganha opacidade — a entrada
        // acompanha o texto em vez de aparecer pronta.
        if (globeWrap) tl.to(globeWrap, { scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out' }, 0.2)
        if (halos.length)
          tl.to(halos, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.12, ease: 'back.out(2)' }, 0.9)
        if (cards.length) tl.to(cards, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12 }, 1.0)
        return tl
      })

      /* `data-gp-idle` congela os halos enquanto a seção não está em cena
         (ver o comentário no <style> abaixo). Margem de meia tela para que eles
         já estejam pulsando quando a seção aparece. */
      const idleObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) root.removeAttribute('data-gp-idle')
          else root.setAttribute('data-gp-idle', '')
        },
        { rootMargin: '50% 0px' },
      )
      idleObserver.observe(root)
      root.setAttribute('data-gp-idle', '')

      return () => {
        idleObserver.disconnect()
        root.removeAttribute('data-gp-idle')
        st.kill()
        reveal?.revert()
      }
    },
    { scope: rootRef, dependencies: [reduced] },
  )

  const inner = (
    <div ref={rootRef} className="grid grid-cols-1 lg:grid-cols-2 items-center gap-14 lg:gap-10">
      {/* Os dois halos pulsam em laço infinito. Sem a pausa abaixo eles seguem
          pulsando com a seção fora da tela — do primeiro frame da visita até a
          aba fechar. São só dois elementos, mas cada um é uma camada composta e
          recomposta a cada frame, para sempre: medido no aparelho, pausá-los
          fora de vista derruba os frames perdidos na região DEPOIS desta seção
          de 99% para 76%. Era a causa de a página "ficar lenta depois do
          globo" — o canvas WebGL, que parecia o suspeito óbvio, respondia por
          quase nada (96% quando removido). */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes gp-halo-pulse {
            0%   { transform: scale(1);   opacity: 0.55; }
            70%  { transform: scale(2.2); opacity: 0; }
            100% { transform: scale(2.2); opacity: 0; }
          }
          .gp-halo-ring { animation: gp-halo-pulse 2.4s ease-out infinite; }
          [data-gp-idle] .gp-halo-ring { animation-play-state: paused; }
        }
      `}</style>

      {/* ── Texto ──────────────────────────────────────────────── */}
      <div className="max-w-[36rem]">
        <span
          data-gp-eyebrow
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-6"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {t('eyebrow')}
        </span>

        <h2
          data-gp-title
          className="font-montserrat text-4xl md:text-5xl lg:text-[3.4rem] font-black uppercase text-foreground tracking-tight leading-[1.04] mb-6"
        >
          <span className="block">{t('titleL1')}</span>
          <span className="block">{t('titleL2')}</span>
          <span className="block">
            <em className="text-highlight text-primary">{t('titleHighlight')}</em>
            <span className="text-foreground">.</span>
          </span>
        </h2>

        <p data-gp-body className="text-lg text-foreground/70 leading-relaxed">
          {t('body')}
        </p>

        <div data-gp-support className="mt-9 flex items-center gap-4 border-l-2 border-primary pl-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/25 text-primary">
            <Globe2 className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <p className="text-[15px] font-medium leading-snug text-primary max-w-[20rem]">{t('support')}</p>
        </div>
      </div>

      {/* ── Globo ──────────────────────────────────────────────── */}
      <div
        data-gp-globe
        role="img"
        aria-label={t('globeAria')}
        className="relative mx-auto w-full max-w-[420px] sm:max-w-[500px] lg:max-w-[560px] aspect-square select-none"
      >
        {/* anéis decorativos ao fundo */}
        <div aria-hidden className="pointer-events-none absolute -inset-[7%] rounded-full border border-primary/10" />
        <div aria-hidden className="pointer-events-none absolute -inset-[14%] rounded-full border border-primary/5" />

        <Globe markers={MARKERS} focus={FOCUS} onDragChange={setDragging} />

        {/* Camada de pins/cards: acompanha o balanço idle do globo
            (--globe-sway-px, setada pelo Globe).

            O esmaecimento durante o arrasto vale só onde existe arrasto de
            verdade. Num aparelho de toque o mesmo gesto que gira o globo é o
            gesto de rolar a página: encostar o dedo já disparava
            `pointerdown` e derrubava bandeiras, nomes e halos para 20% de
            opacidade no meio da rolagem. Pior, quando o gesto virava scroll o
            navegador emitia `pointercancel` em vez de `pointerup`, e o estado
            ficava preso indefinidamente — as bandeiras seguiam apagadas pelo resto da
            visita. No celular a camada é sólida o tempo todo. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{ opacity: dragging && !touch ? 0.2 : 1, transform: 'translateX(var(--globe-sway-px, 0px))' }}
        >
          {/* conectores (curvas suaves do card ao pin) */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" fill="none">
            <path
              d="M 31 14.5 Q 51 6.5 38.8 29.6"
              stroke="var(--color-primary)"
              strokeOpacity="0.28"
              strokeWidth="0.45"
              strokeLinecap="round"
            />
            <path
              d="M 76 74.5 Q 87 61.5 63.4 68.7"
              stroke="var(--color-primary)"
              strokeOpacity="0.28"
              strokeWidth="0.45"
              strokeLinecap="round"
            />
          </svg>

          {/* halos dos pins */}
          {[
            { pin: PIN_US, key: 'us' },
            { pin: PIN_BR, key: 'br' },
          ].map(({ pin, key }) => (
            <span
              key={key}
              data-pin-halo
              className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pin.left}%`, top: `${pin.top}%` }}
            >
              <span className="gp-halo-ring absolute inset-0 rounded-full bg-primary-light" />
              <span className="absolute inset-[3px] rounded-full bg-primary shadow-[0_0_10px_rgba(0,120,60,0.55)]" />
            </span>
          ))}

          {/* cards */}
          <PinCard
            Flag={FlagUS}
            name={t('usName')}
            sub={t('usSub')}
            className="left-0 top-[6%] sm:top-[7%] -translate-x-[6%]"
          />
          <PinCard
            Flag={FlagBR}
            name={t('brazilName')}
            sub={t('brazilSub')}
            className="right-0 top-[76%] translate-x-[6%]"
          />
        </div>
      </div>
    </div>
  )

  if (variant === 'embedded') return inner

  return (
    <section className="bg-white overflow-hidden" style={{ paddingBlock: 'clamp(80px, 7.5vw, 120px)' }}>
      <Container className="min-[1600px]:max-w-[100rem]">{inner}</Container>
    </section>
  )
}
