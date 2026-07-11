'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/layout/Container'
import { useTranslations } from 'next-intl'
import { gsap, SplitText, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { DropdownMenu } from '@/components/ui/dropdown-menu-framer'

const ARTICLE_CATEGORY_KEYS = ['all', 'manejo', 'nutricao', 'pecuaria', 'pesquisa', 'sustentabilidade'] as const

const ARTICLES = [
  {
    id: 'nutricao-fase-certa',
    title: 'Nutrição na fase certa: o que muda na produtividade da soja',
    category: 'nutricao',
    date: '15 ABR 2026',
    readTime: '6 MIN',
    color: 'from-green-600 to-green-800',
    image: '/materias/nutricao-fase-certa.png'
  },
  {
    id: 'manejo-pastagem',
    title: 'Manejo de pastagem: recuperação e ganho de peso',
    category: 'pecuaria',
    date: '02 ABR 2026',
    readTime: '8 MIN',
    color: 'from-amber-600 to-orange-800',
    image: '/materias/manejo-pastagem.png'
  },
  {
    id: 'tratamento-sementes',
    title: 'Tratamento de sementes: o que esperar de um arranque vigoroso',
    category: 'manejo',
    date: '25 MAR 2026',
    readTime: '5 MIN',
    color: 'from-blue-600 to-indigo-800',
    image: '/materias/tratamento-sementes.png'
  },
  {
    id: 'aminoacidos-foliares',
    title: 'Aminoácidos foliares: como funciona a absorção na planta',
    category: 'pesquisa',
    date: '18 MAR 2026',
    readTime: '7 MIN',
    color: 'from-purple-600 to-purple-900',
    image: '/materias/aminoacidos-foliares.png'
  },
  {
    id: 'calda-eficiente',
    title: 'Calda eficiente, menos deriva: a contribuição da tecnologia de aplicação',
    category: 'sustentabilidade',
    date: '11 MAR 2026',
    readTime: '4 MIN',
    color: 'from-teal-600 to-emerald-800',
    image: '/materias/calda-eficiente.png'
  },
  {
    id: 'floracao-cafe',
    title: 'Floração do café: por que ela define metade da sua safra',
    category: 'nutricao',
    date: '04 MAR 2026',
    readTime: '6 MIN',
    color: 'from-green-600 to-green-800',
    image: '/materias/floracao-cafe.png'
  }
]

function ArrowTopRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

export function ArticlesPage() {
  const t = useTranslations('articlesPage')
  const [activeCategory, setActiveCategory] = useState('all')

  const reduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLSpanElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const introRef = useRef<HTMLParagraphElement>(null)
  const filtersRef = useRef<HTMLDivElement>(null)

  const featuredRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduced || !containerRef.current) return

      const eyebrow = eyebrowRef.current
      const title = titleRef.current
      const intro = introRef.current
      const filters = filtersRef.current
      const featured = featuredRef.current
      const grid = gridRef.current
      const cta = ctaRef.current

      const split = title ? new SplitText(title, { type: 'chars,lines' }) : null
      const chars = split?.chars ?? []

      if (eyebrow) gsap.set(eyebrow, { y: 15, opacity: 0 })
      if (title) gsap.set(title, { opacity: 0 })
      if (chars.length) gsap.set(chars, { x: 20, opacity: 0, filter: 'blur(10px)' })
      if (intro) gsap.set(intro, { y: 20, opacity: 0 })
      if (filters) gsap.set(filters, { y: 20, opacity: 0 })
      if (cta) gsap.set(cta, { y: 24, opacity: 0 })

      const tl = gsap.timeline({ defaults: { ease: EASE.reveal } })
      if (eyebrow) tl.to(eyebrow, { y: 0, opacity: 1, duration: 0.5 })
      if (title) tl.set(title, { opacity: 1 }, 0.1)
      if (chars.length) tl.to(chars, { x: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.char }, 0.1)
      if (intro) tl.to(intro, { y: 0, opacity: 1, duration: DUR.sub }, 0.4)
      if (filters) tl.to(filters, { y: 0, opacity: 1, duration: DUR.sub }, 0.5)

      if (featured) {
        gsap.set(featured, { y: 24, opacity: 0 })
        ScrollTrigger.create({
          trigger: featured,
          start: 'top 85%',
          once: true,
          onEnter: () => gsap.to(featured, { y: 0, opacity: 1, duration: 0.8, ease: EASE.reveal })
        })
      }

      if (grid) {
        const cards = gsap.utils.toArray<HTMLElement>('[data-article-card]', grid)
        gsap.set(cards, { y: 24, opacity: 0 })
        ScrollTrigger.create({
          trigger: grid,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(cards, { y: 0, opacity: 1, duration: 0.8, stagger: STAGGER.card, ease: EASE.reveal })
          }
        })
      }

      if (cta) {
        ScrollTrigger.create({
          trigger: cta,
          start: 'top 90%',
          once: true,
          onEnter: () => gsap.to(cta, { y: 0, opacity: 1, duration: 0.7, ease: EASE.reveal })
        })
      }

      return () => {
        split?.revert()
      }
    },
    { scope: containerRef, dependencies: [reduced] }
  )

  const filteredArticles = ARTICLES.filter(a => activeCategory === 'all' || a.category === activeCategory)

  const getCategoryCount = (id: string) => {
    if (id === 'all') return ARTICLES.length
    return ARTICLES.filter((a) => a.category === id).length
  }

  return (
    <Container>
      <div ref={containerRef}>
        {/* Cabeçalho */}
        <div className="mb-16">
          <span ref={eyebrowRef} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {t('eyebrow')}
          </span>
          <h1 ref={titleRef} className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-black uppercase text-foreground tracking-tight mb-6 max-w-[48rem] leading-tight">
            {t('titleStart')} <em className="text-highlight text-primary">{t('titleHighlight')}</em>
          </h1>
          <p ref={introRef} className="text-lg md:text-xl text-foreground/70 max-w-[48rem] leading-relaxed">
            {t('intro')}
          </p>
        </div>

        {/* Filtros */}
        <div ref={filtersRef} className="relative z-50 flex flex-col md:flex-row md:items-center gap-4 mb-16">
          <div className="flex flex-wrap gap-4 items-center">
            <DropdownMenu 
              options={ARTICLE_CATEGORY_KEYS.map(cat => ({
                label: t(`categories.${cat}`),
                active: activeCategory === cat,
                count: getCategoryCount(cat),
                onClick: () => setActiveCategory(cat)
              }))}
            >
              <span className="font-semibold text-foreground/60 mr-1">{t('filterLabel')}</span> 
              {t(`categories.${activeCategory}`)}
            </DropdownMenu>
          </div>
        </div>

      {/* Destaque */}
      {activeCategory === 'all' && (
        <div ref={featuredRef} className="mb-24">
          <Link
            href="/materias/como-reduzir-o-estresse"
            className="group flex flex-col md:flex-row rounded-3xl overflow-hidden border border-foreground/10 bg-white shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="md:w-1/2 relative min-h-[300px] md:min-h-[400px] bg-gradient-to-br from-[#004C26] to-green-900 overflow-hidden">
              <Image src="/materias/capa-destaque.png" alt={t('featuredTitle')} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
              <span className="absolute top-6 left-6 z-10 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-foreground shadow-sm">
                {t('featuredBadge')}
              </span>
            </div>

            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <span className="text-xs font-bold tracking-widest uppercase text-primary mb-4">
                {t('featuredLabel')}
              </span>
              <h2 className="text-subtitle text-2xl md:text-3xl font-black text-foreground mb-4 group-hover:text-primary transition-colors">
                {t('featuredTitle')}
              </h2>
              <p className="text-foreground/70 leading-relaxed mb-8 flex-1">
                {t('featuredBody')}
              </p>
              <span className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm transition-transform group-hover:translate-x-1">
                {t('readArticle')} <ArrowTopRightIcon className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </div>
      )}

      {/* Grade de Artigos */}
      <div className="mb-24">
        <div className="flex flex-col gap-12 mb-16">
          <div className="md:w-1/3 shrink-0">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t('allArticlesEyebrow')}
            </span>
          </div>
          <div className="md:w-2/3 max-w-[42rem]">
            <h2 className="font-montserrat uppercase text-3xl md:text-4xl font-black text-foreground tracking-tight mb-4 leading-tight">
              {t('allArticlesTitle')}
            </h2>
            <p className="text-lg text-foreground/70 leading-relaxed">
              {t('allArticlesIntro')}
            </p>
          </div>
        </div>

        {filteredArticles.length > 0 ? (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <Link
                key={article.id}
                href={`/materias/${article.id}`}
                data-article-card
                className="group flex flex-col h-full rounded-2xl overflow-hidden border border-foreground/10 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`relative h-48 bg-gradient-to-br ${article.color} overflow-hidden`}>
                  <Image src={article.image} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                  <span className="absolute top-4 left-4 z-10 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-foreground shadow-sm">
                    {t(`categories.${article.category}`)}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-foreground/50 mb-3">
                    {article.date} · {article.readTime} {t('readingTime')}
                  </span>
                  <h3 className="text-lg font-bold text-subtitle text-foreground mb-6 group-hover:text-primary transition-colors leading-snug">
                    {article.title}
                  </h3>
                  <span className="mt-auto inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs transition-transform group-hover:translate-x-1">
                    {t('readArticle')} <ArrowTopRightIcon className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-lg text-foreground/60 mb-2">
              {t('emptyState')}
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className="text-primary font-medium hover:underline"
            >
              {t('showAll')}
            </button>
          </div>
        )}

        {filteredArticles.length > 0 && activeCategory === 'all' && (
          <div className="mt-12 flex justify-center">
            <button className="inline-flex items-center gap-2 bg-transparent text-primary border border-primary px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm transition-colors hover:bg-primary/5">
              {t('loadMore')} <ArrowTopRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* CTA WhatsApp */}
      <div ref={ctaRef} className="rounded-3xl bg-[#004C26] text-white p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 max-w-[36rem]">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {t('ctaEyebrow')}
          </span>
          <h2 className="font-montserrat text-3xl md:text-4xl font-black uppercase tracking-tight mb-4 leading-tight text-white">
            {t('ctaTitleStart')}<br />{t('ctaTitleEnd')}
          </h2>
          <p className="text-white text-lg">
            {t('ctaBody')}
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <Link
            href="/contato"
            className="inline-flex items-center gap-3 bg-yellow-400 text-primary px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm transition-transform hover:scale-105 shadow-xl hover:shadow-yellow-400/20"
          >
            {t('ctaButton')}
            <ArrowTopRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
      </div>
    </Container>
  )
}
