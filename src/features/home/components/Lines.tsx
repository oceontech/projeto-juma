'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

import { gsap, SplitText, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'

type LineKey = 'nutricao' | 'arranque' | 'protecao' | 'manejos' | 'aplicacao'

const LINE_COLORS: Record<LineKey, { accent: string; text: string }> = {
  nutricao: { accent: '#006838', text: '#fff' },
  arranque: { accent: '#008dc2', text: '#fff' },
  protecao: { accent: '#ad1115', text: '#fff' },
  manejos:  { accent: '#312783', text: '#fff' },
  aplicacao: { accent: '#79ab34', text: '#1f2e0a' },
}

const LINES: LineKey[] = ['nutricao', 'arranque', 'protecao', 'manejos', 'aplicacao']

export function Lines() {
  const t       = useTranslations('lines')
  const reduced = useReducedMotion()
  const ref     = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useGSAP(
    () => {
      if (reduced || !ref.current) return

      // Título: SplitText caracteres
      const title = titleRef.current
      const split = title
        ? new SplitText(title, { type: 'chars,lines' })
        : null
      const chars = split?.chars ?? []

      if (title) gsap.set(title, { opacity: 0 })
      if (chars.length) gsap.set(chars, { x: 20, opacity: 0, filter: 'blur(10px)' })

      const tlHead = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'play reverse play reverse',
        },
      })
      
      const gline = ref.current.querySelector<HTMLElement>('[data-gline]')
      if (gline) gsap.set(gline, { scaleX: 0, opacity: 0, transformOrigin: 'left center' })

      if (title) tlHead.set(title, { opacity: 1 }, 0)
      if (chars.length)
        tlHead.to(chars, { x: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.char, ease: EASE.reveal }, 0)
        
      if (gline)
        tlHead.to(gline, { scaleX: 1, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.2)

      // Cards de linha: clip-path reveal, um por um
      const cards = gsap.utils.toArray<HTMLElement>('[data-line-card]', ref.current)

      cards.forEach((card, i) => {
        const bar     = card.querySelector<HTMLElement>('[data-bar]')
        const content = card.querySelector<HTMLElement>('[data-line-content]')

        if (bar)     gsap.set(bar,     { scaleY: 0, transformOrigin: 'top center' })
        if (content) gsap.set(content, { y: 22, opacity: 0 })

        ScrollTrigger.create({
          trigger: card,
          start: 'top 85%',
          end: 'bottom 15%',
          onEnter: () => {
            const d = i * 0.08
            if (bar)
              gsap.to(bar, {
                scaleY: 1,
                duration: 0.85,
                delay: d,
                ease: 'power3.out',
                overwrite: 'auto'
              })
            if (content)
              gsap.to(content, {
                y: 0, opacity: 1,
                duration: 0.6,
                delay: d + 0.12,
                ease: EASE.reveal,
                overwrite: 'auto'
              })
          },
          onLeave: () => {
            if (bar) gsap.to(bar, { scaleY: 0, duration: 0.5, overwrite: 'auto' })
            if (content) gsap.to(content, { y: 22, opacity: 0, duration: 0.5, overwrite: 'auto' })
          },
          onEnterBack: () => {
            const d = i * 0.08
            if (bar) gsap.to(bar, { scaleY: 1, duration: 0.85, delay: d, ease: 'power3.out', overwrite: 'auto' })
            if (content) gsap.to(content, { y: 0, opacity: 1, duration: 0.6, delay: d + 0.12, ease: EASE.reveal, overwrite: 'auto' })
          },
          onLeaveBack: () => {
            if (bar) gsap.to(bar, { scaleY: 0, duration: 0.5, overwrite: 'auto' })
            if (content) gsap.to(content, { y: 22, opacity: 0, duration: 0.5, overwrite: 'auto' })
          }
        })
      })

      return () => split?.revert()
    },
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <section ref={ref} className="bg-white py-4xl lg:py-5xl">
      <Container className="min-[1600px]:max-w-[90rem]">

        {/* Cabeçalho */}
        <div className="mb-3xl max-w-[52rem]">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] uppercase rounded-full px-4 py-2 mb-6 border border-primary/20 bg-primary/5 text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              {t('kicker')}
            </span>
          </div>

          <h2
            ref={titleRef}
            className="font-black uppercase leading-[1.05] tracking-tight text-foreground"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
          >
            {t('title')}
          </h2>
          <span data-gline aria-hidden className="mt-8 block h-[3px] w-12 rounded-full bg-primary" />
        </div>

        {/* Grid de linhas — 1 col mobile, 2-3 desktop */}
        <div className="grid grid-cols-1 gap-xl sm:grid-cols-2 lg:grid-cols-3">
          {LINES.map((key, i) => {
            const { accent, text } = LINE_COLORS[key]
            return (
              <Link
                key={key}
                href={`/produtos#${key}`}
                data-line-card
                className="group relative flex overflow-hidden rounded-xl border border-foreground/8 bg-white transition-shadow hover:shadow-lg cursor-pointer"
              >
                {/* Barra de cor vertical — âncora da identidade de linha */}
                <div
                  data-bar
                  aria-hidden
                  className="w-1.5 shrink-0 rounded-l-xl"
                  style={{ backgroundColor: accent }}
                />

                {/* Conteúdo */}
                <div
                  data-line-content
                  className="flex flex-col gap-sm p-xl lg:p-2xl"
                >
                  {/* Número ordinal — decorativo */}
                  <span
                    aria-hidden
                    className="font-black text-[0.65rem] uppercase tracking-[0.2em]"
                    style={{ color: accent }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Título da linha */}
                  <h3
                    className="font-black uppercase leading-[1.0] tracking-tight text-foreground"
                    style={{ fontSize: 'clamp(1.05rem, 2vw, 1.25rem)' }}
                  >
                    {t(`${key}.title` as any)}
                  </h3>

                  {/* Produtos */}
                  <p className="text-subtitle m-0 text-sm leading-relaxed text-foreground/55">
                    {t(`${key}.support` as any)}
                  </p>

                  {/* Link de linha */}
                  <span
                    className="mt-auto inline-flex items-center gap-xs pt-sm text-[11px] font-semibold uppercase tracking-[0.14em] transition-all group-hover:opacity-70"
                    style={{ color: accent }}
                  >
                    {t('viewLine')}
                    {/* Seta simples */}
                    <span aria-hidden className="text-xs transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

      </Container>
    </section>
  )
}
