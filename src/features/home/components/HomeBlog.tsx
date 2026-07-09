'use client'

import { BookOpen } from 'lucide-react'

import { useRef } from 'react'
import { Link } from '@/i18n/navigation'
import { gsap, ScrollTrigger, useGSAP, SplitText } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'
import { useTranslations } from 'next-intl'

const ARTICLES = [
  {
    category: 'Manejo',
    date: '15 ABR 2026',
    readTime: '6 min de leitura',
    title: 'Como reduzir o estresse da lavoura na seca',
    bg: 'linear-gradient(135deg, #2d4a1a 0%, #4a7a2a 100%)',
  },
  {
    category: 'Nutrição',
    date: '02 ABR 2026',
    readTime: '8 min de leitura',
    title: 'Nutrição na fase certa: o que muda na produtividade da soja',
    bg: 'linear-gradient(135deg, #3a5c20 0%, #5a8a30 100%)',
  },
  {
    category: 'Pecuária',
    date: '18 MAR 2026',
    readTime: '5 min de leitura',
    title: 'Manejo de pastagem: recuperação e ganho de peso',
    bg: 'linear-gradient(135deg, #1a3a12 0%, #2d6020 100%)',
  },
]

export function HomeBlog() {
  const t = useTranslations('homeBlog');
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (reduced || !ref.current) return
    const cards = gsap.utils.toArray<HTMLElement>('[data-blog-card]', ref.current)
    gsap.set(cards, { y: 40, opacity: 0, filter: 'blur(12px)' })
    
    const header = ref.current.querySelector<HTMLElement>('[data-header]')
    let split: SplitText | null = null;
    if (header) {
      const kicker = header.querySelector<HTMLElement>('[data-kicker]')
      const title = header.querySelector<HTMLElement>('[data-title]')
      const line = header.querySelector<HTMLElement>('[data-gline]')

      split = title ? new SplitText(title, { type: 'chars,words' }) : null

      if (kicker) gsap.set(kicker, { y: 14, opacity: 0 })
      if (split) gsap.set(split.chars, { x: 20, opacity: 0, filter: 'blur(10px)' })
      if (line) gsap.set(line, { scaleX: 0, opacity: 0, transformOrigin: 'left center' })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'play reverse play reverse',
        },
        defaults: { ease: EASE.reveal }
      })
      if (kicker) tl.to(kicker, { y: 0, opacity: 1, duration: DUR.sub })
      if (split) tl.to(split.chars, { x: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.char }, '-=0.4')
      if (line) tl.to(line, { scaleX: 1, opacity: 1, duration: DUR.sub }, '-=0.4')
    }

    gsap.to(cards, {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.8,
      stagger: 0.1,
      ease: EASE.reveal,
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 78%',
        end: 'bottom 15%',
        toggleActions: 'play reverse play reverse',
      }
    })
    
    return () => split?.revert()
  }, { scope: ref })

  return (
    <section
      ref={ref}
      style={{ backgroundColor: '#fff', paddingBlock: 'clamp(80px,8vw,120px)' }}
    >
      <Container>
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div data-header>
            <div className="mb-8" data-kicker>
              <span className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] uppercase rounded-full px-4 py-2 border border-[#004B26]/20 bg-[#004B26]/5 text-[#004B26]">
                <BookOpen className="w-3.5 h-3.5 flex-shrink-0 text-[#004B26]" />
                {t('kicker')}
              </span>
            </div>
            <h2
              data-title
              className="font-black uppercase leading-[1.05] tracking-tight"
              style={{ color: '#0F1A0A', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
            >
              <span dangerouslySetInnerHTML={{ __html: t('titlePart1') }} /><span className="text-[#004B26] text-highlight inline-block">{t('titleHighlight')}</span>
            </h2>
            <span data-gline aria-hidden className="mt-8 block h-[3px] w-12 rounded-full bg-[#004B26]" />
          </div>
          <p className="max-w-[38ch] text-[17px] leading-[1.6]" style={{ color: '#3d4d35' }}>
            {t('desc')}
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {ARTICLES.map((a, i) => (
            <article
              key={i}
              data-blog-card
              className="rounded-[24px] overflow-hidden flex flex-col"
              style={{ backgroundColor: '#F2F6F2', border: '1px solid rgba(0,0,0,.06)' }}
            >
              {/* Capa */}
              <div className="relative h-[200px] overflow-hidden">
                <div className="w-full h-full" style={{ background: a.bg }} />
                <span
                  className="absolute top-4 left-4 text-[11px] font-bold tracking-[0.10em] uppercase rounded-full px-3 py-1.5"
                  style={{ backgroundColor: 'rgba(0,0,0,.5)', color: '#fff', backdropFilter: 'blur(8px)' }}
                >
                  {t(`articles.${i}.category`)}
                </span>
              </div>

              {/* Conteúdo */}
              <div className="p-6 flex flex-col gap-3 flex-1">
                <span className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: '#7a8f6e' }}>
                  {t(`articles.${i}.date`)} · {t(`articles.${i}.readTime`)}
                </span>
                <h3 className="text-[18px] text-subtitle font-bold leading-[1.35] tracking-[-0.01em] flex-1" style={{ color: '#0F1A0A' }}>
                  {t(`articles.${i}.title`)}
                </h3>
                <Link
                  href="/materias"
                  className="inline-flex items-center gap-2 text-[14px] font-semibold"
                  style={{ color: '#004B26' }}
                >
                  {t('readArticle')}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Link "Ver todas" */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/materias"
            className="inline-flex items-center gap-2 text-[15px] font-semibold"
            style={{ color: '#004B26' }}
          >
            {t('viewAll')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </Container>
    </section>
  )
}
