'use client'

import { Star, Warehouse } from 'lucide-react'

import { useRef } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { gsap, useGSAP } from '@/features/animation/gsap'
import { bindSectionReveal, createCharReveal, createTextReveal } from '@/features/animation/charReveal'
import { DUR, EASE, blurPx } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'
import { useTranslations } from 'next-intl'

export function HomeExperience() {
  const t = useTranslations('homeExperience');
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (reduced || !ref.current) return
    const visual = ref.current.querySelector<HTMLElement>('[data-exp-visual]')
    const body = ref.current.querySelector<HTMLElement>('[data-exp-body]')
    
    if (visual) gsap.set(visual, { x: -40, opacity: 0, filter: blurPx(10) })
    
    let reveal: ReturnType<typeof createCharReveal> = null
    let descReveal: ReturnType<typeof createTextReveal> = null
    if (body) {
      const kicker = body.querySelector<HTMLElement>('[data-kicker]')
      const title = body.querySelector<HTMLElement>('[data-title]')
      const line = body.querySelector<HTMLElement>('[data-gline]')
      const desc = body.querySelector<HTMLElement>('[data-desc]')
      const cta = body.querySelector<HTMLElement>('[data-cta]')

      reveal = createCharReveal(title)
      descReveal = createTextReveal(desc)

      if (kicker) gsap.set(kicker, { y: 14, opacity: 0 })
      reveal?.hide()
      if (line) gsap.set(line, { scaleX: 0, opacity: 0, transformOrigin: 'left center' })
      descReveal?.hide()
      if (cta) gsap.set(cta, { y: 20, opacity: 0 })
    }

    /* ── Celular: cada bloco entra quando é a vez DELE ────────────────
       No desktop a imagem e o texto estão lado a lado e entram na mesma tela —
       uma timeline só, na ordem escrita, resolve.

       No celular o layout empilha: imagem, depois título, depois o parágrafo e
       o botão. Com uma timeline única a ordem é sempre a mesma, escrita no
       código — o que está certo na descida e errado na volta. Subindo, quem
       reaparece primeiro pela borda de baixo é o PARÁGRAFO, mas ele continuava
       esperando o título entrar antes, porque era essa a ordem da timeline.

       A correção não é detectar a direção e inverter a lista: é dar a cada
       bloco o seu próprio gatilho. Aí a ordem deixa de ser uma decisão do
       código e passa a ser consequência da posição na página — descendo entra
       primeiro quem está em cima, subindo entra primeiro quem está embaixo,
       nos dois casos sem nenhuma lógica de direção. */
    const empilhado = window.matchMedia('(max-width: 1023px)').matches

    const kicker = body?.querySelector<HTMLElement>('[data-kicker]') ?? null
    const line = body?.querySelector<HTMLElement>('[data-gline]') ?? null
    const desc = body?.querySelector<HTMLElement>('[data-desc]') ?? null
    const cta = body?.querySelector<HTMLElement>('[data-cta]') ?? null
    const titleEl = body?.querySelector<HTMLElement>('[data-title]') ?? null

    // Bloco de cima: pré-título, título e a linha de acento.
    const animaTitulo = (tl: gsap.core.Timeline, em = 0) => {
      if (kicker) tl.to(kicker, { y: 0, opacity: 1, duration: DUR.sub }, em)
      if (reveal) reveal.playIn(tl, em + 0.1)
      if (line) tl.to(line, { scaleX: 1, opacity: 1, duration: DUR.sub }, em + 0.25)
    }
    // Bloco de baixo: parágrafo e chamada.
    const animaCorpo = (tl: gsap.core.Timeline, em = 0) => {
      if (descReveal) descReveal.playIn(tl, em)
      else if (desc) tl.to(desc, { y: 0, opacity: 1, duration: DUR.sub }, em)
      if (cta) tl.to(cta, { y: 0, opacity: 1, duration: DUR.sub }, em + 0.1)
    }
    const animaVisual = (tl: gsap.core.Timeline, em = 0) => {
      if (visual) tl.to(visual, { x: 0, opacity: 1, filter: blurPx(0), duration: 0.9 }, em)
    }

    const gatilhos: ScrollTrigger[] = []
    const cfg = { defaults: { ease: EASE.reveal } }

    if (empilhado && body && visual) {
      gatilhos.push(bindSectionReveal(visual, () => {
        const tl = gsap.timeline(cfg); animaVisual(tl); return tl
      }))
      /* Um gatilho para o bloco de texto, com a ORDEM decidida pelo sentido.
         Descendo, o olho encontra o título primeiro e o parágrafo depois.
         Subindo, a seção reaparece pela borda de cima e é o parágrafo — que
         está mais abaixo — o primeiro a surgir; o título entra em seguida. */
      /* Título e parágrafo com gatilhos SEPARADOS.
         A ordem deixa de ser uma decisão escrita no código e passa a ser
         consequência da posição de cada um na página: descendo, o título cruza
         o gatilho primeiro (está mais acima); subindo, quem cruza primeiro é o
         parágrafo, porque é ele que reaparece antes pela borda de baixo.
         Cada bloco leva a própria saída, para voltar ao estado escondido quando
         deixa a tela — sem isso, um bloco que ficasse visível "apareceria
         primeiro" na volta apenas por nunca ter sumido. */

      gatilhos.push(bindSectionReveal(titleEl ?? body, () => {
        const tl = gsap.timeline(cfg); animaTitulo(tl); return tl
      }))

      gatilhos.push(bindSectionReveal(desc ?? body, () => {
        const tl = gsap.timeline(cfg); animaCorpo(tl); return tl
      }))

    } else {
      gatilhos.push(bindSectionReveal(ref.current, () => {
        const tl = gsap.timeline(cfg)
        animaVisual(tl, 0)
        animaTitulo(tl, 0.1)
        animaCorpo(tl, 0.42)
        return tl
      }, { start: 'top 75%' }))
    }

    return () => {
      gatilhos.forEach((g) => g.kill())
      reveal?.revert()
    }
  }, { scope: ref })

  return (
    <section
      ref={ref}
      style={{ backgroundColor: '#0F1A0A', paddingBlock: 'clamp(80px, 7.5vw, 120px)' }}
    >
      <Container>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Visual — still da fábrica/galpão, no lugar do vídeo real (entra depois). */}
          <div data-exp-visual className="relative rounded-[24px] overflow-hidden aspect-[4/3]">
            <Image
              src="/experience/juma-experience-still.webp"
              alt={t('immersion')}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              quality={85}
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-black/25" />
            {/* Tag overlay */}
            {/* O backdrop-blur fica só onde há hover (desktop). No celular a tag
                entra na tela junto com o bloco visual, que é animado em `x` — e
                backdrop-filter num elemento que se move é reamostrado a cada
                frame do reveal. O fundo vai a 78% para compensar o desfoque. */}
            <div
              className="absolute bottom-5 left-5 flex items-center gap-3 rounded-[14px] px-4 py-3 bg-black/[.78] md:bg-black/60 md:backdrop-blur-[12px]"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#004B26' }}
              >
                <Warehouse width="14" height="14" color="#F0E27A" strokeWidth={2} aria-hidden />
              </div>
              <div>
                <div className="text-[13px] font-bold text-white">Juma Experience</div>
                <div className="text-[11px]" style={{ color: 'rgba(255,255,255,.55)' }}>{t('immersion')}</div>
              </div>
            </div>
          </div>

          <div data-exp-body>
            <div className="mb-8" data-kicker>
              <span className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] uppercase rounded-full px-4 py-2 mb-6 border border-white/20 text-white/80">
                <Star className="w-3.5 h-3.5 flex-shrink-0 text-[#F0E27A]" />
                {t('kicker')}
              </span>
            </div>
            <h2
              data-title
              className="font-black uppercase leading-[1.05] tracking-tight text-white"
              style={{ fontSize: 'clamp(2.5rem, 4.5vw, 4.5rem)' }}
            >
              {t('titlePart1')} <span className="text-[#F0E27A] text-highlight inline-block">{t('titleHighlight')}</span>
            </h2>
            <span data-gline aria-hidden className="mt-8 mb-6 block h-[3px] w-12 rounded-full bg-[#F0E27A]" />
            <p data-desc className="text-[17px] leading-[1.65] mb-10" style={{ color: 'rgba(255,255,255,.65)' }}>
              {t('desc')}
            </p>
            <Link
              data-cta
              href="/juma-experience"
              className="text-body-regular inline-flex items-center gap-3 rounded-full px-10 py-3 text-[13px] font-medium uppercase tracking-wider transition-colors"
              style={{ backgroundColor: '#F0E27A', color: '#1A1A1A' }}
            >
              {t('cta')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
