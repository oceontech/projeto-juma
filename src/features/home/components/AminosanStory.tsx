'use client'

/**
 * "A transformação do Aminosan"
 *
 * Desktop: seção com scroll capturado. Cadeia de 3 clipes ligados ao scroll,
 * cada um com um reverso gravado (play sempre nativo, nunca seek manual):
 *   act1 ──morph──▶ act3 ──line──▶ line ──cat──▶ exit (handoff para o catálogo)
 * Em cada fase de repouso um still idêntico ao frame de borda cobre o vídeo.
 * O fim do clipe "cat" libera o scroll, rola até o catálogo e dispara o evento
 * 'aminosan:handoff-forward' (HomeProductShowcase faz a entrada branco→cor).
 *
 * Mobile compartilha os mesmos clipes 1920×1080 (object-contain).
 * Reduced-motion: SimpleVersion — dois blocos full-bleed, sem lock.
 */
import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode, type RefObject } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { createCharReveal } from '@/features/animation/charReveal'
import { useLenis } from '@/features/animation/SmoothScroll'
import { killMomentumScroll } from '@/features/animation/killMomentumScroll'
import { EASE, STAGGER, blurPx } from '@/features/animation/motion'
import { StaggerGroup } from '@/features/animation/StaggerGroup'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'

type TFn = ReturnType<typeof useTranslations>

/* Vídeos e stills compartilhados por desktop e mobile.
   `object-contain` em TODAS as larguras (não só no mobile): os clipes e stills
   são composições fechadas 1920×1080 com fundo branco puro, então `cover` fazia
   o enquadramento seguir a proporção da janela — em tela larga e baixa o frasco
   saía cortado em cima e embaixo, em tela estreita e alta ele era ampliado a
   ponto de passar por trás do texto e da assinatura AMINOSAN. Com `contain` a
   composição inteira sempre cabe no palco, centrada, e as tarjas que sobram são
   brancas iguais ao fundo da seção (bg-white) — invisíveis. */
const STAGE_VIDEO_CLASS =
  'absolute inset-0 z-0 h-full w-full object-contain opacity-0 max-lg:!top-[22dvh] max-lg:!bottom-auto max-lg:!h-[60dvh]'
const STAGE_IMAGE_CLASS =
  'absolute z-10 pointer-events-none object-contain lg:!inset-0 max-lg:!top-[22dvh] max-lg:!bottom-auto max-lg:!h-[60dvh]'

/* Âncora vertical única das colunas de texto do Ato 1 e do Ato 3 no desktop.
   O clamp segura a faixa entre 6rem e 22rem, então em janela baixa (600px) o
   texto não desce demais e em monitor alto (1400px+) não sobe demais — é sempre
   a mesma faixa da tela, e não uma fração do conteúdo.

   O corte é `lg` (1024px), NÃO `md`: 1024 é onde o `isMobile`, o
   `updateVideoScale` (escala 2.8/1.45) e as classes `max-lg:` dos stills já
   trocam de tratamento. Enquanto o texto virava desktop em 768 e a mídia só em
   1024, a faixa de 768 a 1023 juntava coluna de texto centralizada com o frasco
   ampliado 2,8× — a assinatura AMINOSAN caía na tampa e a copy atravessava o
   rótulo. Agora a seção inteira vira num número só. */
/* Âncora vertical compartilhada pelos Atos 1 e 3 (ver comentário no JSX do
   Ato 1). Precisa ser a MESMA nos dois: é ela que faz o título cair no mesmo
   pixel na virada de um ato para o outro. Subiu de 30dvh para 36dvh quando o
   bloco de número saiu do Ato 3 e a coluna ficou visivelmente acima do centro.
   O teto (24rem) segura o Ato 1, que é mais alto (dois parágrafos + tag de
   rodapé), dentro da tela em notebooks de pouca altura. */
const ACT_COLUMN_TOP = 'lg:pt-[clamp(6rem,36dvh,24rem)]'

export function AminosanStory() {
  const t = useTranslations('aminosanStory')
  const reduced = useReducedMotion()
  /* Lazy initializer (não `useState(false)` + effect): precisa nascer com o
     valor CERTO já no primeiro render do cliente. Se nascesse `false` e só
     corrigisse depois, todo mundo — mobile incluído — montaria CinematicVersion
     por um commit inteiro antes de trocar para MobileVersion. O problema não é
     só o desperdício: o `#sec-produtos` (HomeProductShowcase, a seção seguinte)
     mede o PRÓPRIO pin nesse meio-tempo, com a altura do Aminosan ainda
     incompleta (zero, ou a de uma versão que vai ser trocada) — e como o pin
     dele guarda esse `start`/`end` errado sem nunca ser recalculado depois
     (mesmo com `ScrollTrigger.refresh()` global chamado na sequência), o
     carrossel de produtos passa a renderizar com o palco fora do lugar
     (`top` != 0) — a seção inteira em branco. Nascendo com o valor certo,
     nenhuma versão errada chega a montar, e a altura do Aminosan já está
     certa no primeiro layout que o resto da página mede. Verificado revertendo
     a mudança com `git stash` e comparando o mesmo teste lado a lado. */
  const [isMobile, setIsMobile] = useState(() => (typeof window === 'undefined' ? false : window.innerWidth < 1024))

  useEffect(() => {
    const timeouts: number[] = []
    const rafs: number[] = []

    let pendingRaf = 0
    const scheduleRefresh = () => {
      if (pendingRaf) return
      pendingRaf = window.requestAnimationFrame(() => {
        pendingRaf = 0
        ScrollTrigger.refresh()
      })
    }

    scheduleRefresh()
    timeouts.push(window.setTimeout(scheduleRefresh, 300))
    document.fonts?.ready.then(scheduleRefresh).catch(() => {})

    /* `{ once: true }` é o ponto — sem ele, cada listener continua vivo pelo
       resto da visita. `loadeddata` não é um evento de "carregou uma vez": ele
       volta a disparar sempre que o vídeo precisa rebufferizar depois de um
       seek para um trecho ainda não baixado, o que É o vídeo desta seção — a
       história é conduzida pelo usuário arrastando/rolando por cima dele.
       Cada refire agendava um `ScrollTrigger.refresh()` global, sem nenhuma
       guarda de "pin ativo" (a de baixo, no `HomeProductShowcase`, tem essa
       guarda; esta não tinha), e um refresh remede o documento inteiro e
       reposiciona qualquer pin — inclusive o desta própria seção e o do
       catálogo logo abaixo — embaixo do usuário no meio de um gesto de
       scroll. Era esse o "às vezes a rolagem fica mais rápida e pula
       conteúdo" relatado a partir daqui pra baixo: o listener só devia
       corrigir a medida INICIAL (altura do vídeo ainda desconhecida no
       primeiro layout, ver comentário do `isMobile` acima), não continuar
       reagindo pelo resto da visita. */
    const media = Array.from(document.querySelectorAll<HTMLImageElement | HTMLVideoElement>('#sec-origem img, #sec-origem video'))
    media.forEach((el) => {
      el.addEventListener('load', scheduleRefresh, { once: true })
      el.addEventListener('loadedmetadata', scheduleRefresh, { once: true })
      el.addEventListener('loadeddata', scheduleRefresh, { once: true })
    })

    // Só re-agenda refresh em resize de LARGURA (rotação, redimensionar janela).
    // No mobile, mudança de ALTURA sozinha é o navegador escondendo/mostrando a
    // barra de endereço enquanto o usuário rola — refazer o refresh nesse
    // momento recalcula start/end/spacer do pin no meio do gesto e produz o
    // salto. Mesma guarda que o HomeProductShowcase já usa.
    let lastWidth = window.innerWidth
    const onResize = () => {
      if (window.innerWidth === lastWidth) return
      lastWidth = window.innerWidth
      scheduleRefresh()
    }

    window.addEventListener('load', scheduleRefresh)
    window.addEventListener('pageshow', scheduleRefresh)
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('load', scheduleRefresh)
      window.removeEventListener('pageshow', scheduleRefresh)
      window.removeEventListener('resize', onResize)
      media.forEach((el) => {
        el.removeEventListener('load', scheduleRefresh)
        el.removeEventListener('loadedmetadata', scheduleRefresh)
        el.removeEventListener('loadeddata', scheduleRefresh)
      })
      timeouts.forEach(window.clearTimeout)
      rafs.forEach(window.cancelAnimationFrame)
    }
  }, [])
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <div className="w-full overflow-x-hidden aminosan-wrapper">
      {reduced ? (
        <SimpleVersion key="simple" t={t} isMobile={isMobile} reduced={reduced} />
      ) : (
        /* As duas versões ficam sempre no DOM, escolhidas por CSS (`hidden
           lg:block` / `block lg:hidden`) — mesmo padrão que a HeroJornada já
           usa para o par de vídeos desktop/mobile. Antes essa escolha era
           feita em JS (`isMobile ? <Mobile/> : <Cinematic/>`), e como o SSR
           não sabe a largura real do aparelho, o servidor sempre manda a
           marcação da CinematicVersion — no celular o usuário chegava a ver,
           por um instante antes da hidratação corrigir, o vídeo 1920×1080
           do desktop (sem a contenção calculada por `stageZoom()`, que só
           existe depois do useGSAP montar): daí o vídeo "vazando" da largura,
           os flashes e o toque sem resposta logo na entrada — a seção inteira
           estava sendo desmontada e remontada bem no momento em que o usuário
           tentava interagir. Cada versão decide sozinha, lendo
           `window.innerWidth` dentro do próprio useGSAP (não por prop), se
           deve montar o próprio pin — nunca os dois ao mesmo tempo. */
        <>
          <div className="hidden lg:block">
            <CinematicVersion key="cinematic" t={t} isMobile={isMobile} />
          </div>
          <div className="block lg:hidden">
            <MobileVersion key="mobile" t={t} />
          </div>
        </>
      )}
    </div>
  )
}

/* ── MobileVersion — celular, vídeo único em retrato nativo ─────────────
 * Substitui o compartilhamento do clipe 1920×1080 do desktop (que exigia
 * `object-contain` + reescala via JS para caber no celular — ver `stageZoom`
 * na CinematicVersion, fonte da maior parte dos travamentos relatados em
 * mobile). Aqui o vídeo já nasce 1080×1920 e não precisa de reescala via JS
 * — só `object-contain`: a composição tem bastante margem em cima/embaixo e
 * pouca nas laterais, então acompanhar a LARGURA (sem cortar o frasco) e
 * deixar sobrar espaço vertical é o certo — o excedente é preenchido pelo
 * próprio fundo branco do vídeo, idêntico ao da seção, e por isso invisível.
 *
 * Mesmo contrato de gesto do HeroJornada/CinematicVersion — a DIREÇÃO do
 * gesto manda (play() nativo pra frente, passo manual de currentTime pra
 * trás, com teto de 150ms por tick — ver comentário em `tick()`), nunca
 * scrub contínuo ligado à posição do scroll/ponteiro.
 *
 * (Uma tentativa anterior trocou o reverso por um segundo `<video>` com um
 * clipe pré-gravado ao contrário, tocado nativamente — mesma técnica da
 * CinematicVersion no desktop. Gerou mais bugs do que resolveu no celular
 * real — flash da imagem final aparecendo cedo demais, mais travamentos —
 * então voltou pro passo manual de currentTime num vídeo só.)
 *
 * 4 fases de repouso: 'bottle1988' → 'bottleHoje' → 'linha' → 'catalogo'
 * (handoff pro catálogo pelos mesmos eventos `aminosan:*` que a
 * CinematicVersion já usa, então o HomeProductShowcase não precisa saber
 * qual versão rodou). Texto de fase em duas pernas independentes: a SAÍDA da
 * fase atual dispara no início do gesto (`runPhaseTextExit`, chamada por
 * `startPlayback`), a ENTRADA da próxima só perto da chegada no alvo
 * (`runPhaseTextEnter` via `maybeTriggerPhaseText`/`TEXT_LEAD`) — nenhum
 * texto de fase fica visível durante o meio da transição, só o vídeo. */
function MobileVersion({ t }: { t: TFn }) {
  const root         = useRef<HTMLDivElement>(null)
  const stageRef      = useRef<HTMLElement>(null)
  const videoRef       = useRef<HTMLVideoElement>(null)
  const catalogImgRef  = useRef<HTMLImageElement>(null)
  const act1Ref        = useRef<HTMLDivElement>(null)
  const act3Ref        = useRef<HTMLDivElement>(null)
  const lineRef        = useRef<HTMLDivElement>(null)
  const oldCalloutRef  = useRef<HTMLDivElement>(null)
  const newCalloutRef  = useRef<HTMLDivElement>(null)
  const brandMarkRef   = useRef<HTMLDivElement>(null)

  const lenis    = useLenis()
  const lenisRef = useRef(lenis)
  useEffect(() => { lenisRef.current = lenis }, [lenis])

  useGSAP(
    () => {
      // A seção existe sempre no DOM (visibilidade decidida por CSS); só o
      // lado certo do breakpoint cria pin e liga os listeners de gesto.
      if (window.innerWidth >= 1024) return
      const video = videoRef.current
      const stageTrigger = stageRef.current

      /* Congela os pontos pulsantes dos callouts enquanto a seção não está em
         cena. São quatro laços infinitos que, sem isto, seguem sendo compostos
         a cada frame pelo resto da visita — junto com os halos do globo, era o
         que fazia a metade de baixo da home ficar mais pesada. */
      let calloutIdleObserver: IntersectionObserver | null = null
      /* Marca a SEÇÃO, não o palco: parte dos callouts vive fora do
         `stageTrigger`, e a regra CSS depende de ser descendente de quem tem o
         atributo — marcando só o palco, dois pontos continuavam pulsando. */
      const idleHost = stageTrigger?.closest('#sec-origem') ?? stageTrigger
      if (idleHost) {
        calloutIdleObserver = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) idleHost.removeAttribute('data-aminosan-idle')
            else idleHost.setAttribute('data-aminosan-idle', '')
          },
          { rootMargin: '50% 0px' },
        )
        calloutIdleObserver.observe(idleHost)
        idleHost.setAttribute('data-aminosan-idle', '')
      }
      if (!video || !stageTrigger) return

      const act1Items = act1Ref.current ? gsap.utils.toArray<HTMLElement>('[data-anim]', act1Ref.current) : []
      const act3Items = act3Ref.current ? gsap.utils.toArray<HTMLElement>('[data-anim]', act3Ref.current) : []
      const lineItems = lineRef.current ? gsap.utils.toArray<HTMLElement>('[data-anim]', lineRef.current) : []

      gsap.set(video, { autoAlpha: 1 })
      gsap.set(catalogImgRef.current, { autoAlpha: 0 })
      gsap.set(act1Items, { y: 0, autoAlpha: 1 })
      gsap.set(act3Items, { y: 16, autoAlpha: 0 })
      gsap.set(lineItems, { y: 16, autoAlpha: 0 })
      gsap.set(oldCalloutRef.current, { autoAlpha: 1 })
      gsap.set(newCalloutRef.current, { autoAlpha: 0 })
      gsap.set(brandMarkRef.current, { autoAlpha: 1 })

      type Phase = 'bottle1988' | 'bottleHoje' | 'linha' | 'catalogo'
      const PHASES: Phase[] = ['bottle1988', 'bottleHoje', 'linha', 'catalogo']
      const LAST = PHASES.length - 1

      let phase: Phase = 'bottle1988'
      let visualPhase: Phase | null = 'bottle1988'
      let inView = false
      let direction: 'forward' | 'backward' | null = null
      let playing = false
      let releasing = false
      let targetTime: number | null = null
      let step = 0
      let lastTime = 0
      let animFrame = 0
      let lastTickAt = 0
      let lastProgressAt = 0
      let lastSeenTime = -1
      const cooldownRef = { current: 0 }
      let wasOutside = false
      let handoffBackPending = false
      let handoffBackTimer: ReturnType<typeof setTimeout> | undefined
      // Fica true assim que o texto da fase de destino já foi disparado
      // durante o voo atual — impede o `maybeTriggerPhaseText` de disparar
      // de novo a cada tick enquanto o vídeo ainda se aproxima do alvo.
      let textTriggered = false

      /* Duração real do clipe: 5,78s. Os pontos 2 e 3 vieram no briefing como
         "01:15"/"03:10", mas isso é notação segundo:frame (30fps) do editor,
         não minuto:segundo — confirmado extraindo os frames em 1,5s e 3,33s e
         comparando com as artes de referência (frasco atual / linha completa).
         `getTargets()` lê a duração real do elemento assim que ela existe, com
         o valor medido como fallback antes do metadata carregar. */
      const FALLBACK_DURATION = 5.78
      const getTargets = () => {
        const d = video.duration > 0 && isFinite(video.duration) ? video.duration : FALLBACK_DURATION
        const safeEnd = Math.max(3.6, d - 0.08)
        return [0, 1.5, 10 / 3, safeEnd]
      }

      const clearHandoffBack = () => {
        handoffBackPending = false
        clearTimeout(handoffBackTimer)
      }
      const onPrepareHandoffBackward = () => {
        handoffBackPending = true
        clearTimeout(handoffBackTimer)
        handoffBackTimer = setTimeout(clearHandoffBack, 2500)
      }
      window.addEventListener('aminosan:prepare-handoff-backward', onPrepareHandoffBackward)

      let pinTrigger: ScrollTrigger | null = null

      const phaseY = (i: number) => {
        if (!pinTrigger) return window.scrollY
        return Math.round(pinTrigger.start + ((pinTrigger.end - pinTrigger.start) * i) / LAST)
      }
      const snapToPhase = () => {
        if (!pinTrigger) return
        const y = phaseY(PHASES.indexOf(phase))
        if (Math.abs(window.scrollY - y) < 2) return
        lenisRef.current?.scrollTo(y, { immediate: true, force: true } as never)
        window.scrollTo(0, y)
        /* `window.scrollTo` é síncrono, mas o pin do ScrollTrigger só
           reage ao evento nativo `scroll` — que o navegador dispara um
           tick depois, não no mesmo frame. Nesse intervalo o palco pinado
           ainda está posicionado pra o scrollY ANTERIOR, então o frame que
           o navegador pinta nesse meio-tempo mostra a seção fora do
           lugar — expõe o branco por trás por um frame, a piscada
           reportada bem no instante de estacionar. `ScrollTrigger.update()`
           força o recálculo na hora, sem esperar o próximo evento. */
        ScrollTrigger.update()
      }

      const safeDur = (v: HTMLVideoElement) => (v.duration > 0 && isFinite(v.duration)) ? v.duration : FALLBACK_DURATION

      const lockScroll = (on: boolean) => {
        // No mobile o Lenis não existe (SmoothScroll não instancia abaixo de
        // 1024px) — quem trava de verdade é o preventDefault do touchmove lá
        // embaixo. Aqui é só para o caso raro de teclado/trackpad externo.
        if (on) lenisRef.current?.stop()
        else lenisRef.current?.start()
      }

      const showPhaseText = (items: HTMLElement[], delay = 0) => {
        gsap.killTweensOf(items)
        gsap.to(items, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.07, delay, ease: EASE.reveal, overwrite: 'auto' })
      }
      const hidePhaseText = (items: HTMLElement[]) => {
        gsap.killTweensOf(items)
        gsap.to(items, { y: -16, autoAlpha: 0, duration: 0.28, stagger: 0.02, ease: 'power1.in', overwrite: 'auto' })
      }
      const setPhaseTextStatic = (items: HTMLElement[], visible: boolean) => {
        gsap.killTweensOf(items)
        gsap.set(items, visible ? { y: 0, autoAlpha: 1 } : { y: 16, autoAlpha: 0 })
      }

      /* Ponte fixa pro catálogo: cobre a viewport inteira (z-80) exatamente
         como o trioImg da CinematicVersion — é o que evita o flash do salto
         de scroll entre o fim desta seção e o still que o HomeProductShowcase
         assume em seguida. */
      const showCatalogOverlay = () => {
        gsap.set(catalogImgRef.current, {
          autoAlpha: 1, display: 'block', position: 'fixed',
          top: 0, left: 0, right: 'auto', bottom: 'auto',
          width: '100%', height: '100dvh', zIndex: 80, pointerEvents: 'none',
        })
      }
      const clearCatalogOverlay = () => {
        gsap.set(catalogImgRef.current, {
          autoAlpha: 0,
          clearProps: 'display,position,top,right,bottom,left,width,height,zIndex,pointerEvents',
        })
      }

      const releaseForward = () => {
        releasing = true
        lockScroll(false)
        const fallback = pinTrigger ? pinTrigger.end + window.innerHeight : window.scrollY
        const next = document.getElementById('sec-produtos')
        const measured = next ? Math.round(next.getBoundingClientRect().top + window.scrollY) : null
        const y = measured !== null && measured >= fallback - 2 ? measured : Math.round(fallback)
        lenisRef.current?.scrollTo(y, { immediate: true, force: true } as never)
        window.scrollTo(0, y)
        /* `.refresh()` (não `.update()`) recalcula com reflow forçado a
           posição de TODOS os ScrollTriggers da página — pesado demais para
           rodar no mesmo frame em que a ponte para o catálogo aparece e o
           encolhimento do frasco começa (HomeProductShowcase). É essa
           combinação que derruba frame em aparelho real e lê como uma
           piscada na transição. `.update()` só reflete o scroll já aplicado
           nos triggers existentes, sem remedir layout — mesma correção já
           aplicada no releaseForward do desktop (ver linha ~1573). */
        ScrollTrigger.update()
        requestAnimationFrame(() => { releasing = false })
      }

      const finishExit = () => {
        window.dispatchEvent(new CustomEvent('aminosan:prepare-handoff-forward'))
        releaseForward()
        clearCatalogOverlay()
        window.dispatchEvent(new CustomEvent('aminosan:handoff-forward'))
        window.dispatchEvent(new CustomEvent('aminosan:video-handoff-end'))
      }

      // ── Estados estáticos: cada fase de repouso descrita por inteiro ──────
      /* Todo estado de repouso passa por aqui. Só reseekar o vídeo se ele
         estiver visivelmente longe do alvo (a chegada natural do
         tick/timeupdate já para a ~0,02–0,05s dele; o passo do reverso tem
         teto de 150ms, então uma parada um pouco mais folgada ainda é
         esperada) — reseekar de novo por cima de um frame que já está quase
         certo é o que causava flash: um seek redundante ainda dispara o
         pipeline de decodificação do navegador, mesmo pra um pulo pequeno. */
      const restoreForwardVideo = (targetTime2: number | null) => {
        const v = videoRef.current
        if (v) {
          if (targetTime2 !== null && Math.abs(v.currentTime - targetTime2) > 0.25) {
            try { v.currentTime = targetTime2 } catch {}
          }
          try { v.pause() } catch {}
        }
        gsap.set(video, { autoAlpha: 1 })
      }
      const showStaticBottle1988 = () => {
        restoreForwardVideo(0)
        clearCatalogOverlay()
        setPhaseTextStatic(act1Items, true)
        setPhaseTextStatic(act3Items, false)
        setPhaseTextStatic(lineItems, false)
        gsap.set(oldCalloutRef.current, { autoAlpha: 1 })
        gsap.set(newCalloutRef.current, { autoAlpha: 0 })
        gsap.set(brandMarkRef.current, { autoAlpha: 1 })
        visualPhase = 'bottle1988'
      }
      const showStaticBottleHoje = () => {
        restoreForwardVideo(getTargets()[1])
        clearCatalogOverlay()
        setPhaseTextStatic(act1Items, false)
        setPhaseTextStatic(act3Items, true)
        setPhaseTextStatic(lineItems, false)
        gsap.set(oldCalloutRef.current, { autoAlpha: 0 })
        gsap.set(newCalloutRef.current, { autoAlpha: 1 })
        gsap.set(brandMarkRef.current, { autoAlpha: 1 })
        visualPhase = 'bottleHoje'
      }
      const showStaticLinha = () => {
        restoreForwardVideo(getTargets()[2])
        clearCatalogOverlay()
        setPhaseTextStatic(act1Items, false)
        setPhaseTextStatic(act3Items, false)
        setPhaseTextStatic(lineItems, true)
        gsap.set(oldCalloutRef.current, { autoAlpha: 0 })
        gsap.set(newCalloutRef.current, { autoAlpha: 0 })
        gsap.set(brandMarkRef.current, { autoAlpha: 0 })
        visualPhase = 'linha'
      }
      const showStaticCatalogo = () => {
        restoreForwardVideo(null)
        setPhaseTextStatic(act1Items, false)
        setPhaseTextStatic(act3Items, false)
        setPhaseTextStatic(lineItems, false)
        gsap.set([oldCalloutRef.current, newCalloutRef.current, brandMarkRef.current], { autoAlpha: 0 })
        showCatalogOverlay()
        visualPhase = 'catalogo'
      }
      const applyPhaseVisuals = (p: Phase) => {
        if (p === 'bottle1988') showStaticBottle1988()
        else if (p === 'bottleHoje') showStaticBottleHoje()
        else if (p === 'linha') showStaticLinha()
        else showStaticCatalogo()
      }
      const enforceVisuals = () => {
        if (playing || releasing) return
        if (visualPhase === phase) return
        applyPhaseVisuals(phase)
      }
      const abortPlayback = (snap = false) => {
        const v = videoRef.current
        if (v) { try { v.pause() } catch {} }
        if (animFrame) cancelAnimationFrame(animFrame)
        animFrame = 0
        playing = false
        direction = null
        targetTime = null
        releasing = false
        lockScroll(false)
        const i = Math.min(Math.max(step, 0), LAST)
        phase = PHASES[i] === 'catalogo' ? 'linha' : PHASES[i]
        step = PHASES.indexOf(phase)
        applyPhaseVisuals(phase)
        if (snap) snapToPhase()
        /* 350ms era mais longo que a folga entre um ato e o gesto seguinte:
           quem já estava arrastando batia na trava e não via resposta. */
        cooldownRef.current = performance.now() + 140
        drainPending()
      }

      const updateActivePhase = (time: number) => {
        const targets = getTargets()
        if (time < targets[1] - 0.15) phase = 'bottle1988'
        else if (time < targets[2] - 0.15) phase = 'bottleHoje'
        else if (time < targets[3] - 0.15) phase = 'linha'
        else phase = 'catalogo'
      }

      /* Saída da fase que está sendo deixada — dispara IMEDIATAMENTE no
         início do gesto (chamada por `startPlayback`), nunca esperando o
         vídeo se mexer. `runPhaseTextEnter` (abaixo) faz o par: só entra
         perto da chegada na fase seguinte. Entre as duas, nenhum texto de
         fase fica visível — é o vídeo sozinho contando a transição. */
      const runPhaseTextExit = (dir: 'forward' | 'backward', s: number) => {
        if (dir === 'forward') {
          if (s === 1) {
            hidePhaseText(act1Items)
            gsap.to(oldCalloutRef.current, { autoAlpha: 0, duration: 0.2, overwrite: 'auto' })
          } else if (s === 2) {
            hidePhaseText(act3Items)
            gsap.to([newCalloutRef.current, brandMarkRef.current], { autoAlpha: 0, duration: 0.2, overwrite: 'auto' })
          } else if (s === 3) {
            hidePhaseText(lineItems)
            window.dispatchEvent(new CustomEvent('aminosan:video-handoff-start'))
          }
        } else {
          if (s === 0) {
            hidePhaseText(act3Items)
            gsap.to(newCalloutRef.current, { autoAlpha: 0, duration: 0.15, overwrite: 'auto' })
          } else if (s === 1) {
            hidePhaseText(lineItems)
          } else if (s === 2) {
            gsap.to(catalogImgRef.current, { autoAlpha: 0, duration: 0.18, ease: 'power1.out', overwrite: true })
          }
        }
      }

      /* Entrada da fase de chegada — ver `maybeTriggerPhaseText` pra quando
         ela dispara (perto do alvo, não no início do gesto). */
      const runPhaseTextEnter = (dir: 'forward' | 'backward', s: number) => {
        if (dir === 'forward') {
          if (s === 1) {
            showPhaseText(act3Items)
            gsap.to(newCalloutRef.current, { autoAlpha: 1, duration: 0.3, delay: 0.15, overwrite: 'auto' })
          } else if (s === 2) {
            showPhaseText(lineItems)
          }
        } else {
          if (s === 0) {
            showPhaseText(act1Items)
            gsap.to(oldCalloutRef.current, { autoAlpha: 1, duration: 0.3, delay: 0.1, overwrite: 'auto' })
            gsap.to(brandMarkRef.current, { autoAlpha: 1, duration: 0.3, overwrite: 'auto' })
          } else if (s === 1) {
            gsap.to(brandMarkRef.current, { autoAlpha: 1, duration: 0.3, overwrite: 'auto' })
            showPhaseText(act3Items)
            gsap.to(newCalloutRef.current, { autoAlpha: 1, duration: 0.3, delay: 0.1, overwrite: 'auto' })
          } else if (s === 2) {
            showPhaseText(lineItems)
          }
        }
      }

      /* Dispara a ENTRADA quando o vídeo ainda está a `TEXT_LEAD` segundos
         (ou menos) do alvo — não no instante em que o gesto começa (a saída,
         essa sim, dispara no início — ver `runPhaseTextExit` em
         `startPlayback`). `showPhaseText` leva ~0,4–0,6s pra assentar
         (duração + stagger), então isto faz o texto terminar de entrar
         praticamente junto com o vídeo parando — "estacionam" juntos, como
         pedido. `textTriggered` garante um disparo só por voo. */
      const TEXT_LEAD = 0.55
      const maybeTriggerPhaseText = (fwdTimeNow: number) => {
        if (textTriggered || targetTime === null || direction === null) return
        const dist = direction === 'forward' ? (targetTime - fwdTimeNow) : (fwdTimeNow - targetTime)
        if (dist > TEXT_LEAD) return
        textTriggered = true
        runPhaseTextEnter(direction, step)
      }

      /* Checagem de "chegou no alvo" independente do rAF: `timeupdate` é
         disparado pelo próprio pipeline de mídia (não pelo compositor), então
         continua chegando mesmo se o rAF atrasar (aba ocupada, GC, o que for)
         — sem isto, um rAF atrasado deixa o vídeo tocar direto até o fim
         antes de o próximo tick notar que já passou do alvo. `tick()` chama a
         mesma função; os dois caminhos convergem no mesmo `stopPlayback()`. */
      const checkForwardLimit = () => {
        if (!playing || direction !== 'forward') return
        const v = videoRef.current
        if (!v || targetTime === null) return
        maybeTriggerPhaseText(v.currentTime)
        const limit = targetTime >= v.duration - 0.1 ? v.duration - 0.05 : targetTime - 0.02
        if (v.currentTime >= limit || v.ended) {
          try { v.pause() } catch {}
          stopPlayback()
        }
      }

      const tick = (now: number) => {
        const v = videoRef.current
        if (!v) { stopPlayback(); return }
        if (!playing) return
        const target = targetTime
        if (target === null) return

        lastTickAt = now
        const seen = v.currentTime
        if (Math.abs(seen - lastSeenTime) > 0.001) {
          lastSeenTime = seen
          lastProgressAt = now
        } else if (now - lastProgressAt > 1600) {
          try { v.pause() } catch {}
          try { v.currentTime = target } catch {}
          stopPlayback()
          return
        }

        if (direction === 'forward') {
          lastTime = now
          checkForwardLimit()
          if (!playing) return
          if (v.paused && !v.ended) void v.play().catch(() => {})
        } else if (direction === 'backward') {
          if (!v.paused) v.pause()
          if (v.seeking) { animFrame = requestAnimationFrame(tick); return }
          // Teto de 150ms de vídeo por tick: sem ele, um rAF atrasado (thread
          // ocupada, aparelho mais fraco) faz `elapsed` saltar — e o passo
          // seguinte pula direto por cima de um ou mais pontos de pausa antes
          // de o `if` abaixo notar que já passou do alvo. 150ms é folgado o
          // bastante pra não travar o reverso num aparelho só um pouco mais
          // lento (as fases ficam a 1,5s+ uma da outra — nenhum tick sozinho
          // alcança a próxima), mas segura o estrago de um engasgo real.
          const elapsed = Math.min((now - lastTime) / 1000, 0.15)
          lastTime = now
          const current = v.currentTime
          const nextTime = Math.max(0, current - elapsed)
          try { v.currentTime = nextTime } catch {}
          maybeTriggerPhaseText(nextTime)
          if (nextTime <= target + 0.02) { stopPlayback(); return }
        }
        updateActivePhase(v.currentTime)
        animFrame = requestAnimationFrame(tick)
      }

      const startPlayback = (dir: 'forward' | 'backward', target: number) => {
        const v = videoRef.current
        if (!v) return
        if (animFrame) cancelAnimationFrame(animFrame)
        direction = dir
        targetTime = target
        playing = true
        visualPhase = null
        textTriggered = false
        lastTickAt = performance.now()
        lastProgressAt = lastTickAt
        lastSeenTime = -1
        lockScroll(true)
        runPhaseTextExit(dir, step)

        if (dir === 'forward') {
          void v.play().catch(() => {})
        } else {
          v.pause()
          const duration = safeDur(v)
          if (v.currentTime >= duration - 0.05) { try { v.currentTime = duration - 0.1 } catch {} }
        }
        lastTime = performance.now()
        animFrame = requestAnimationFrame(tick)
      }

      const stopPlayback = () => {
        // `checkForwardLimit` roda tanto no rAF quanto no `timeupdate` — os
        // dois podem chegar a discordar sobre o exato mesmo alvo (um evento
        // por trás do outro), e sem esta guarda o segundo re-executa toda a
        // troca de fase/scroll em cima de um estado que já parou.
        if (!playing) return
        if (animFrame) cancelAnimationFrame(animFrame)
        playing = false
        direction = null

        if (step === 1) {
          phase = 'bottleHoje'
          showStaticBottleHoje()
          snapToPhase()
        } else if (step === 2) {
          phase = 'linha'
          window.dispatchEvent(new CustomEvent('aminosan:video-handoff-end'))
          showStaticLinha()
          snapToPhase()
        } else if (step === 3) {
          phase = 'catalogo'
          showStaticCatalogo()
          finishExit()
        } else {
          phase = 'bottle1988'
          showStaticBottle1988()
          snapToPhase()
        }
        lockScroll(false)
        /* 350ms era mais longo que a folga entre um ato e o gesto seguinte:
           quem já estava arrastando batia na trava e não via resposta. */
        cooldownRef.current = performance.now() + 140
        drainPending()
      }

      /* Mata o momentum/inércia nativo do touch (iOS/Android) na hora — não
         espera ele desacelerar sozinho. O problema que isto resolve: o
         usuário chega nesta seção com um flick vindo de CIMA (rolando a
         página normal, ainda fora do pin). Assim que o dedo solta, o
         navegador entra em rolagem por inércia — uma animação PRÓPRIA dele,
         fora do controle de `touchmove`/`preventDefault` (que só vale
         enquanto o dedo está na tela). Essa inércia atravessa o começo do
         pin e continua rolando `window.scrollY` para dentro do range dele
         (por ser `pin:true`, o palco fica visualmente parado — nada anima,
         nada muda na tela — mas o scroll interno continua avançando sozinho,
         sem nenhum `stepForward()` ter sido chamado). O PRIMEIRO gesto real
         do usuário depois disso cai bem no meio dessa inércia ainda ativa,
         competindo com ela — é exatamente a sensação de "travado, demora pra
         sair da fase 1" relatada, e só acontece na ENTRADA porque é o único
         momento em que o scroll não é 100% controlado por `snapToPhase()`
         (todo passo seguinte já parte de uma posição exata escrita por nós).
         `overflow: hidden` por um frame é a técnica padrão pra isso: torna o
         documento não-rolável por um instante, o que força o navegador a
         abortar qualquer animação de inércia em andamento; ao devolver o
         overflow, o scroll já está parado e `snapToPhase()` (chamado logo
         em seguida) alinha no pixel exato da fase 1 — sem inércia residual
         pra brigar com o próximo gesto do usuário.

         A implementação vive em `@/features/animation/killMomentumScroll`:
         o catálogo de produtos chama a mesma coisa, e duas cópias com estado
         próprio (uma por seção) se atropelavam — a segunda guardava o
         `overflow: hidden` da primeira como valor a restaurar e a página
         ficava sem scroll nativo. */

      pinTrigger = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: `+=${LAST * 100}%`,
        pin: stageTrigger,
        pinSpacing: true,
        anticipatePin: 1,
        onEnter: () => { killMomentumScroll(); if (!playing) snapToPhase() },
        onEnterBack: () => { killMomentumScroll(); if (!playing) snapToPhase() },
      })

      const canStep = () => !playing && !releasing && performance.now() >= cooldownRef.current

      /* Gesto que chega durante um ato fica guardado em vez de sumir — mesmo
         contrato da versão cinematográfica, ver o comentário longo lá. */
      let pendingStep: 'forward' | 'backward' | null = null

      const stepForward = () => {
        if (releasing) return
        const targets = getTargets()
        if (playing) {
          if (direction === 'backward') {
            const next = step + 1
            if (next > LAST) return
            step = next
            startPlayback('forward', targets[next])
            return
          }
          if (step < LAST) pendingStep = 'forward'
          return
        }
        if (!canStep()) {
          if (!releasing) pendingStep = 'forward'
          return
        }
        const i = PHASES.indexOf(phase)
        if (i >= LAST) return
        step = i + 1
        startPlayback('forward', targets[step])
      }

      const stepBackward = () => {
        if (releasing) return
        const targets = getTargets()
        if (playing) {
          if (direction === 'forward') {
            const prev = step - 1
            if (prev < 0) return
            step = prev
            startPlayback('backward', targets[prev])
            return
          }
          if (step > 0) pendingStep = 'backward'
          return
        }
        if (!canStep()) {
          if (!releasing) pendingStep = 'backward'
          return
        }
        const i = PHASES.indexOf(phase)
        if (i <= 0) return
        step = i - 1
        startPlayback('backward', targets[step])
      }

      /** Consome o gesto guardado assim que a cena volta ao repouso. */
      const drainPending = () => {
        const next = pendingStep
        pendingStep = null
        if (!next || playing || releasing) return
        if (next === 'forward') stepForward()
        else stepBackward()
      }

      const escapes = (down: boolean) =>
        !playing && ((down && phase === 'catalogo') || (!down && phase === 'bottle1988'))

      const active = () => {
        if (!pinTrigger || releasing) return false
        const y = window.scrollY
        return y >= pinTrigger.start - 1 && y <= pinTrigger.end + 1
      }

      const onWheel = (e: WheelEvent) => {
        if (!active() || Math.abs(e.deltaY) < 2) return
        if (escapes(e.deltaY > 0)) return
        if (e.cancelable) e.preventDefault()
        if (Math.abs(e.deltaY) < 5) return
        if (e.deltaY > 0) stepForward()
        else stepBackward()
      }

      const downKeys = ['ArrowDown', 'PageDown', ' ', 'Spacebar']
      const upKeys = ['ArrowUp', 'PageUp']
      const onKey = (e: KeyboardEvent) => {
        if (!active()) return
        const down = downKeys.includes(e.key)
        const up = upKeys.includes(e.key)
        if (!down && !up) return
        if (escapes(down)) return
        e.preventDefault()
        if (down) stepForward()
        else stepBackward()
      }

      /* ── Toque: o ato responde DURANTE o arrasto ──────────────────────
         Antes a decisão saía só no `touchend`, e um gesto valia um ato — o
         dedo podia correr 30px ou 600px, dava no mesmo. Para atravessar a
         seção o usuário precisava de um toque separado por ato, soltando o
         dedo entre cada um, sem retorno visual enquanto arrastava. É a origem
         do "esforço grande de muitos toques".

         Agora o deslocamento é medido ao longo do gesto: a cada `STEP_PX` a
         origem é reposicionada e um ato dispara. Um arrasto contínuo encadeia
         os atos naturalmente, e a resposta vem enquanto o dedo ainda está na
         tela. O `touchend` continua existindo para o flick curto — aquele que
         não chega a `STEP_PX` mas é claramente intencional — com limiar menor
         que os 30px de antes. */
      const STEP_PX = 34
      const FLICK_PX = 18

      let touchY = 0
      let steppedInGesture = false
      const onTouchStart = (e: TouchEvent) => {
        touchY = e.touches[0]?.clientY ?? 0
        steppedInGesture = false
      }
      const onTouchMove = (e: TouchEvent) => {
        if (!active()) return
        const y = e.touches[0]?.clientY ?? touchY
        const dy = touchY - y
        if (Math.abs(dy) > 4 && escapes(dy > 0)) return
        if (e.cancelable) e.preventDefault()
        if (Math.abs(dy) < STEP_PX) return
        touchY = y // reposiciona a origem: o arrasto longo encadeia atos
        steppedInGesture = true
        if (dy > 0) stepForward()
        else stepBackward()
      }
      const onTouchEnd = (e: TouchEvent) => {
        if (!active()) return
        if (steppedInGesture) return // o arrasto já resolveu
        const endY = e.changedTouches[0]?.clientY ?? touchY
        const dy = touchY - endY
        if (Math.abs(dy) < FLICK_PX) return
        if (dy > 0) stepForward()
        else stepBackward()
      }

      // 80ms (era 200ms): rede de segurança pro `killMomentumScroll` acima —
      // se sobrar QUALQUER resíduo de inércia mesmo assim, corrige rápido o
      // bastante pra não disputar posição com o próximo gesto do usuário.
      let idleTimer: ReturnType<typeof setTimeout> | undefined
      const onScroll = () => {
        clearTimeout(idleTimer)
        idleTimer = setTimeout(() => {
          if (!active() || playing) return
          enforceVisuals()
          snapToPhase()
        }, 80)
      }

      window.addEventListener('wheel', onWheel, { passive: false, capture: true })
      window.addEventListener('keydown', onKey)
      window.addEventListener('touchstart', onTouchStart, { passive: true })
      window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true })
      window.addEventListener('touchend', onTouchEnd, { passive: true })
      window.addEventListener('scroll', onScroll, { passive: true })
      video.addEventListener('timeupdate', checkForwardLimit)

      const onHandoffBackward = () => {
        clearHandoffBack()
        if (playing) return
        phase = 'catalogo'
        wasOutside = false
        showStaticCatalogo()
        snapToPhase()
        step = 2
        window.dispatchEvent(new CustomEvent('aminosan:video-handoff-start'))
        startPlayback('backward', getTargets()[2])
      }
      window.addEventListener('aminosan:handoff-backward', onHandoffBackward)

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            inView = entry.isIntersecting
            if (!entry.isIntersecting) {
              if (playing) abortPlayback(false)
              else { try { videoRef.current?.pause() } catch {} }
              wasOutside = true
              return
            }
            if (wasOutside && !playing && !handoffBackPending && (phase !== 'bottle1988' || visualPhase !== 'bottle1988')) {
              step = 0
              phase = 'bottle1988'
              showStaticBottle1988()
              snapToPhase()
            }
            wasOutside = false
          })
        },
        { threshold: 0.05 },
      )
      if (root.current) observer.observe(root.current)

      const watchdog = window.setInterval(() => {
        if (!inView) return
        if (playing) {
          if (performance.now() - lastTickAt > 1500) abortPlayback(active())
          return
        }
        enforceVisuals()
      }, 600)

      const onVisibility = () => {
        if (document.visibilityState !== 'visible') {
          if (playing) { try { videoRef.current?.pause() } catch {} }
          return
        }
        if (playing) abortPlayback(active())
        else enforceVisuals()
      }
      document.addEventListener('visibilitychange', onVisibility)

      /* Aquecimento por IDLE, não por proximidade de scroll nem atrás do
         `load` da página inteira: esperar o `window.load` (todo recurso de
         toda seção da home, não só o que está à vista) podia levar vários
         segundos numa rede mais lenta — e nesse meio-tempo um usuário que já
         começou a rolar chegava à seção ANTES do aquecimento sequer ter sido
         agendado. Era essa janela que travava o primeiro gesto bem na entrada
         (a fase 1, o primeiro frame). `requestIdleCallback` já tem seu próprio
         mecanismo de não atrapalhar trabalho crítico (cede pra o que tiver
         prioridade maior, com teto de tempo garantido) — não precisa também
         esperar o load completo por cima disso. */
      let warmed = false
      /* Depois do play()-then-pause() (aquece decodificação SEQUENCIAL, do
         início), UM seek pro fim e volta pro início (aquece decodificação por
         ACESSO ALEATÓRIO — o que o sentido de volta faz o tempo todo). Sem
         isto, a primeira busca por ponto qualquer pagava esse custo sozinha —
         a piscada/travamento bem na primeira transição de cada sentido. Só
         dois passos (não vários pontos): quanto mais essa sequência dura,
         maior a chance de ainda estar em voo quando o gesto REAL do usuário
         chega — competindo pelo decodificador logo na hora que mais importa
         responder rápido. `if (playing) return` em cada passo cede lugar na
         hora pro gesto real, mas só evita samples FUTUROS, não cancela um
         seek já em andamento — por isso manter a sequência curta. */
      const warmupSeekPoints = () => {
        const d = safeDur(video)
        const advance2 = () => { if (!playing) { try { video.currentTime = 0 } catch {} } }
        const advance1 = () => {
          if (playing) return
          try { video.currentTime = Math.max(0, d - 0.15) } catch {}
          video.addEventListener('seeked', advance2, { once: true })
        }
        advance1()
      }
      const runWarmup = () => {
        if (warmed) return
        warmed = true
        if (video.preload !== 'auto') { video.preload = 'auto'; video.load() }
        video.play().then(() => {
          if (playing) return
          video.pause()
          warmupSeekPoints()
        }).catch(() => {})
      }
      let idleHandle: number | undefined
      if (typeof window.requestIdleCallback === 'function') {
        idleHandle = window.requestIdleCallback(runWarmup, { timeout: 1500 })
      } else {
        idleHandle = window.setTimeout(runWarmup, 300)
      }
      // Sinal mais cedo ainda: o primeiro scroll da PÁGINA INTEIRA (não só a
      // proximidade desta seção) — indica que o usuário já está navegando e
      // pode chegar aqui em poucos segundos, mesmo antes do idle disparar.
      window.addEventListener('scroll', runWarmup, { once: true, passive: true })

      // Rede de segurança final: se nada acima disparar por algum motivo, a
      // proximidade de scroll cobre.
      const warmupFallback = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return
          warmupFallback.disconnect()
          runWarmup()
        },
        { rootMargin: '200% 0px' },
      )
      if (root.current) warmupFallback.observe(root.current)

      return () => {
        calloutIdleObserver?.disconnect()
        observer.disconnect()
        warmupFallback.disconnect()
        window.removeEventListener('scroll', runWarmup)
        if (idleHandle !== undefined) {
          if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleHandle)
          else window.clearTimeout(idleHandle)
        }
        window.clearInterval(watchdog)
        document.removeEventListener('visibilitychange', onVisibility)
        pinTrigger?.kill()
        pinTrigger = null
        if (animFrame) cancelAnimationFrame(animFrame)
        clearTimeout(idleTimer)
        lockScroll(false)

        window.dispatchEvent(new CustomEvent('aminosan:video-handoff-end'))
        clearHandoffBack()
        window.removeEventListener('aminosan:prepare-handoff-backward', onPrepareHandoffBackward)
        window.removeEventListener('aminosan:handoff-backward', onHandoffBackward)
        window.removeEventListener('wheel', onWheel, { capture: true })
        window.removeEventListener('keydown', onKey)
        window.removeEventListener('touchstart', onTouchStart)
        window.removeEventListener('touchmove', onTouchMove, { capture: true })
        window.removeEventListener('touchend', onTouchEnd)
        window.removeEventListener('scroll', onScroll)
        video.removeEventListener('timeupdate', checkForwardLimit)
      }
    },
    { scope: root },
  )

  return (
    <div ref={root} className="relative w-full bg-white">
      <section ref={stageRef} className="relative z-10 h-[100dvh] w-full overflow-hidden bg-white">
        <video
          ref={videoRef}
          muted playsInline preload="metadata"
          poster="/heritage/mobile/aminosan-transformacao-poster.webp"
          aria-label={t('videoAlt')}
          className="absolute inset-0 z-0 h-full w-full object-contain opacity-0"
        >
          <source src="/heritage/mobile/aminosan-transformacao.mp4" type="video/mp4" />
        </video>

        {/* Frame final do vídeo, servido como imagem (canal alfa) — vira a
            ponte fixa pro catálogo assim que o clipe termina (ver
            `showCatalogOverlay`). Mesmo papel do trioImg da CinematicVersion.
            `hidden` (display:none) na classe, não só `opacity-0`: reportaram
            essa imagem aparecendo já na fase 1, antes de qualquer vídeo tocar
            — não reproduzi em teste automatizado, mas `display:none` é a
            única garantia que não depende de CSS opacity/visibility (que
            alguns navegadores mobile ainda chegam a pintar por um frame antes
            de aplicar). `showCatalogOverlay` já seta `display:'block'`
            explicitamente por inline style, que sempre vence a classe. */}
        <Image
          ref={catalogImgRef}
          src="/heritage/mobile/aminosan-catalogo-mobile.webp"
          alt=""
          aria-hidden
          fill sizes="100vw"
          quality={85}
          className="hidden absolute inset-0 z-0 h-full w-full object-contain opacity-0"
        />

        <AminosanBrandMark refEl={brandMarkRef} />

        <div ref={act1Ref} className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between">
          <Container className="pointer-events-auto flex flex-col items-center px-md pt-[13dvh] pb-4 text-center">
            <span data-anim className="text-eyebrow text-[10px] uppercase tracking-[0.18em] text-primary">{t('eyebrow')}</span>
            <div data-anim>
              <BicolorTitle title={t('title')} titleHi={t('titleHi')} className="text-[clamp(1.75rem,7vw,3rem)] leading-tight" />
            </div>
            <p data-anim className="text-subtitle mt-2 max-w-[22rem] text-sm text-foreground/80">{t('body1')}</p>
            <p data-anim className="text-subtitle max-w-[22rem] text-sm text-foreground/80">{t('body2')}</p>
          </Container>
          <div className="pointer-events-auto pb-[5dvh] flex justify-center px-md">
            <span data-anim className="text-eyebrow text-[10px] uppercase tracking-[0.16em] text-foreground/45 text-center">{t('footerTag')}</span>
          </div>
        </div>

        <div ref={act3Ref} className="absolute inset-x-0 top-0 z-30 pointer-events-none">
          <Container className="pointer-events-auto flex flex-col items-center px-md pt-[15vh] pb-4 text-center">
            <span data-anim className="text-eyebrow text-[10px] uppercase tracking-[0.18em] text-primary">{t('a3Eyebrow')}</span>
            <div data-anim>
              <BicolorTitle title={t('a3Title')} titleHi={t('a3TitleHi')} className="text-[clamp(1.75rem,7vw,3rem)] leading-tight" />
            </div>
            <p data-anim className="text-subtitle max-w-[22rem] text-sm text-foreground/80">{t('a3Body')}</p>
          </Container>
        </div>

        <div ref={lineRef} className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between">
          <Container className="pointer-events-auto flex flex-col items-center px-md pt-[15vh] pb-4 text-center">
            <span data-anim className="text-eyebrow text-[10px] uppercase tracking-[0.18em] text-primary">{t('lineEyebrow')}</span>
            <div data-anim>
              <BicolorTitle title={t('lineTitle')} titleHi={t('lineTitleHi')} className="text-[clamp(1.75rem,7vw,3rem)] leading-tight" />
            </div>
          </Container>
          <div className="pointer-events-auto pb-[5dvh] flex justify-center px-md">
            <p data-anim className="text-subtitle max-w-[24rem] text-sm text-foreground/80 text-center">{t('lineBody')}</p>
          </div>
        </div>

        <BottleCallout refEl={oldCalloutRef} eyebrow={t('eyebrow')}>
          {t('oldBottleCaption')}
        </BottleCallout>
        <BottleCallout refEl={newCalloutRef} eyebrow={t('a3Eyebrow')}>
          {t('newBottleCaption')}
        </BottleCallout>
      </section>
    </div>
  )
}

/* ── SimpleVersion — mobile / reduced-motion ───────────────────────── */

function SimpleVersion({ t, isMobile, reduced }: { t: TFn; isMobile: boolean; reduced: boolean }) {
  const stageRef          = useRef<HTMLDivElement>(null)
  const oldImgRef         = useRef<HTMLImageElement>(null)
  const videoRef          = useRef<HTMLVideoElement>(null)
  const textCardRef       = useRef<HTMLDivElement>(null)
  const calloutsRef       = useRef<HTMLDivElement>(null)
  const calloutSectionRef = useRef<HTMLDivElement>(null)
  const lenis             = useLenis()

  useGSAP(
    () => {
      const oldImg = oldImgRef.current
      const video = videoRef.current
      const stage = stageRef.current
      if (!oldImg || !video || !stage) return

      const textItems = textCardRef.current ? gsap.utils.toArray<HTMLElement>(textCardRef.current.children) : []
      const calloutItems = calloutsRef.current ? gsap.utils.toArray<HTMLElement>(calloutsRef.current.children) : []

      if (reduced) {
        gsap.set(oldImg, { scale: 1, opacity: 1, yPercent: 0 })
        gsap.set(textItems, { y: 0, opacity: 1 })
        gsap.set(calloutItems, { y: 0, opacity: 1 })
        return
      }

      // --- Scrubbed Video Playback ---
      // O vídeo avança de acordo com o progresso do scroll do container inteiro (250vh)
      const triggerVideo = ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          if (video && video.duration) {
            video.currentTime = self.progress * video.duration
          }
        },
      })

      // --- Auto-Scroll no top -10% ---
      const triggerAutoScroll = ScrollTrigger.create({
        trigger: stage,
        start: 'top -10%',
        once: true,
        onEnter: () => {
          gsap.set(oldImg, { opacity: 0 })
          gsap.set(video, { opacity: 1 })

          if (calloutSectionRef.current) {
            lenis?.scrollTo(calloutSectionRef.current, {
              duration: 2.5,
              force: true,
              lock: true,
              ease: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
            } as any)
          }
        }
      })

      // --- Intro Animação (Garrafa subindo) ---
      const oldImgTl = gsap.timeline()
      gsap.set(oldImg, { yPercent: 100, scale: 1.04, opacity: 1 })
      oldImgTl.to(oldImg, { yPercent: 0, scale: 1, duration: 1, ease: 'none' })
      const triggerIntro = ScrollTrigger.create({
        trigger: stage,
        start: 'top 85%',
        end: 'top 15%',
        scrub: 1,
        animation: oldImgTl,
      })

      // --- Fade-out do Texto 1 ---
      // Conforme o usuário rola a partir do topo, o texto some para dar lugar à transição
      gsap.set(textItems, { y: 0, opacity: 1 }) // Começa visível no topo
      const outTl = gsap.timeline()
      outTl.to(textItems, { y: -30, opacity: 0, duration: 1, stagger: 0.1, ease: 'none' }, 0)
      const triggerOut = ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        end: 'top -50%',
        scrub: 1,
        animation: outTl,
      })

      // --- Animação dos Callouts da Seção 2 ---
      gsap.set(calloutItems, { y: 24, opacity: 0 })
      const triggerCallouts = ScrollTrigger.create({
        trigger: calloutSectionRef.current,
        start: 'top 80%',
        end: 'center 60%',
        scrub: 1,
        animation: gsap.to(calloutItems, {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: 'power1.out',
        })
      })

      return () => {
        triggerVideo.kill()
        triggerAutoScroll.kill()
        triggerIntro.kill()
        triggerOut.kill()
        triggerCallouts.kill()
      }
    },
    { dependencies: [reduced, isMobile, lenis], scope: stageRef },
  )

  return (
    <section ref={stageRef} className="relative w-full h-[250vh] bg-white">

      {/* Fundo Fixo (Sticky) - Vídeo e Imagem */}
      <div className="sticky top-0 w-full h-[100dvh] overflow-hidden bg-white flex flex-col">
        {/* Spacer invisível para empurrar a garrafa para baixo do texto */}
        <div className="shrink-0 h-[45dvh] w-full pointer-events-none" aria-hidden />
        <div className="relative flex-1 w-full mt-auto">
          <Image
            ref={oldImgRef}
            src="/heritage/desktop/morph-aminosan-1-antigo.webp"
            alt={t('oldBottleAlt')}
            fill sizes="(max-width: 1024px) 100vw, 100vw"
            quality={85}
            className="object-cover object-bottom z-10"
            priority
          />
          <video
            ref={videoRef}
            muted playsInline preload="metadata"
            poster="/heritage/desktop/morph-aminosan-1-antigo.webp"
            aria-label={t('videoAlt')}
            className="absolute inset-0 h-full w-full object-cover object-bottom opacity-0 z-0"
          >
            <source src="/heritage/desktop/morph-aminosan.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      {/* Texto 1 (Frame Inicial) - Posicionado no topo do scroll */}
      <div className="absolute top-0 left-0 w-full h-[100dvh] pointer-events-none">
        <Container className="relative z-10 flex flex-col items-center justify-start px-md pt-[15vh] pb-4 text-center pointer-events-auto">
          <div ref={textCardRef} className="flex flex-col items-center gap-3">
            <span className="text-eyebrow text-[10px] uppercase tracking-[0.18em] text-primary">{t('eyebrow')}</span>
            <BicolorTitle title={t('title')} titleHi={t('titleHi')} className="text-[clamp(1.75rem,7vw,3rem)] leading-tight" />
            <p className="text-subtitle mt-2 max-w-[22rem] text-sm text-foreground/80">{t('body1')}</p>
            <p className="text-subtitle max-w-[22rem] text-sm text-foreground/80">{t('body2')}</p>
            {reduced && <p className="text-subtitle mt-4 text-sm text-foreground/55">{t('oldBottleCaption')}</p>}
          </div>
        </Container>
      </div>

      {/* Texto 2 (Frame Final) - Posicionado ao final do super-container */}
      <div ref={calloutSectionRef} className="absolute top-[150vh] left-0 w-full min-h-[100dvh] bg-white z-20 pointer-events-auto flex flex-col justify-end">
        <div className="relative h-[70dvh] w-full overflow-hidden sm:h-[75dvh]">
          <Image
            src="/heritage/desktop/morph-aminosan-2-novo.webp"
            alt={t('newBottleAlt')}
            fill sizes="(max-width: 1024px) 100vw, 100vw"
            quality={85}
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white to-transparent" />
        </div>
        <Container className="flex flex-col items-center gap-lg py-2xl">
          <div ref={calloutsRef} className="flex w-full max-w-[28rem] flex-col items-center gap-md text-center">
            <span className="text-eyebrow text-[10px] uppercase tracking-[0.18em] text-primary">{t('a3Eyebrow')}</span>
            <BicolorTitle title={t('a3Title')} titleHi={t('a3TitleHi')} className="text-[clamp(1.75rem,7vw,3rem)] leading-tight" />
            <p className="text-subtitle max-w-[22rem] text-sm text-foreground/80">{t('a3Body')}</p>
          </div>
        </Container>
      </div>

    </section>
  )
}

/* ── CinematicVersion — desktop ─────────────────────────────────────── */
/*
 * Máquina de 4 fases de repouso: 'act1' → 'act3' → 'line' → 'exit'.
 * Cada transição é um par de clipes (forward + reverso gravado) tocado com
 * play() nativo — os clipes não têm keyframes densos o bastante para scrub
 * manual de currentTime ficar fluido (ver comentário do syncVideos).
 * Durante cada transição o scroll é travado; depois é liberado. O gesto
 * contrário no meio de uma transição não é engolido: vira o clipe no frame em
 * que ele está e o leva de volta à outra ponta do mesmo segmento (a tela segue
 * travada durante o reverso) — mesmo contrato do HeroJornada.
 */

function CinematicVersion({ t, isMobile }: { t: TFn; isMobile: boolean }) {
  const root            = useRef<HTMLDivElement>(null)
  const stageRef        = useRef<HTMLElement>(null)
  const videoRef        = useRef<HTMLVideoElement>(null)
  const oldImgRef       = useRef<HTMLImageElement>(null)
  const newImgRef       = useRef<HTMLImageElement>(null)
  const lineImgRef      = useRef<HTMLImageElement>(null)
  const trioImgRef      = useRef<HTMLImageElement>(null)
  const scrimRef        = useRef<HTMLDivElement>(null)
  const act1Ref         = useRef<HTMLDivElement>(null)
  const oldCalloutRef   = useRef<HTMLDivElement>(null)
  const newCalloutRef   = useRef<HTMLDivElement>(null)
  const leftPanelRef    = useRef<HTMLDivElement>(null)
  const linePanelRef    = useRef<HTMLDivElement>(null)
  const lineBodyRef     = useRef<HTMLParagraphElement>(null)
  const brandMarkRef    = useRef<HTMLDivElement>(null)

  const lenis    = useLenis()
  const lenisRef = useRef(lenis)
  useEffect(() => { lenisRef.current = lenis }, [lenis])

  useGSAP(
    () => {
      // A seção existe sempre no DOM (visibilidade decidida por CSS); só o
      // lado certo do breakpoint cria pin e liga os listeners de gesto — o
      // celular usa a MobileVersion, que faz este mesmo bail-out ao contrário.
      if (window.innerWidth < 1024) return
      const video = videoRef.current
      const stageTrigger = stageRef.current

      /* Congela os pontos pulsantes dos callouts enquanto a seção não está em
         cena. São quatro laços infinitos que, sem isto, seguem sendo compostos
         a cada frame pelo resto da visita — junto com os halos do globo, era o
         que fazia a metade de baixo da home ficar mais pesada. */
      let calloutIdleObserver: IntersectionObserver | null = null
      /* Marca a SEÇÃO, não o palco: parte dos callouts vive fora do
         `stageTrigger`, e a regra CSS depende de ser descendente de quem tem o
         atributo — marcando só o palco, dois pontos continuavam pulsando. */
      const idleHost = stageTrigger?.closest('#sec-origem') ?? stageTrigger
      if (idleHost) {
        calloutIdleObserver = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) idleHost.removeAttribute('data-aminosan-idle')
            else idleHost.setAttribute('data-aminosan-idle', '')
          },
          { rootMargin: '50% 0px' },
        )
        calloutIdleObserver.observe(idleHost)
        idleHost.setAttribute('data-aminosan-idle', '')
      }
      const oldImg = oldImgRef.current
      if (!video || !stageTrigger || !oldImg) return

      const allVideos = [video]
      const newImg  = newImgRef.current
      const lineImg = lineImgRef.current
      const trioImg = trioImgRef.current

      /* ── `bl()` — blur só onde ele cabe no orçamento de frame ───────────
         Esta seção animava `filter: blur()` em ~25 pontos: título quebrado em
         caracteres (cada char é um elemento), parágrafos, painéis, o frasco. No
         desktop é o que dá o ar de foco/desfoque da cena. No celular é a conta
         mais cara da home inteira: blur animado obriga o navegador a repintar e
         re-desfocar o elemento a cada frame, e aqui isso acontece com dezenas de
         elementos ao mesmo tempo, no meio de um clipe de vídeo tocando.

         Apelido local do token `blurPx` só para não repetir a chamada longa em
         23 pontos. A regra em si mora em features/animation/motion.ts.

         Nem `bl` nem `blurPx` olham para o `isMobile` que chega por prop: este
         useGSAP roda uma vez só, no mount, quando o estado do pai ainda é
         `false`. Por isso a largura é lida na hora da tween — mesmo motivo pelo
         qual o `stageZoom()` logo abaixo lê `window.innerWidth` direto. */
      const bl = blurPx

      const titleEl      = act1Ref.current?.querySelector<HTMLElement>('[data-a1-title]') ?? null
      const act1Items    = act1Ref.current ? gsap.utils.toArray<HTMLElement>('[data-a1]', act1Ref.current) : []
      const calloutLine  = oldCalloutRef.current?.querySelector<HTMLElement>('[data-line]') ?? null
      const calloutLabel = oldCalloutRef.current?.querySelector<HTMLElement>('[data-label]') ?? null
      const calloutDot = oldCalloutRef.current?.querySelector<HTMLElement>('[data-dot]') ?? null

      /* Motor central: o desfoque fica no título inteiro, nunca por caractere.
         Este reveal roda com um clipe de vídeo tocando atrás — é o pior frame
         da home para pedir sessenta desfoques de uma vez. */
      const titleReveal = createCharReveal(titleEl, { autoAlpha: true, autoRevert: false })
      const titleChars = titleReveal?.chars ?? (titleEl ? [titleEl] : [])
      const titleStagger = titleReveal?.stagger ?? STAGGER.char

      /* ── O vídeo nunca é escondido por `visibility` ────────────────────
         `autoAlpha` desliga a visibility quando a opacidade zera, e no mobile
         isso derruba a superfície de composição do <video>: um seek feito com
         ele escondido não chega a ser renderizado, e ao reexibi-lo o primeiro
         frame vem vazio. Como o palco é branco, essa lacuna aparecia como uma
         piscada bem no começo de cada transição.
         Daqui em diante o vídeo fica SEMPRE pintado, em z-0 atrás dos stills
         (z-10) e exibindo o mesmo frame que o still de cima mostra — a
         transição vira só o still saindo de cena, sem troca de camada. */
      const keepVideoPainted = (zIndex = 0) => {
        gsap.set(video, { opacity: 1, visibility: 'visible', zIndex, yPercent: 0 })
      }

      // ── Estado inicial: Ato 1 visível por padrão (sem tela branca)
      gsap.set(allVideos,    { opacity: 0, visibility: 'visible', zIndex: 0, yPercent: 80 })
      gsap.set(video, { zIndex: 1 })
      gsap.set([newImg, lineImg, trioImg], { autoAlpha: 0 })
      gsap.set(brandMarkRef.current, { autoAlpha: 1, y: 0, filter: bl(0) })
      gsap.set(oldImg,       { zIndex: 10, scale: stageZoom().bottle, autoAlpha: 0, yPercent: 80, filter: bl(0) })
      gsap.set(scrimRef.current, { autoAlpha: 1 })
      gsap.set(titleChars,   { x: 0, autoAlpha: 1 })
      gsap.set(act1Items,    { y: 0, autoAlpha: 1, filter: bl(0) })
      gsap.set(calloutLine,  { scaleX: 1, transformOrigin: 'left' })
      gsap.set(calloutDot,   { scale: 1, autoAlpha: 1 })
      gsap.set(calloutLabel, { autoAlpha: 1, x: 0 })

      const a3Eyebrow = leftPanelRef.current?.querySelector<HTMLElement>('[data-a3-tag]') ?? null
      const a3Title = leftPanelRef.current?.querySelector<HTMLElement>('[data-a3-title]') ?? null
      const a3Body = leftPanelRef.current?.querySelector<HTMLElement>('[data-a3-body]') ?? null
      const a3Line = leftPanelRef.current?.querySelector<HTMLElement>('[data-a3-line]') ?? null
      const newCalloutLine = newCalloutRef.current?.querySelector<HTMLElement>('[data-line]') ?? null
      const newCalloutLabel = newCalloutRef.current?.querySelector<HTMLElement>('[data-label]') ?? null
      const newCalloutDot = newCalloutRef.current?.querySelector<HTMLElement>('[data-dot]') ?? null
      const lineTitleEl = linePanelRef.current?.querySelector<HTMLElement>('[data-line-title]') ?? null
      const lineTitleReveal = createCharReveal(lineTitleEl, { autoAlpha: true, autoRevert: false })
      const lineTitleChars = lineTitleReveal?.chars ?? (lineTitleEl ? [lineTitleEl] : [])
      const lineTitleStagger = lineTitleReveal?.stagger ?? STAGGER.char
      const lineItems = stageTrigger ? gsap.utils.toArray<HTMLElement>('[data-line-copy]', stageTrigger) : []

      gsap.set(leftPanelRef.current, { autoAlpha: 1 }) // O painel em si fica visível, os filhos animam
      gsap.set(a3Eyebrow, { autoAlpha: 0, y: -20, filter: bl(10) })
      gsap.set(a3Title, { autoAlpha: 0, y: 30 })
      gsap.set(a3Body, { autoAlpha: 0, filter: bl(10) })
      gsap.set(a3Line, { scaleX: 0 })
      gsap.set(newCalloutLine, { scaleX: 0 })
      gsap.set(newCalloutDot, { scale: 0, autoAlpha: 0 })
      gsap.set(newCalloutLabel, { autoAlpha: 0, x: 12 })
      gsap.set([linePanelRef.current, lineBodyRef.current], { autoAlpha: 0, y: 24, filter: bl(10) })
      gsap.set(lineTitleChars, { x: 20, autoAlpha: 0 })
      gsap.set(lineItems, { autoAlpha: 0, y: 18, filter: bl(10) })

      // ── Helpers de animação
      let currentTl: gsap.core.Timeline | null = null
      let lineTl: gsap.core.Timeline | null = null
      const lockScroll = (on: boolean) => {
        // Desktop: o Lenis tem inércia própria e continuaria correndo por cima
        // do clipe. No mobile ele nem existe (SmoothScroll não instancia em
        // pointer:coarse / <1024px) — lá quem trava é o preventDefault do
        // touchmove logo abaixo.
        if (on) lenisRef.current?.stop()
        else lenisRef.current?.start()
      }

      let stIntro: ScrollTrigger | null = null
      let stIntroExit: ScrollTrigger | null = null

      type Phase = 'act1' | 'act3' | 'line' | 'exit'

      /* As 4 fases de repouso, na ordem da cadeia. O índice da fase é também o
         índice do `targets` (tempo do vídeo) e do `step` — um só número descreve
         "onde a cena está", e é ele que manda no scroll (e não o contrário). */
      const PHASES: Phase[] = ['act1', 'act3', 'line', 'exit']
      const LAST = PHASES.length - 1

      let phase: Phase = 'act1'
      /* `phase` é a INTENÇÃO da máquina; `visualPhase` é o que as camadas de
         texto e os stills realmente mostram na tela. Vira null enquanto um
         clipe roda (a cena está no meio do caminho, não representa fase
         nenhuma). Quando os dois divergem com a cena parada, alguma transição
         morreu no meio — e é exatamente aí que o texto de um ato sobrevivia
         por cima do outro. O `enforceVisuals` reescreve a fase inteira. */
      let visualPhase: Phase | null = 'act1'
      let inView = false
      let direction: 'forward' | 'backward' | null = null
      const cooldownRef = { current: 0 }
      let playing = false
      let releasing = false
      let targetTime: number | null = null
      let step = 0
      let lastTime = 0
      let animFrame = 0
      /* Sinais de vida do clipe em voo: `lastTickAt` é o último rAF (congela
         com a aba em segundo plano) e `lastProgressAt` é o último avanço real
         do currentTime (congela em buffer/decode travado). */
      let lastTickAt = 0
      let lastProgressAt = 0
      let lastSeenTime = -1
      const targets = [0, 2.64, 4.07, 5.90]

      let pinTrigger: ScrollTrigger | null = null
      /* Só é "voltar à seção" se ela chegou a sair de vista. O ato 1 descansa
         exatamente em pinTrigger.start, então o primeiro snap para o ato 2 é
         lido pelo ScrollTrigger como uma entrada no trigger e dispara onEnter —
         sem esta guarda, esse onEnter interno rebobinava a cena para o ato 1 no
         meio da própria transição. Quem levanta a flag é o IntersectionObserver
         lá embaixo. */
      let wasOutside = false

      /* O catálogo avisa que começou a sair para cima (fade branco) muito antes
         de o salto de volta acontecer. Nesse intervalo a seção pode reaparecer
         na tela — por inércia do gesto no mobile — e o IntersectionObserver
         lá embaixo leria isso como "voltou à seção", rebobinando a cena para o
         ato 1. Aí o reverso não teria mais o que reverter (a volta exige a fase
         'exit') e o usuário caía no começo da seção sem ver os vídeos. */
      let handoffBackPending = false
      let handoffBackTimer: ReturnType<typeof setTimeout> | undefined
      const clearHandoffBack = () => {
        handoffBackPending = false
        clearTimeout(handoffBackTimer)
      }
      const onPrepareHandoffBackward = () => {
        handoffBackPending = true
        clearTimeout(handoffBackTimer)
        // Rede de segurança: se a saída do catálogo morrer no meio (troca de
        // aba, refresh do ScrollTrigger), a guarda não fica presa para sempre.
        handoffBackTimer = setTimeout(clearHandoffBack, 2500)
      }
      window.addEventListener('aminosan:prepare-handoff-backward', onPrepareHandoffBackward)

      /* Posição de scroll de cada fase dentro do pin. O pin dá o trilho; quem
         escolhe o ponto exato do trilho é a máquina de fases, nunca a força do
         gesto — é isso que faz a seção parar sempre no mesmo pixel. */
      const phaseY = (i: number) => {
        if (!pinTrigger) return window.scrollY
        return Math.round(pinTrigger.start + ((pinTrigger.end - pinTrigger.start) * i) / LAST)
      }

      const snapToPhase = () => {
        if (!pinTrigger) return
        const y = phaseY(PHASES.indexOf(phase))
        if (Math.abs(window.scrollY - y) < 2) return
        lenisRef.current?.scrollTo(y, { immediate: true, force: true } as never)
        window.scrollTo(0, y)
      }

      const safeDur = (v: HTMLVideoElement) => (v.duration > 0 && isFinite(v.duration)) ? v.duration : 6

      const introTl = gsap.timeline({ paused: true })
      introTl.to(scrimRef.current, { autoAlpha: 1, duration: 0.5, ease: 'power1.out' }, 0)
      introTl.fromTo(oldImg,
        { yPercent: 80, autoAlpha: 0, filter: bl(0) },
        { yPercent: 0, autoAlpha: 1, scale: () => stageZoom().bottle, filter: bl(0), duration: 0.95, ease: 'power3.out' },
        0
      )
      /* O vídeo sobe junto com o still do frasco antigo, no mesmo movimento:
         como ele fica permanentemente pintado (ver `keepVideoPainted`), sem
         isto o frame 0 — o mesmo frasco, já assentado — apareceria parado
         atrás do frasco que entra. */
      introTl.fromTo(video,
        { yPercent: 80, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.95, ease: 'power3.out' },
        0
      )
      introTl.to(brandMarkRef.current, { y: 0, autoAlpha: 1, filter: bl(0), duration: 0.7, ease: 'power3.out' }, 0.1)
      introTl.to(titleChars,       { x: 0, autoAlpha: 1, duration: 0.72, stagger: titleStagger, ease: 'power2.out' }, 0.16)
      introTl.to(act1Items,        { y: 0, autoAlpha: 1, filter: bl(0), duration: 0.72, stagger: 0.12, ease: 'power2.out' }, 0.28)
      introTl.to(calloutLine,      { scaleX: 1, duration: 0.55, transformOrigin: 'left', ease: 'power2.out' }, 0.62)
      introTl.to(calloutDot,       { scale: 1, autoAlpha: 1, duration: 0.35, ease: 'back.out(1.8)' }, 0.92)
      introTl.to(calloutLabel,     { x: 0, autoAlpha: 1, duration: 0.48, ease: 'power2.out' }, 0.98)

      const playIntro = (restart = false) => {
        if (phase !== 'act1' || direction) return
        if (oldCalloutRef.current) gsap.set(oldCalloutRef.current, { autoAlpha: 1 })
        gsap.set(oldImg, { zIndex: 10, scale: stageZoom().bottle })
        introTl.timeScale(1)
        if (restart) introTl.restart()
        else if (introTl.progress() < 1) introTl.play()
      }

      const reverseIntro = () => {
        if (phase !== 'act1' || direction) return
        allVideos.forEach((v) => v.pause())
        // O vídeo sai de cena pelo reverso da própria intro (ele é alvo dela),
        // e não por um set que apagaria a camada.
        gsap.set(video, { zIndex: 0 })
        gsap.set(oldImg, { zIndex: 10, autoAlpha: 1, scale: stageZoom().bottle, filter: bl(0) })
        introTl.progress(1).timeScale(1.9).reverse()
      }

      stIntro = ScrollTrigger.create({
        trigger: stageTrigger,
        start: 'top 82%',
        onEnter: () => playIntro(true),
        onEnterBack: () => playIntro(true),
      })

      stIntroExit = ScrollTrigger.create({
        trigger: stageTrigger,
        start: 'top 24%',
        onEnter: () => playIntro(false),
        onLeaveBack: () => reverseIntro(),
      })

      const showAct3UI = (delay = 0) => {
        currentTl?.kill()
        if (newCalloutRef.current) gsap.set(newCalloutRef.current, { autoAlpha: 1 })
        const tl = currentTl = gsap.timeline({ delay })

        tl.to(a3Eyebrow, { y: 0, autoAlpha: 1, filter: bl(0), duration: 0.6, ease: 'power2.out' }, 0)
        tl.to(a3Title, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, 0.1)
        tl.to(a3Body, { autoAlpha: 1, filter: bl(0), duration: 0.6, ease: 'power2.out' }, 0.2)
        tl.to(a3Line, { scaleX: 1, duration: 0.5, ease: 'power2.out' }, 0.3)
        tl.to(newCalloutLine, { scaleX: 1, duration: 0.45, transformOrigin: 'left', ease: 'power2.out' }, 0.52)
        tl.to(newCalloutDot, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(1.8)' }, 0.72)
        tl.to(newCalloutLabel, { x: 0, autoAlpha: 1, duration: 0.42, ease: 'power2.out' }, 0.76)
      }

      const hideAct3UI = (delay = 0) => {
        currentTl?.kill()
        const tl = currentTl = gsap.timeline({ delay })

        tl.to(newCalloutLabel, { x: 12, autoAlpha: 0, duration: 0.14, ease: 'power2.in' }, 0)
        tl.to(newCalloutDot, { scale: 0, autoAlpha: 0, duration: 0.12, ease: 'power2.in' }, 0.03)
        tl.to(newCalloutLine, { scaleX: 0, duration: 0.14, ease: 'power2.in' }, 0.04)
        if (newCalloutRef.current) tl.to(newCalloutRef.current, { autoAlpha: 0, duration: 0.16, ease: 'power2.in' }, 0.04)
        tl.to(a3Line, { scaleX: 0, duration: 0.14, ease: 'power2.in' }, 0.07)
        tl.to(a3Body, { autoAlpha: 0, filter: bl(10), duration: 0.16, ease: 'power2.in' }, 0.08)
        tl.to(a3Title, { y: 30, autoAlpha: 0, duration: 0.16, ease: 'power2.in' }, 0.1)
        tl.to(a3Eyebrow, { y: -20, autoAlpha: 0, filter: bl(10), duration: 0.16, ease: 'power2.in' }, 0.12)
      }

      const showLineUI = (delay = 0) => {
        lineTl?.kill()
        gsap.killTweensOf([linePanelRef.current, lineBodyRef.current, ...lineItems, ...lineTitleChars])
        const tl = lineTl = gsap.timeline({ delay })

        tl.to(linePanelRef.current, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.38, ease: 'power2.out' }, 0)
        tl.to(lineItems, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.38, stagger: 0.05, ease: 'power2.out' }, 0.04)
        tl.to(lineTitleChars, { x: 0, autoAlpha: 1, duration: 0.5, stagger: lineTitleStagger, ease: 'power2.out' }, 0.08)
        tl.to(lineBodyRef.current, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.4, ease: 'power2.out' }, 0.18)
      }

      const hideLineUI = (delay = 0) => {
        lineTl?.kill()
        gsap.killTweensOf([linePanelRef.current, lineBodyRef.current, ...lineItems, ...lineTitleChars])
        const tl = lineTl = gsap.timeline({ delay })

        tl.to(lineBodyRef.current, { y: 16, autoAlpha: 0, filter: bl(8), duration: 0.2, ease: 'power2.in' }, 0)
        tl.to(lineItems, { y: -12, autoAlpha: 0, filter: bl(8), duration: 0.22, stagger: 0.03, ease: 'power2.in' }, 0)
        tl.to(lineTitleChars, { x: 16, autoAlpha: 0, filter: bl(8), duration: 0.22, stagger: 0.002, ease: 'power2.in' }, 0.02)
        tl.to(linePanelRef.current, { y: 20, autoAlpha: 0, filter: bl(10), duration: 0.2, ease: 'power2.in' }, 0.08)
      }

      /* Fim da cadeia: entrega o bastão pro catálogo. Sem isto o usuário fica
         com a seção já esgotada na tela e precisa rolar o pin inteiro no branco
         até a próxima seção aparecer. */
      const releaseForward = () => {
        releasing = true
        lockScroll(false)
        // Fim do spacer do pin = topo da próxima seção. Vale como referência
        // própria (não depende do catálogo estar montado — ele é import
        // dinâmico) e serve de sanidade: se o #sec-produtos ainda não assentou
        // o layout, o valor dele vem menor que o fim do pin, o que jogaria o
        // usuário de volta pra dentro da cadeia.
        const fallback = pinTrigger ? pinTrigger.end + window.innerHeight : window.scrollY
        const next = document.getElementById('sec-produtos')
        const measured = next ? Math.round(next.getBoundingClientRect().top + window.scrollY) : null
        const y = measured !== null && measured >= fallback - 2 ? measured : Math.round(fallback)
        lenisRef.current?.scrollTo(y, { immediate: true, force: true } as never)
        window.scrollTo(0, y)
        ScrollTrigger.update()
        requestAnimationFrame(() => { releasing = false })
      }

      const hideAct1UI = (immediate = false) => {
        introTl.pause()
        if (immediate) {
          // `gsap.set` NÃO sobrescreve tween em andamento: sem este kill, um
          // `hideAct1UI(false)`/intro ainda correndo continuaria escrevendo por
          // cima do estado que acabamos de fixar.
          gsap.killTweensOf([...titleChars, ...act1Items, calloutLine, calloutDot, calloutLabel, scrimRef.current, oldCalloutRef.current].filter(Boolean))
          gsap.set(titleChars, { x: 20, autoAlpha: 0, filter: bl(10) })
          gsap.set(act1Items, { y: 20, autoAlpha: 0, filter: bl(10) })
          gsap.set(calloutLine, { scaleX: 0 })
          gsap.set(calloutDot, { scale: 0, autoAlpha: 0 })
          gsap.set(calloutLabel, { x: 12, autoAlpha: 0 })
          gsap.set(scrimRef.current, { autoAlpha: 0 })
          if (oldCalloutRef.current) gsap.set(oldCalloutRef.current, { autoAlpha: 0 })
        } else {
          gsap.killTweensOf([...titleChars, ...act1Items, calloutLine, calloutDot, calloutLabel, scrimRef.current, oldCalloutRef.current].filter(Boolean))
          gsap.to(titleChars, { x: 20, autoAlpha: 0, duration: 0.6, stagger: titleStagger, ease: 'power1.inOut', overwrite: 'auto' })
          gsap.to(act1Items, { y: 20, autoAlpha: 0, filter: bl(10), duration: 0.6, stagger: 0.05, ease: 'power1.inOut', overwrite: 'auto' })
          gsap.to(calloutLabel, { x: 12, autoAlpha: 0, duration: 0.36, ease: 'power1.inOut', overwrite: 'auto' })
          gsap.to(calloutDot, { scale: 0, autoAlpha: 0, duration: 0.33, ease: 'power1.inOut', overwrite: 'auto' })
          gsap.to(calloutLine, { scaleX: 0, duration: 0.45, ease: 'power1.inOut', overwrite: 'auto' })
          gsap.to(scrimRef.current, { autoAlpha: 0, duration: 1.2, ease: 'power1.inOut', overwrite: 'auto' })
          if (oldCalloutRef.current) gsap.to(oldCalloutRef.current, { autoAlpha: 0, duration: 0.36, ease: 'power1.inOut', overwrite: 'auto' })
        }
      }

      const hideAct3All = (immediate = false) => {
        if (immediate) {
          /* Matar a timeline, e não só os tweens dos alvos: `showAct3UI` é
             criada com `delay` (0.6s), então nasce pendente. Só killTweensOf
             deixava a casca viva — e com ela o contador, que seguia subindo
             para +14 numa fase onde o número nem está na tela. */
          currentTl?.kill()
          currentTl = null
          gsap.killTweensOf([a3Eyebrow, a3Title, a3Body, a3Line, newCalloutLine, newCalloutDot, newCalloutLabel, newCalloutRef.current].filter(Boolean))
          gsap.set([a3Eyebrow, a3Title, a3Body, newCalloutLabel, newCalloutRef.current], { autoAlpha: 0 })
          gsap.set([a3Line, newCalloutLine], { scaleX: 0 })
          gsap.set(newCalloutDot, { scale: 0, autoAlpha: 0 })
        } else {
          hideAct3UI(0)
        }
      }

      const hideLineAll = (immediate = false) => {
        if (immediate) {
          lineTl?.kill()
          lineTl = null
          gsap.killTweensOf([linePanelRef.current, lineBodyRef.current, ...lineItems, ...lineTitleChars])
          gsap.set([linePanelRef.current, lineBodyRef.current], { autoAlpha: 0, y: 24, filter: bl(10) })
          gsap.set(lineTitleChars, { x: 20, autoAlpha: 0 })
          gsap.set(lineItems, { autoAlpha: 0, y: 18, filter: bl(10) })
        } else {
          hideLineUI(0)
        }
      }

      /* ── Estados estáticos: cada camada descrita por inteiro, sem animação ──
         São a contrapartida dos `hide*All(true)`. Nenhum deles depende de uma
         animação anterior ter chegado ao fim — é isso que permite reconstruir
         uma fase de repouso do zero depois de uma transição abortada. */
      const showAct1Static = () => {
        introTl.timeScale(1).progress(1).pause()
        gsap.killTweensOf([act1Ref.current, scrimRef.current, oldCalloutRef.current, ...titleChars, ...act1Items, calloutLine, calloutDot, calloutLabel].filter(Boolean))
        gsap.set([act1Ref.current, scrimRef.current, oldCalloutRef.current], { autoAlpha: 1 })
        gsap.set(titleChars, { x: 0, autoAlpha: 1, filter: bl(0) })
        gsap.set(act1Items, { y: 0, autoAlpha: 1, filter: bl(0) })
        gsap.set(calloutLine, { scaleX: 1, transformOrigin: 'left' })
        gsap.set(calloutDot, { scale: 1, autoAlpha: 1 })
        gsap.set(calloutLabel, { x: 0, autoAlpha: 1 })
      }

      const showAct3Static = () => {
        currentTl?.kill()
        currentTl = null
        gsap.killTweensOf([a3Eyebrow, a3Title, a3Body, a3Line, newCalloutLine, newCalloutDot, newCalloutLabel, newCalloutRef.current].filter(Boolean))
        gsap.set([a3Eyebrow, a3Title, a3Body, newCalloutRef.current], { autoAlpha: 1, y: 0, filter: bl(0) })
        gsap.set([a3Line, newCalloutLine], { scaleX: 1, transformOrigin: 'left' })
        gsap.set(newCalloutDot, { scale: 1, autoAlpha: 1 })
        gsap.set(newCalloutLabel, { autoAlpha: 1, x: 0 })
      }

      const showLineStatic = () => {
        lineTl?.kill()
        lineTl = null
        gsap.killTweensOf([linePanelRef.current, lineBodyRef.current, ...lineItems, ...lineTitleChars])
        gsap.set([linePanelRef.current, lineBodyRef.current], { autoAlpha: 1, y: 0, filter: bl(0) })
        gsap.set(lineTitleChars, { x: 0, autoAlpha: 1, filter: bl(0) })
        gsap.set(lineItems, { autoAlpha: 1, y: 0, filter: bl(0) })
      }

      /* Zoom do palco abaixo de 1024px. A arte é uma composição 1920×1080 em
         que o frasco ocupa ~14% da largura: numa tela de 390px ele sairia
         minúsculo, daí a ampliação. Só que ampliar por um número fixo (era 2,8)
         serve para tela estreita e nada mais — a 1000px de largura o mesmo 2,8
         jogava o frasco muito além do palco, cortado em cima e embaixo, com a
         copy atravessando o rótulo.
         Aqui a largura final da arte é limitada pelos DOIS eixos: nunca mais que
         2,8× a largura da tela, nunca tão grande que o frasco estoure a altura.
         Nas telas estreitas o limite de largura ganha e o resultado é o mesmo
         2,8 de antes; conforme a janela alarga, o limite de altura assume e o
         zoom cai sozinho até encontrar o enquadramento do desktop em 1024px. */
      function stageZoom() {
        const W = window.innerWidth
        const H = window.innerHeight
        if (W >= 1024) return { bottle: 1, line: 1 }
        // Largura que a arte assume dentro do box (w-full × 60dvh) no object-contain.
        const fitted = 1920 * Math.min(W / 1920, (H * 0.6) / 1080)
        if (!fitted) return { bottle: 1, line: 1 }
        return {
          bottle: Math.min(W * 2.8, H * 1.33) / fitted,
          line: Math.min(W * 1.45, H) / fitted,
        }
      }

      /* Os stills tiram o zoom do CSS e o vídeo do GSAP — publicar os dois
         números como custom property é o que mantém still e vídeo do mesmo
         tamanho na troca de um pelo outro.

         Essa divisão é EXCLUSIVA: o <video> não pode carregar a classe
         `scale-[var(--stage-zoom)]` junto. No Tailwind v4 `scale-*` compila
         para a propriedade `scale`, que é independente de `transform` e se
         multiplica com ele — com a classe E o gsap.set escrevendo, o vídeo
         saía em zoom², ~2,8× maior que o still no mobile, e a troca
         still↔vídeo pulava de tamanho. */
      const applyStageZoom = () => {
        const z = stageZoom()
        stageTrigger.style.setProperty('--stage-zoom', String(z.bottle))
        stageTrigger.style.setProperty('--stage-zoom-line', String(z.line))
        if (oldImg) gsap.set(oldImg, { scale: z.bottle })
        if (newImg) gsap.set(newImg, { scale: z.bottle })
        if (lineImg) gsap.set(lineImg, { scale: z.line })
        if (trioImg) gsap.set(trioImg, { scale: z.line })
      }

      const updateVideoScale = (video: HTMLVideoElement) => {
        const { bottle, line } = stageZoom()
        let vScale = bottle
        const cur = video.currentTime
        if (cur > targets[1] && cur < targets[2]) {
          const p = Math.max(0, Math.min(1, (cur - targets[1]) / (targets[2] - targets[1])))
          vScale = bottle + (line - bottle) * p
        } else if (cur >= targets[2]) {
          vScale = line
        }
        gsap.set(video, { scale: vScale })
      }

      applyStageZoom()
      /* O vídeo só ganha zoom por gsap.set (ver acima), então precisa nascer
         com ele: sem esta primeira chamada ele fica em scale 1 até o primeiro
         startPlayback, e um frame que apareça antes disso (decode inicial,
         reparo de fase) sairia no tamanho errado. */
      updateVideoScale(video)
      /* Só em mudança de LARGURA, mesma guarda do refresh do ScrollTrigger lá em
         cima: no mobile a altura muda sozinha quando a barra de endereço some,
         e recalcular o zoom nesse instante redimensionaria o frasco no meio do
         gesto do usuário. */
      let zoomWidth = window.innerWidth
      const onResizeZoom = () => {
        if (window.innerWidth === zoomWidth) return
        zoomWidth = window.innerWidth
        applyStageZoom()
        const v = videoRef.current
        if (v) updateVideoScale(v)
      }
      window.addEventListener('resize', onResizeZoom)

      const updateActivePhase = (time: number) => {
        if (time < targets[1] - 0.2) phase = 'act1'
        else if (time < targets[2] - 0.2) phase = 'act3'
        else if (time < targets[3] - 0.2) phase = 'line'
        else phase = 'exit'
      }

      const tick = (now: number) => {
        const video = videoRef.current
        if (!video) { stopPlayback(); return }
        if (!playing) return
        const target = targetTime
        if (target === null) return

        lastTickAt = now
        /* Clipe sem progresso: buffer, decode preso, ou aba que voltou do
           segundo plano com o vídeo fora de lugar. Fecha o passo no destino em
           vez de deixar meia transição viva na tela — o `stopPlayback` leva a
           cena para a fase de repouso inteira. Sem isto, `playing` ficava true
           para sempre: scroll travado e as duas camadas de texto na tela. */
        const seen = video.currentTime
        if (Math.abs(seen - lastSeenTime) > 0.001) {
          lastSeenTime = seen
          lastProgressAt = now
        } else if (now - lastProgressAt > 1600) {
          try { video.pause() } catch {}
          try { video.currentTime = target } catch {}
          stopPlayback()
          return
        }

        if (direction === 'forward') {
          lastTime = now
          const current = video.currentTime
          const limit = target >= video.duration - 0.1 ? video.duration - 0.05 : target - 0.02
          if (current >= limit || video.ended) {
            try { video.pause() } catch {}
            stopPlayback()
            return
          }
          if (video.paused && !video.ended) {
            void video.play().catch(() => {})
          }
        } else if (direction === 'backward') {
          if (!video.paused) video.pause()
          if (video.seeking) {
            animFrame = requestAnimationFrame(tick)
            return
          }
          const elapsed = (now - lastTime) / 1000
          lastTime = now
          const current = video.currentTime
          const nextTime = Math.max(0, current - elapsed)
          try { video.currentTime = nextTime } catch {}
          if (nextTime <= target + 0.02) { stopPlayback(); return }
        }
        updateActivePhase(video.currentTime)
        updateVideoScale(video)
        animFrame = requestAnimationFrame(tick)
      }

      /* `midFlight` = esta chamada está virando um clipe que já estava tocando
         (o gesto contrário chegou no meio da transição). O tempo do vídeo não é
         tocado em nenhum dos casos — é isso que faz o reverso sair do frame
         exato em que o usuário deu o gesto. A diferença está só nos stills:
         partindo do repouso é preciso trocar still → vídeo; em pleno voo o
         vídeo já está em cena e repor o still daria flash. */
      const startPlayback = (dir: 'forward' | 'backward', target: number, midFlight = false) => {
        const video = videoRef.current
        if (!video) return
        if (animFrame) cancelAnimationFrame(animFrame)
        direction = dir
        targetTime = target
        playing = true
        // A cena passa a não representar fase nenhuma até o próximo repouso.
        visualPhase = null
        lastTickAt = performance.now()
        lastProgressAt = lastTickAt
        lastSeenTime = -1
        lockScroll(true)
        updateVideoScale(video)

        if (dir === 'forward') {
          keepVideoPainted(1)
          if (step === 1) {
            if (midFlight) {
              // O morph já está em andamento: o frasco antigo saiu de cena e o
              // frame atual do vídeo é quem manda. Repor o still em autoAlpha 1
              // para fadear de novo piscaria o frasco antigo por cima dele.
              gsap.killTweensOf(oldImg)
              gsap.set(oldImg, { autoAlpha: 0 })
            } else {
              gsap.set(oldImg, { zIndex: 10, autoAlpha: 1, scale: stageZoom().bottle, yPercent: 0, filter: bl(0) })
              gsap.to(oldImg, { autoAlpha: 0, scale: stageZoom().bottle, filter: bl(4), duration: 0.24, ease: 'power1.inOut', overwrite: 'auto' })
            }
            hideAct1UI(false)
            showAct3UI(0.6)
          } else if (step === 2) {
            gsap.killTweensOf([oldImg, newImg, lineImg, trioImg])
            gsap.set([oldImg, lineImg, trioImg], { autoAlpha: 0 })
            /* O still do Ato 3 sai em fade sobre o vídeo (que já está no mesmo
               frame), e não num corte seco: cortar deixava o palco à mercê do
               primeiro frame do clipe, e qualquer atraso dele — comum no
               mobile — virava branco na tela. */
            gsap.to(newImg, { autoAlpha: 0, duration: 0.24, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(brandMarkRef.current, { y: -18, autoAlpha: 0, filter: bl(8), duration: 0.32, ease: 'power2.out', overwrite: true })
            hideAct3UI(0)
            showLineUI(0.4)
          } else if (step === 3) {
            gsap.to(lineImg, { autoAlpha: 0, duration: 0.24, ease: 'power1.inOut', overwrite: 'auto' })
            hideLineUI(0)
            window.dispatchEvent(new CustomEvent('aminosan:video-handoff-start'))
          }
          void video.play().catch(() => {})
        } else {
          keepVideoPainted(1)
          video.pause()
          const duration = safeDur(video)
          if (video.currentTime >= duration - 0.05) {
            try { video.currentTime = duration - 0.1 } catch {}
          }
          
          if (step === 0) {
            gsap.to(newImg, { autoAlpha: 0, duration: 0.18, ease: 'power1.out', overwrite: true })
            hideAct3UI(0)
            gsap.set([act1Ref.current, oldCalloutRef.current], { autoAlpha: 1 })
          } else if (step === 1) {
            gsap.to(lineImg, { autoAlpha: 0, duration: 0.18, ease: 'power1.out', overwrite: true })
            gsap.set(newImg, { autoAlpha: 0 })
            hideLineUI(0)
            showAct3UI(0.6)
            gsap.to(brandMarkRef.current, { y: 0, autoAlpha: 1, filter: bl(0), duration: 0.4, delay: 0.6, ease: 'power2.out', overwrite: true })
          } else if (step === 2) {
            gsap.to(trioImg, { autoAlpha: 0, duration: 0.18, ease: 'power1.out', overwrite: true })
            gsap.set(lineImg, { autoAlpha: 0 })
            showLineUI(0.4)
          }
        }
        
        lastTime = performance.now()
        animFrame = requestAnimationFrame(tick)
      }

      const showStaticAct1 = (exitAfter = false) => {
        const video = videoRef.current
        if (video) {
          video.pause()
          try { video.currentTime = 0 } catch(e) {}
          updateVideoScale(video)
          gsap.killTweensOf(video)
          keepVideoPainted(0)
        }
        // Idem `hideAct1UI(true)`: um `gsap.to` do morph ainda em voo ganharia
        // do `set` abaixo e apagaria o frasco antigo que acabamos de repor.
        gsap.killTweensOf([oldImg, newImg, lineImg, trioImg, brandMarkRef.current].filter(Boolean))
        gsap.set([newImg, lineImg, trioImg], { autoAlpha: 0 })
        hideAct3All(true)
        hideLineAll(true)
        gsap.set(oldImg, { zIndex: 10, autoAlpha: 1, scale: stageZoom().bottle, yPercent: 0, filter: bl(0) })
        gsap.set(brandMarkRef.current, { y: 0, autoAlpha: 1, filter: bl(0) })
        if (exitAfter) {
          requestAnimationFrame(() => reverseIntro())
        } else {
          showAct1Static()
        }
        visualPhase = 'act1'
      }

      const restAct3 = (immediate = false) => {
        const video = videoRef.current
        if (video) {
          keepVideoPainted(0)
          try { video.currentTime = targets[1] } catch(e) {}
          updateVideoScale(video)
        }
        gsap.killTweensOf([oldImg, newImg, lineImg, trioImg, brandMarkRef.current].filter(Boolean))
        gsap.set(newImg, { autoAlpha: 1, scale: stageZoom().bottle })
        gsap.set([lineImg, trioImg], { autoAlpha: 0 })
        gsap.set(oldImg, { autoAlpha: 0, scale: stageZoom().bottle, filter: bl(8) })
        gsap.set(brandMarkRef.current, { y: 0, autoAlpha: 1, filter: bl(0) })
        /* As camadas que NÃO são deste ato são assertadas aqui, nunca herdadas
           do `hideAct1UI`/`hideLineUI` que o `startPlayback` disparou lá atrás:
           se aqueles tweens tivessem sido mortos no meio (aba trocada, gesto
           contrário, refresh do ScrollTrigger), o texto do Ato 1 ou o painel da
           linha ficava vivo por cima do Ato 3. Quando este repouso é alcançado,
           as duas animações já tiveram tempo de sobra para terminar — forçar o
           estado final aqui é redundante no caminho feliz e salva o raro. */
        hideAct1UI(true)
        hideLineAll(true)
        if (immediate) showAct3Static()
        else showAct3UI(0)
        visualPhase = 'act3'
      }

      const restLine = (immediate = false) => {
        const video = videoRef.current
        if (video) {
          keepVideoPainted(0)
          try { video.currentTime = targets[2] } catch(e) {}
          updateVideoScale(video)
        }
        gsap.killTweensOf([oldImg, newImg, lineImg, trioImg, brandMarkRef.current].filter(Boolean))
        gsap.set(lineImg, { autoAlpha: 1, scale: stageZoom().line })
        gsap.set([newImg, trioImg], { autoAlpha: 0 })
        gsap.set(oldImg, { autoAlpha: 0, scale: stageZoom().bottle, filter: bl(8) })
        gsap.set(brandMarkRef.current, { autoAlpha: 0, y: -18, filter: bl(8) })
        hideAct1UI(true)
        hideAct3All(true)
        if (immediate) showLineStatic()
        else showLineUI(0)
        visualPhase = 'line'
      }

      const restExit = () => {
        const video = videoRef.current
        if (video) {
          keepVideoPainted(0)
          try { video.currentTime = targets[3] } catch(e) {}
          updateVideoScale(video)
        }
        gsap.killTweensOf([oldImg, newImg, lineImg, trioImg, brandMarkRef.current].filter(Boolean))
        gsap.set([oldImg, newImg, lineImg], { autoAlpha: 0 })
        hideAct1UI(true)
        hideAct3All(true)
        hideLineAll(true)
        gsap.set(trioImg, {
          autoAlpha: 1,
          display: 'block',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 'auto',
          bottom: 'auto',
          width: '100%',
          height: '100dvh',
          zIndex: 80,
          pointerEvents: 'none',
        })
        gsap.set(brandMarkRef.current, { autoAlpha: 0 })
        visualPhase = 'exit'
      }

      /* O trio em `position: fixed`/z-80 é um artefato de handoff: ele cobre a
         página inteira. Só pode existir entre o `restExit` e a entrega ao
         catálogo — em qualquer outro caminho que caia na fase 'exit' (aborto,
         reparo) ele tem que sair, senão vira uma tela cheia de imagem por cima
         de tudo. */
      const clearTrioOverlay = () => {
        gsap.set(trioImg, {
          autoAlpha: 0,
          clearProps: 'display,position,top,right,bottom,left,width,height,zIndex,pointerEvents',
        })
        gsap.set(newImg, { clearProps: 'display' })
      }

      const finishExit = () => {
        // Ordem importa: o catálogo precisa estar preparado (branco, trio
        // full-frame) ANTES de receber o scroll, senão pisca a cor dele.
        window.dispatchEvent(new CustomEvent('aminosan:prepare-handoff-forward'))
        releaseForward()
        clearTrioOverlay()
        window.dispatchEvent(new CustomEvent('aminosan:handoff-forward'))
        window.dispatchEvent(new CustomEvent('aminosan:video-handoff-end'))
      }

      /* ── Fonte única de verdade da cena parada ────────────────────────────
         Escreve TODAS as camadas de uma fase de repouso de uma vez, sem
         animação e sem depender de nada anterior. É por aqui que qualquer
         estado sujo volta a ser um estado válido. */
      const applyPhaseVisuals = (p: Phase) => {
        if (p === 'act1') showStaticAct1(false)
        else if (p === 'act3') restAct3(true)
        else if (p === 'line') restLine(true)
        else {
          restExit()
          clearTrioOverlay()
        }
      }

      /* Uma transição pode morrer sem passar pelo `stopPlayback`: a seção sai
         de vista, a aba vai para segundo plano (o rAF congela e o vídeo corre
         solto), o clipe trava no buffer. Antes, o que estivesse meio-visível
         nesse instante simplesmente ficava na tela — era assim que o texto de
         um ato acabava por cima do texto estático de outro. Agora todo aborto
         cai numa fase de repouso inteira, com o scroll destravado. */
      const abortPlayback = (snap = false) => {
        const video = videoRef.current
        if (video) { try { video.pause() } catch {} }
        if (animFrame) cancelAnimationFrame(animFrame)
        animFrame = 0
        playing = false
        direction = null
        targetTime = null
        releasing = false
        lockScroll(false)
        // O destino do passo é a fase válida mais próxima. 'exit' não é lugar
        // de descanso fora do handoff (o palco fica em branco), então um aborto
        // no último segmento volta para a linha completa.
        const i = Math.min(Math.max(step, 0), LAST)
        phase = PHASES[i] === 'exit' ? 'line' : PHASES[i]
        step = PHASES.indexOf(phase)
        applyPhaseVisuals(phase)
        if (snap) snapToPhase()
        /* 350ms era mais longo que a folga entre um ato e o gesto seguinte:
           quem já estava arrastando batia na trava e não via resposta. */
        cooldownRef.current = performance.now() + 140
        drainPending()
      }

      /* Verificação: com a cena parada, o que está na tela TEM que ser a fase
         em que a máquina diz estar. Divergiu, reescreve. É idempotente e
         no-op no caminho feliz (todo repouso já marca o `visualPhase`), então
         não briga com nenhuma animação de entrada em andamento. */
      const enforceVisuals = () => {
        if (playing || releasing) return
        if (visualPhase === phase) return
        applyPhaseVisuals(phase)
      }

      const stopPlayback = () => {
        if (animFrame) cancelAnimationFrame(animFrame)
        playing = false
        direction = null
        
        if (step === 1) {
          phase = 'act3'
          restAct3()
          snapToPhase()
        } else if (step === 2) {
          phase = 'line'
          window.dispatchEvent(new CustomEvent('aminosan:video-handoff-end'))
          restLine()
          snapToPhase()
        } else if (step === 3) {
          phase = 'exit'
          restExit()
          // finishExit já leva o scroll para o catálogo — não snapa aqui.
          finishExit()
        } else {
          phase = 'act1'
          const stageTop = stageTrigger.getBoundingClientRect().top
          showStaticAct1(stageTop > window.innerHeight * 0.24)
          snapToPhase()
        }
        lockScroll(false)
        /* 350ms era mais longo que a folga entre um ato e o gesto seguinte:
           quem já estava arrastando batia na trava e não via resposta. */
        cooldownRef.current = performance.now() + 140
        drainPending()
      }

      /* O pin é só o trilho: segura o palco colado no topo da viewport e dá
         comprimento de scroll pra seção. Ele NÃO decide mais qual ato toca —
         era esse acoplamento que quebrava no mobile, onde um único flick
         atravessa os 3 viewports do pin em ~300ms enquanto o primeiro clipe
         sozinho leva 2,6s: as janelas de progresso dos atos 2 e 3 passavam
         batido (a guarda `!playing` as descartava) e a cena morria no ato 2,
         sem nunca disparar o handoff pro catálogo. */
      pinTrigger = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: `+=${LAST * 100}%`,
        pin: stageTrigger,
        pinSpacing: true,
        anticipatePin: 1,
        // Entrar por CIMA quer dizer "começo da história": o SectionNav salta
        // direto para #sec-origem, e numa segunda visita a máquina ainda estaria
        // parada no ato em que o usuário largou — o snap de segurança puxaria a
        // página para o pixel daquele ato, abrindo a seção pelo fim.
        onEnter: () => playIntro(false),
        onEnterBack: () => playIntro(false),
      })

      /* ── Máquina de atos dirigida por GESTO (mesmo contrato do HeroJornada)
         Um gesto = um ato — inteiro, ou virado no meio pelo gesto contrário
         (nunca parcial: as duas pontas do segmento são fases de repouso).
         Enquanto a seção está pinada o scroll nativo é cancelado, então a força
         do flick não tem para onde escapar: quem posiciona a página é o
         snapToPhase, no pixel da fase. */

      const canStep = () => !playing && !releasing && performance.now() >= cooldownRef.current

      /* Reversão em pleno voo (mesmo contrato do HeroJornada): o gesto contrário
         chegando no meio de uma transição não é engolido — vira o clipe no frame
         em que ele está e o leva de volta à outra ponta do MESMO segmento.
         Quem diz qual é essa outra ponta é `step` (o índice de destino, estável),
         nunca `phase` — `phase` é derivado do currentTime pelo updateActivePhase e
         já derivou no meio do caminho.
         O cooldown fica só no caminho a partir do repouso: virar um clipe é
         resposta imediata, e um gesto longo (vários eventos de wheel no mesmo
         sentido) vira uma única vez, porque os eventos seguintes já estão no
         mesmo sentido do clipe e caem no no-op. */
      /* ── Gesto que chega cedo demais fica guardado ────────────────────
         Cada ato é um trecho de vídeo de um a três segundos, e durante a
         reprodução `canStep()` recusa qualquer comando. Só que o usuário não
         vê a máquina: ele arrasta o dedo, nada acontece, arrasta de novo,
         nada — e tem a impressão de que a seção não responde ou de que precisa
         insistir. Era daí que vinha o esforço de "muitos toques para navegar".

         Um gesto no MESMO sentido do clipe em curso agora não é descartado:
         fica guardado e é executado assim que o ato termina. Guarda-se apenas
         UM — a intenção é encadear o próximo ato, não acumular uma fila que
         atravessaria a seção inteira contra a vontade de quem rolou. O sentido
         contrário continua virando o clipe na hora, como já era. */
      let pendingStep: 'forward' | 'backward' | null = null

      const stepForward = () => {
        if (releasing) return
        if (playing) {
          // Sentido contrário: vira o clipe imediatamente (comportamento antigo).
          if (direction === 'backward') {
            const next = step + 1
            if (next > LAST) return
            step = next
            startPlayback('forward', targets[next], true)
            return
          }
          // Mesmo sentido: encadeia no fim em vez de sumir.
          if (step < LAST) pendingStep = 'forward'
          return
        }
        if (!canStep()) {
          // Dentro do cooldown o gesto também não se perde.
          if (!releasing) pendingStep = 'forward'
          return
        }
        const i = PHASES.indexOf(phase)
        if (i >= LAST) return
        step = i + 1
        startPlayback('forward', targets[step])
      }

      const stepBackward = () => {
        if (releasing) return
        if (playing) {
          if (direction === 'forward') {
            const prev = step - 1
            if (prev < 0) return
            step = prev
            startPlayback('backward', targets[prev], true)
            return
          }
          if (step > 0) pendingStep = 'backward'
          return
        }
        if (!canStep()) {
          if (!releasing) pendingStep = 'backward'
          return
        }
        const i = PHASES.indexOf(phase)
        if (i <= 0) return
        step = i - 1
        startPlayback('backward', targets[step])
      }

      /** Consome o gesto guardado assim que a cena volta ao repouso. */
      const drainPending = () => {
        const next = pendingStep
        pendingStep = null
        if (!next || playing || releasing) return
        if (next === 'forward') stepForward()
        else stepBackward()
      }

      /* Nas duas pontas da cadeia o gesto passa direto (sem preventDefault):
         é assim que o usuário sai da seção pra cima (antes do ato 1) e pra
         baixo (depois do último ato, se voltar pro fim da cadeia). */
      const escapes = (down: boolean) =>
        !playing && ((down && phase === 'exit') || (!down && phase === 'act1'))

      /* Faixa de scroll do pin, com folga de 1px nas pontas. Usar a faixa (e não
         `pinTrigger.isActive`) importa porque as fases extremas descansam
         exatamente em `start` e em `end`, onde o isActive fica na fronteira —
         e uma fase que descansa fora do "ativo" deixaria a seção sem resposta
         ao gesto seguinte. */
      const active = () => {
        if (!pinTrigger || releasing) return false
        const y = window.scrollY
        return y >= pinTrigger.start - 1 && y <= pinTrigger.end + 1
      }

      const onWheel = (e: WheelEvent) => {
        if (!active() || Math.abs(e.deltaY) < 2) return
        if (escapes(e.deltaY > 0)) return
        if (e.cancelable) e.preventDefault()
        if (Math.abs(e.deltaY) < 5) return
        if (e.deltaY > 0) stepForward()
        else stepBackward()
      }

      const downKeys = ['ArrowDown', 'PageDown', ' ', 'Spacebar']
      const upKeys = ['ArrowUp', 'PageUp']
      const onKey = (e: KeyboardEvent) => {
        if (!active()) return
        const down = downKeys.includes(e.key)
        const up = upKeys.includes(e.key)
        if (!down && !up) return
        if (escapes(down)) return
        e.preventDefault()
        if (down) stepForward()
        else stepBackward()
      }

      /* Toque: o touchmove é cancelado enquanto a seção está travada — isso
         mata o momentum do iOS na origem, então não sobra rolagem inercial
         brigando com o snap. A decisão sai no touchend: passou de 30px, vale
         um ato — e um só, tenha o dedo corrido 30px ou 600px. */
      /* ── Toque: o ato responde DURANTE o arrasto ──────────────────────
         Antes a decisão saía só no `touchend`, e um gesto valia um ato — o
         dedo podia correr 30px ou 600px, dava no mesmo. Para atravessar a
         seção o usuário precisava de um toque separado por ato, soltando o
         dedo entre cada um, sem retorno visual enquanto arrastava. É a origem
         do "esforço grande de muitos toques".

         Agora o deslocamento é medido ao longo do gesto: a cada `STEP_PX` a
         origem é reposicionada e um ato dispara. Um arrasto contínuo encadeia
         os atos naturalmente, e a resposta vem enquanto o dedo ainda está na
         tela. O `touchend` continua existindo para o flick curto — aquele que
         não chega a `STEP_PX` mas é claramente intencional — com limiar menor
         que os 30px de antes. */
      const STEP_PX = 34
      const FLICK_PX = 18

      let touchY = 0
      let steppedInGesture = false
      const onTouchStart = (e: TouchEvent) => {
        touchY = e.touches[0]?.clientY ?? 0
        steppedInGesture = false
      }
      const onTouchMove = (e: TouchEvent) => {
        if (!active()) return
        const y = e.touches[0]?.clientY ?? touchY
        const dy = touchY - y
        // Zona morta de 4px: no primeiro touchmove o dedo ainda não declarou
        // sentido. Sem isso o gesto era lido como "subindo" e escapava do
        // preventDefault, deixando alguns pixels de rolagem nativa vazarem
        // antes da trava pegar.
        if (Math.abs(dy) > 4 && escapes(dy > 0)) return
        if (e.cancelable) e.preventDefault()
        if (Math.abs(dy) < STEP_PX) return
        touchY = y // reposiciona a origem: o arrasto longo encadeia atos
        steppedInGesture = true
        if (dy > 0) stepForward()
        else stepBackward()
      }
      const onTouchEnd = (e: TouchEvent) => {
        if (!active()) return
        if (steppedInGesture) return // o arrasto já resolveu
        const endY = e.changedTouches[0]?.clientY ?? touchY
        const dy = touchY - endY
        if (Math.abs(dy) < FLICK_PX) return
        if (dy > 0) stepForward()
        else stepBackward()
      }

      /* Rede de segurança para o que não passa pelos gestos (arrastar a barra
         de rolagem, âncora do menu, "localizar na página"): ao parar de rolar
         dentro do pin, volta pro pixel da fase atual. */
      let idleTimer: ReturnType<typeof setTimeout> | undefined
      const onScroll = () => {
        clearTimeout(idleTimer)
        idleTimer = setTimeout(() => {
          if (!active() || playing) return
          // Parou de rolar dentro do pin: além do pixel, confere a cena.
          enforceVisuals()
          snapToPhase()
        }, 200)
      }

      window.addEventListener('wheel', onWheel, { passive: false, capture: true })
      window.addEventListener('keydown', onKey)
      window.addEventListener('touchstart', onTouchStart, { passive: true })
      window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true })
      window.addEventListener('touchend', onTouchEnd, { passive: true })
      window.addEventListener('scroll', onScroll, { passive: true })

      // Volta a partir do catálogo: o catálogo já preparou o frame e saltou
      // para cá. Reposiciona o scroll na fase 'exit' antes de rodar o reverso,
      // senão a fase e o pin ficam apontando para pontos diferentes da cadeia.
      const onHandoffBackward = () => {
        clearHandoffBack()
        if (playing) return
        /* O catálogo só sai para cima a partir do produto 0, que é exatamente a
           ponta 'exit' desta cadeia. Se a fase tiver derivado no caminho (um
           rebobinar do observer, um reload no meio da página), força o repouso
           'exit' em vez de desistir: desistir era o que deixava o usuário no
           início da seção sem passar pelos vídeos. */
        phase = 'exit'
        wasOutside = false
        restExit()
        snapToPhase()
        step = 2
        /* Simétrico ao passo 3 da ida: enquanto o clipe reverso roda, quem manda
           na posição da página é esta seção. O aviso desliga o `settle` do
           catálogo — sem ele, qualquer assentamento de lá puxava a página de
           volta no meio do vídeo. `stopPlayback` (step 2) dispara o `-end`. */
        window.dispatchEvent(new CustomEvent('aminosan:video-handoff-start'))
        startPlayback('backward', targets[2])
      }
      window.addEventListener('aminosan:handoff-backward', onHandoffBackward)

      // IntersectionObserver para pausar vídeos e cancelar animações quando a seção não estiver visível
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            inView = entry.isIntersecting
            if (!entry.isIntersecting) {
              /* Antes daqui saía só `playing = false` + cancelamento do rAF: a
                 cena ficava congelada no meio do clipe, com as duas camadas de
                 texto meio-visíveis, e o Lenis continuava parado porque o
                 `lockScroll(false)` nunca acontecia. O `abortPlayback` fecha a
                 cena numa fase inteira. Sem snap: o usuário está saindo, mexer
                 no scroll dele agora seria pior que o bug. */
              // `releasing` fica de fora de propósito: a entrega ao catálogo é
              // uma transição concluída, não um travamento — abortá-la desfaria
              // a fase 'exit' que o catálogo espera encontrar na volta.
              if (playing) abortPlayback(false)
              else allVideos.forEach((v) => { try { v.pause() } catch(e) {} })
              wasOutside = true
              return
            }
            /* Rebobina a cena quando o usuário REALMENTE volta à seção depois de
               tê-la deixado (salto do SectionNav, por exemplo): sem isto ela
               reabriria no ato em que ele parou. Fica aqui, e não no onEnter do
               pin, porque o palco pinado nunca sai de vista durante os snaps
               internos — então este callback só dispara em ida e volta de
               verdade. Se um clipe já está tocando, quem manda é ele (é o caso
               da volta vinda do catálogo, que entra tocando o reverso). */
            /* `visualPhase !== 'act1'` cobre o caso que escapava: um aborto no
               começo do morph deixa `phase` derivado ainda em 'act1' (quem
               escreve `phase` durante o clipe é o `updateActivePhase`, pelo
               currentTime), então a condição antiga não rebobinava nada e a UI
               do Ato 3 já iniciada pelo `showAct3UI(0.6)` ficava na tela por
               cima do frame estático do Ato 1. */
            if (wasOutside && !playing && !handoffBackPending && (phase !== 'act1' || visualPhase !== 'act1')) {
              step = 0
              phase = 'act1'
              showStaticAct1(false)
              snapToPhase()
            }
            wasOutside = false
          })
        },
        { threshold: 0.05 },
      )
      if (root.current) observer.observe(root.current)

      /* Rede final. Só custa uma comparação de string e só roda com a seção na
         tela. Cobre o que nenhum evento avisa: um clipe cujo rAF parou de
         chegar (aba em segundo plano, thread travada) e uma cena parada que,
         por qualquer motivo, não corresponde à fase da máquina. */
      const watchdog = window.setInterval(() => {
        if (!inView) return
        if (playing) {
          if (performance.now() - lastTickAt > 1500) abortPlayback(active())
          return
        }
        enforceVisuals()
      }, 600)

      /* Aba em segundo plano: o rAF congela mas o `<video>` continua correndo,
         então o clipe atravessa o alvo e volta com a cena em qualquer frame.
         Pausar na saída e fechar numa fase de repouso na volta. */
      const onVisibility = () => {
        if (document.visibilityState !== 'visible') {
          if (playing) { try { videoRef.current?.pause() } catch {} }
          return
        }
        if (playing) abortPlayback(active())
        else enforceVisuals()
      }
      document.addEventListener('visibilitychange', onVisibility)

      /* Sobe o vídeo para `preload="auto"` e decodifica o primeiro frame quando
         a seção fica a uma tela de distância — não no mount.

         O aquecimento (dar play e pausar no frame 0) evita o flash branco no
         primeiro play de verdade, mas ele obriga o aparelho a alocar decodificador
         e decodificar. O iPhone tem um número pequeno de decodificadores de
         hardware, e o hero já está segurando um: disputar o segundo enquanto o
         hero ainda toca fazia o decodificador ser trocado no meio da jornada.
         A margem de uma tela (rootMargin) é folga de sobra — o usuário ainda
         precisa atravessar a seção "Nossa História" inteira para chegar aqui. */
      const warmup = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return
          warmup.disconnect()
          allVideos.forEach((v) => {
            if (v.preload !== 'auto') { v.preload = 'auto'; v.load() }
            v.play().then(() => { if (!playing) { v.pause(); v.currentTime = 0 } }).catch(() => {})
          })
        },
        { rootMargin: '100% 0px' },
      )
      if (root.current) warmup.observe(root.current)

      return () => {
        calloutIdleObserver?.disconnect()
        observer.disconnect()
        warmup.disconnect()
        window.clearInterval(watchdog)
        document.removeEventListener('visibilitychange', onVisibility)
        stIntro?.kill()
        stIntroExit?.kill()
        introTl.kill()
        pinTrigger?.kill()
        pinTrigger = null
        titleReveal?.revert()
        lineTitleReveal?.revert()
        currentTl?.kill()
        lineTl?.kill()
        if (animFrame) cancelAnimationFrame(animFrame)
        clearTimeout(idleTimer)
        lockScroll(false)

        // Limpeza dos event listeners globais
        window.dispatchEvent(new CustomEvent('aminosan:video-handoff-end'))
        clearHandoffBack()
        window.removeEventListener('aminosan:prepare-handoff-backward', onPrepareHandoffBackward)
        window.removeEventListener('aminosan:handoff-backward', onHandoffBackward)
        window.removeEventListener('wheel', onWheel, { capture: true })
        window.removeEventListener('keydown', onKey)
        window.removeEventListener('touchstart', onTouchStart)
        window.removeEventListener('touchmove', onTouchMove, { capture: true })
        window.removeEventListener('touchend', onTouchEnd)
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onResizeZoom)
      }
    },
    { scope: root },
  )

  return (
    <div ref={root} className="relative w-full bg-white">
      <section ref={stageRef} className="relative z-10 h-[100dvh] w-full overflow-hidden bg-white">
        {/* Vídeos da cadeia — desktop e mobile compartilham os mesmos clipes.
            Cada segmento tem um clipe forward e um reverso gravado.
            Sem classe de `scale` aqui de propósito: o zoom mobile do vídeo é
            escrito pelo `updateVideoScale` (transform do GSAP), porque ele
            interpola entre o zoom do frasco e o da linha durante o clipe. Os
            stills usam a custom property; somar os dois duplicava o zoom. */}
        {/* `preload="metadata"`, promovido a "auto" pelo IntersectionObserver
            logo abaixo. O clipe tem 2,1 MB e esta seção é a TERCEIRA da home:
            com "auto" no HTML, o navegador começava a baixá-lo junto com o
            primeiro byte da página, competindo com o hero (que já tem 4,4 MB de
            vídeo próprio) pela banda que decide o LCP. Com metadata ele só
            reserva o cabeçalho até o usuário chegar perto. */}
        <video
          ref={videoRef}
          muted playsInline preload="metadata"
          poster="/heritage/desktop/morph-aminosan-1-antigo.webp"
          aria-label={t('videoAlt')}
          className={STAGE_VIDEO_CLASS}
        >
          <source src="/heritage/desktop/full-transition-aminosan.mp4" type="video/mp4" />
        </video>

        {/* z-10 — foto estática do frasco antigo */}
        <Image
          ref={oldImgRef}
          src="/heritage/desktop/morph-aminosan-1-antigo.webp"
          alt={t('oldBottleAlt')}
          fill sizes="(max-width: 1024px) 100vw, 100vw"
          quality={85}
          className={STAGE_IMAGE_CLASS}
          priority
        />

        {/* z-10 — foto estática do frasco novo */}
        <Image
          ref={newImgRef}
          src="/heritage/desktop/morph-aminosan-2-novo.webp"
          alt={t('newBottleAlt')}
          fill sizes="(max-width: 1024px) 100vw, 100vw"
          quality={85}
          className={`${STAGE_IMAGE_CLASS} opacity-0`}
          priority
        />

        {/* z-10 — still da linha completa (repouso da fase line) */}
        <Image
          ref={lineImgRef}
          src="/heritage/desktop/line-aminosan-full.webp"
          alt=""
          aria-hidden
          fill sizes="(max-width: 1024px) 100vw, 100vw"
          quality={85}
          className={`${STAGE_IMAGE_CLASS} opacity-0`}
        />

        {/* z-10 — still do trio do catálogo (fim da transição) */}
        <Image
          ref={trioImgRef}
          src="/produtos/aminosan-catalogo.png"
          alt=""
          aria-hidden
          fill sizes="(max-width: 1024px) 100vw, 100vw"
          quality={85}
          className={`${STAGE_IMAGE_CLASS} opacity-0`}
        />

        <AminosanBrandMark refEl={brandMarkRef} />

        {/* z-20 — scrim lateral para legibilidade do Ato 1 */}
        <div ref={scrimRef} aria-hidden
          className="absolute inset-x-0 top-0 lg:inset-y-0 lg:left-0 z-20 w-full h-[60%] lg:h-full lg:max-w-[40rem] bg-gradient-to-b lg:bg-gradient-to-r from-white/90 via-white/40 to-transparent"
        />

        {/* z-30 — texto do Ato 1.
            No desktop a coluna é ancorada pelo TOPO numa faixa fixa
            (`ACT_COLUMN_TOP`), não centrada: centrar cada ato pela própria
            altura fazia o título saltar ~10px na virada do Ato 1 para o Ato 3,
            porque as duas colunas têm alturas de conteúdo diferentes. Com a
            mesma âncora, os dois atos caem no mesmo pixel. */}
        <Container className={`absolute inset-0 z-30 flex h-full items-start pt-[7dvh] ${ACT_COLUMN_TOP} min-[1600px]:max-w-[100rem] min-[2000px]:max-w-[120rem]`}>
          <div ref={act1Ref} className="flex max-w-[88vw] lg:max-w-[24rem] xl:max-w-[28rem] flex-col items-start bg-transparent p-0">
            <span data-a1 className="text-eyebrow mb-1 md:mb-md text-[10px] xl:text-xs uppercase tracking-[0.18em] text-primary">
              {t('eyebrow')}
            </span>
            <div>
              <BicolorTitle data-a1-title title={t('title')} titleHi={t('titleHi')} className="text-[clamp(1.35rem,5.5vw,2.25rem)] md:text-[clamp(1.75rem,3.2vw,3.75rem)]" />
            </div>
            <div data-a1 className="mt-1.5 md:mt-md xl:mt-lg max-w-[22rem] md:max-w-none">
              <p className="text-subtitle text-xs md:text-sm xl:text-base text-foreground/80 leading-snug md:leading-normal">{t('body1')}</p>
              <p className="text-subtitle mt-1 text-xs md:text-sm xl:text-base text-foreground/80 leading-snug md:leading-normal">{t('body2')}</p>
            </div>
            <span data-a1 className="text-eyebrow mt-2 md:mt-xl xl:mt-2xl text-[10px] md:text-sm xl:text-[11px] uppercase tracking-[0.16em] text-foreground/45">
              {t('footerTag')}
            </span>
          </div>
        </Container>

        <BottleCallout refEl={oldCalloutRef} eyebrow={t('eyebrow')}>
          {t('oldBottleCaption')}
        </BottleCallout>
        {/* UI da linha completa - aparece so depois que o frasco vira portfolio. */}
        {/* +10px: afasta o bloco da navbar (estava encostando). Em dvh, não vh,
            para não pular quando a barra do navegador mobile recolhe. */}
        <Container className="pointer-events-none absolute inset-x-0 top-[calc(10dvh+10px)] z-30 flex justify-center min-[1600px]:max-w-[100rem] min-[2000px]:max-w-[120rem]">
          <div ref={linePanelRef} className="max-w-[92vw] text-center md:max-w-[68rem] xl:max-w-[74rem]">
            <span data-line-copy className="text-eyebrow mb-sm block text-[10px] uppercase tracking-[0.18em] text-primary xl:text-xs">
              {t('lineEyebrow')}
            </span>
            <BicolorTitle data-line-title title={t('lineTitle')} titleHi={t('lineTitleHi')} className="text-[clamp(1.75rem,5vw,4rem)] md:text-[clamp(1.9rem,2.6vw,2.75rem)] min-[1600px]:text-[clamp(2.15rem,3.45vw,4.15rem)]" />
          </div>
        </Container>
        {/* Abaixo de 1600px (notebooks) o texto desce para mais perto do rodapé
            da tela: o título/parágrafo menores (ver acima) deixaram sobrar
            espaço vertical, e sem isso o parágrafo ficava colado na base dos
            frascos. Em dvh para acompanhar a barra do navegador no mobile. */}
        <Container className="pointer-events-none absolute inset-x-0 bottom-[1.5dvh] z-30 flex justify-center min-[1600px]:bottom-[4dvh] min-[1600px]:max-w-[100rem] min-[2000px]:max-w-[120rem]">
          <p ref={lineBodyRef} className="text-subtitle mx-auto max-w-[50rem] text-center text-sm text-foreground/75 md:text-base min-[1600px]:text-lg">
            {t('lineBody')}
          </p>
        </Container>
        {/* UI do Ato 3 — mesmo desenho do Ato 1: coluna de texto à esquerda, frasco em cena.
            No mobile o bloco de prova (número + handoff + CTA) desce para o rodapé da tela,
            deixando o frasco visível no meio. */}
        <Container className={`relative lg:absolute lg:inset-0 z-30 flex min-h-[100dvh] lg:min-h-0 h-auto lg:h-full items-stretch lg:items-start min-[1600px]:max-w-[100rem] min-[2000px]:max-w-[120rem] pointer-events-none pt-[7dvh] ${ACT_COLUMN_TOP} pb-[8dvh] lg:pb-0`}>
          {/* pointer-events fica desligado: no mobile este painel é `relative`
              e cobre a tela inteira por cima do Ato 1 — ligado, virava uma
              camada invisível engolindo toque e seleção do texto do Ato 1. */}
          <div ref={leftPanelRef} className="pointer-events-none flex w-full flex-1 lg:flex-none lg:w-auto max-w-full lg:max-w-[24rem] xl:max-w-[28rem] flex-col items-start">
            <span data-a3-tag className="text-eyebrow mb-1 md:mb-md text-[10px] xl:text-xs uppercase tracking-[0.18em] text-primary">
              {t('a3Eyebrow')}
            </span>
            <BicolorTitle data-a3-title title={t('a3Title')} titleHi={t('a3TitleHi')} className="text-[clamp(1.35rem,5.5vw,2.25rem)] md:text-[clamp(1.75rem,3.2vw,3.75rem)]" />
            <p data-a3-body className="text-subtitle mt-1.5 md:mt-md max-w-[22rem] md:max-w-none text-xs md:text-sm xl:text-base text-foreground/80 leading-snug md:leading-normal">
              {t('a3Body')}
            </p>
            <div className="mt-auto lg:mt-0 flex flex-col items-start">
              <div data-a3-line className="my-2 md:my-lg h-px w-10 md:w-12 bg-primary/40" style={{ transformOrigin: 'left' }} />
            </div>
          </div>
        </Container>

        <BottleCallout refEl={newCalloutRef} eyebrow={t('a3Eyebrow')} className="max-lg:!top-[26dvh] max-lg:!bottom-auto">
          {t('newBottleCaption')}
        </BottleCallout>
      </section>
    </div>
  )
}

/* ── Subcomponentes ─────────────────────────────────────────────────── */

function BicolorTitle({
  title, titleHi, className = '', ...rest
}: Omit<HTMLAttributes<HTMLHeadingElement>, 'title'> & { title: string; titleHi?: string }) {
  const lead = titleHi && title.endsWith(titleHi) ? title.slice(0, -titleHi.length).trim() : title
  return (
    <h2 {...rest} className={`font-black uppercase leading-[0.98] tracking-tight ${className}`}>
      <span className="text-foreground">{lead}</span>
      {titleHi && <> <span className="text-highlight text-primary">{titleHi}</span></>}
    </h2>
  )
}

function Callout({ className = '', labelClassName = 'max-w-[12rem] xl:max-w-[14rem]', refEl, children }: {
  className?: string; labelClassName?: string; refEl?: RefObject<HTMLDivElement | null>; children: ReactNode
}) {
  return (
    <div ref={refEl} className={`absolute flex flex-col ${className}`}>
      {/* O callout é animado (entra e sai junto com o frasco) e fica sobre o
          vídeo da transição — backdrop-blur aqui é reamostrado a cada frame do
          clipe no celular. `bg-white/90` cobre o mesmo papel de dar fundo ao
          texto sem depender do que está atrás. */}
      <span data-label className={`text-subtitle rounded-2xl bg-white/90 md:bg-white/70 md:backdrop-blur-md px-4 py-3 text-xs xl:text-sm text-foreground/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-left block ${labelClassName}`}>
        {children}
      </span>
    </div>
  )
}

function AminosanBrandMark({ refEl }: { refEl: RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={refEl}
      aria-label="Aminosan registrado"
      className="pointer-events-none absolute left-1/2 top-[12dvh] z-30 -translate-x-1/2 text-center max-lg:top-[4dvh]"
    >
      <span className="font-black uppercase leading-none tracking-[0.02em] text-foreground text-[clamp(1.45rem,2.08vw,2.65rem)]">
        AMINOSAN<sup className="ml-1 align-super text-[0.36em] leading-none">&reg;</sup>
      </span>
    </div>
  )
}

function BottleCallout({
  refEl,
  eyebrow,
  className = '',
  children,
}: {
  refEl: RefObject<HTMLDivElement | null>
  eyebrow: string
  className?: string
  children: ReactNode
}) {
  return (
    <div
      ref={refEl}
      className={`aminosan-bottle-callout pointer-events-none absolute z-30 flex items-center gap-3 lg:top-1/2 lg:left-[65%] lg:-translate-y-1/2 ${className}`}
    >
      <span data-line aria-hidden className="aminosan-bottle-callout__line" style={{ transformOrigin: 'left' }} />
      <span data-dot aria-hidden className="aminosan-bottle-callout__dot" />
      <span data-label className="aminosan-bottle-callout__card">
        <span className="aminosan-bottle-callout__meta">{eyebrow}</span>
        <span className="aminosan-bottle-callout__text">{children}</span>
      </span>
    </div>
  )
}
