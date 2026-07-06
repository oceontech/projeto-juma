'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/layout/Container'
import { useTranslations } from 'next-intl'
import { gsap, SplitText, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'

const CATEGORY_IDS = [
  { id: 'all', key: 'all' as const },
  { id: 'cat-tratamento', key: 'tratamento' as const },
  { id: 'cat-nutricao', key: 'nutricao' as const },
  { id: 'cat-protecao', key: 'protecao' as const },
  { id: 'cat-aplicacao', key: 'aplicacao' as const },
  { id: 'cat-manejo', key: 'manejo' as const },
]

const CULTURE_IDS = [
  { id: 'all', key: 'all' as const },
  { id: 'cul-soja', key: 'soja' as const },
  { id: 'cul-milho', key: 'milho' as const },
  { id: 'cul-cafe', key: 'cafe' as const },
  { id: 'cul-cana', key: 'cana' as const },
  { id: 'cul-algodao', key: 'algodao' as const },
  { id: 'cul-feijao', key: 'feijao' as const },
  { id: 'cul-citros', key: 'citros' as const },
  { id: 'cul-tomate', key: 'tomate' as const },
  { id: 'cul-batata', key: 'batata' as const },
  { id: 'cul-pastagem', key: 'pastagem' as const },
]

const PRODUCTS = [
  {
    id: 'acorda-cana',
    name: 'Acorda Cana',
    tKey: 'acordaCana' as const,
    categoryId: 'cat-tratamento',
    cultures: ['cul-cana'],
    color: '#79ab34',
    href: '/produtos/acorda-cana',
  },
  {
    id: 'acorda-ultra',
    name: 'Acorda Ultra',
    tKey: 'acordaUltra' as const,
    categoryId: 'cat-tratamento',
    cultures: ['cul-soja', 'cul-milho', 'cul-algodao', 'cul-feijao'],
    color: '#008dc2',
    href: '/produtos/acorda-ultra',
  },
  {
    id: 'aduban',
    name: 'Aduban',
    tKey: 'aduban' as const,
    categoryId: 'cat-tratamento',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-feijao'],
    color: '#ad1115',
    href: '/produtos/aduban',
  },
  {
    id: 'aminosan',
    name: 'Aminosan®',
    tKey: 'aminosan' as const,
    categoryId: 'cat-nutricao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata', 'cul-cana'],
    color: '#006838',
    href: '/produtos/aminosan',
  },
  {
    id: 'fitofert',
    name: 'Fitofert',
    tKey: 'fitofert' as const,
    categoryId: 'cat-nutricao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-citros', 'cul-tomate'],
    color: '#006838',
    href: '/produtos/fitofert',
  },
  {
    id: 'linha-revigo',
    name: 'Linha Revigo',
    tKey: 'linhaRevigo' as const,
    categoryId: 'cat-nutricao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata'],
    color: '#312783',
    href: '/produtos/linha-revigo',
  },
  {
    id: 'revigophos-amino',
    name: 'RevigoPhos Amino',
    tKey: 'revigophosAmino' as const,
    categoryId: 'cat-nutricao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-cana'],
    color: '#312783',
    href: '/produtos/revigophos-amino',
  },
  {
    id: 'revigo-cobre-ultra',
    name: 'Revigo Cobre Ultra',
    tKey: 'revigoCobreUltra' as const,
    categoryId: 'cat-nutricao',
    cultures: ['cul-soja', 'cul-cafe', 'cul-citros', 'cul-tomate', 'cul-batata'],
    color: '#312783',
    href: '/produtos/revigo-cobre-ultra',
  },
  {
    id: 'kmep-ultra',
    name: 'Kmep Ultra',
    tKey: 'kmepUltra' as const,
    categoryId: 'cat-protecao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-tomate', 'cul-batata', 'cul-cana'],
    color: '#ad1115',
    href: '/produtos/kmep-ultra',
  },
  {
    id: 'linha-redutan',
    name: 'Linha Redutan',
    tKey: 'linhaRedutan' as const,
    categoryId: 'cat-aplicacao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata', 'cul-cana', 'cul-pastagem'],
    color: '#7d252a',
    href: '/produtos/linha-redutan',
  },
  {
    id: 'supermix',
    name: 'Supermix',
    tKey: 'supermix' as const,
    categoryId: 'cat-aplicacao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata', 'cul-cana', 'cul-pastagem'],
    color: '#388123',
    href: '/produtos/supermix',
  },
  {
    id: 'revigo-milho',
    name: 'Revigo + Milho',
    tKey: 'revigoMilho' as const,
    categoryId: 'cat-manejo',
    cultures: ['cul-milho'],
    color: '#312783',
    href: '/produtos/revigo-milho',
  },
  {
    id: 'revigo-pasto',
    name: 'Revigo + Pasto',
    tKey: 'revigoPasto' as const,
    categoryId: 'cat-manejo',
    cultures: ['cul-pastagem'],
    color: '#312783',
    href: '/produtos/revigo-pasto',
  },
]

function ArrowTopRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

export function ProductGrid() {
  const t = useTranslations('productsPage')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeCulture, setActiveCulture] = useState('all')

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (!hash) return

    const hashMap: Record<string, string> = {
      nutricao: 'cat-nutricao',
      arranque: 'cat-tratamento',
      protecao: 'cat-protecao',
      manejos: 'cat-manejo',
      aplicacao: 'cat-aplicacao',
    }

    if (hashMap[hash]) {
      setActiveCategory(hashMap[hash])
    }
  }, [])

  const reduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLSpanElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const introRef = useRef<HTMLParagraphElement>(null)
  const filtersRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduced || !containerRef.current) return

      const eyebrow = eyebrowRef.current
      const title = titleRef.current
      const intro = introRef.current
      const filters = filtersRef.current
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

      if (grid) {
        const cards = gsap.utils.toArray<HTMLElement>('[data-product-card]', grid)
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
          onEnter: () => {
            gsap.to(cta, { y: 0, opacity: 1, duration: 0.7, ease: EASE.reveal })
          }
        })
      }

      return () => {
        split?.revert()
      }
    },
    { scope: containerRef, dependencies: [reduced] }
  )

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchCat = activeCategory === 'all' || p.categoryId === activeCategory
    const matchCul = activeCulture === 'all' || p.cultures.includes(activeCulture)
    return matchCat && matchCul
  })

  const getCategoryCount = (id: string) => {
    if (id === 'all') return PRODUCTS.length
    return PRODUCTS.filter((p) => p.categoryId === id).length
  }

  return (
    <Container>
      <div ref={containerRef}>
        <div className="mb-12">
          <span ref={eyebrowRef} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {t('eyebrow')}
          </span>
          <h1 ref={titleRef} className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-black uppercase text-foreground tracking-tight mb-6 max-w-[42rem] leading-tight">
            {t('titleStart')} <em className="text-highlight text-primary">{t('titleHighlight')}</em> {t('titleEnd')}
          </h1>
          <p ref={introRef} className="text-lg md:text-xl text-foreground/70 max-w-[48rem] leading-relaxed">
            {t('intro')}
          </p>
        </div>

      <div ref={filtersRef} className="space-y-6 mb-12">
        {/* Filtros Categoria */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-foreground/50 shrink-0 md:w-24">
            {t('filterCategory')}
          </span>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_IDS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex cursor-pointer items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-primary border-primary text-white shadow-md'
                    : 'border-foreground/20 text-foreground/80 hover:bg-foreground/5 hover:border-foreground/30'
                }`}
              >
                {t(`categories.${cat.key}`)}
                <span className={`text-[0.8em] font-bold ${activeCategory === cat.id ? 'text-white/80' : 'text-foreground/40'}`}>
                  {getCategoryCount(cat.id)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filtros Cultura */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-foreground/50 shrink-0 md:w-24">
            {t('filterCulture')}
          </span>
          <div className="flex flex-wrap gap-2">
            {CULTURE_IDS.map((cul) => (
              <button
                key={cul.id}
                onClick={() => setActiveCulture(cul.id)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all cursor-pointer ${
                  activeCulture === cul.id
                    ? 'bg-primary border-primary text-white shadow-md'
                    : 'border-foreground/20 text-foreground/80 hover:bg-foreground/5 hover:border-foreground/30'
                }`}
              >
                {t(`cultures.${cul.key}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Produtos */}
      {filteredProducts.length > 0 ? (
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={product.href}
              data-product-card
              className="group flex flex-col h-full rounded-2xl overflow-hidden border border-foreground/10 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className="relative h-64 flex items-center justify-center p-6 overflow-hidden transition-colors duration-500"
                style={{ backgroundColor: `${product.color}15` }}
              >
                <div
                  className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                  style={{ backgroundColor: product.color }}
                />
                <span className="absolute top-4 left-4 z-10 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-white/90 backdrop-blur text-foreground shadow-sm">
                  {t(`products.${product.tKey}.tag`)}
                </span>
                <div className="relative z-10 h-full w-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                  <Image
                    src="/produtos/placeholder-produto.png"
                    alt={`${t('productImageAlt')} ${product.name}`}
                    width={200}
                    height={300}
                    className="object-contain h-full w-auto drop-shadow-xl"
                  />
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 bg-white">
                <h3 className="text-xl font-bold font-montserrat text-primary mb-2 group-hover:text-opacity-80 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-foreground/70 leading-relaxed mb-6 flex-1">
                  {t(`products.${product.tKey}.description`)}
                </p>
                <div className="self-end mt-auto flex items-center justify-center h-10 w-10 rounded-full bg-primary/5 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                  <ArrowTopRightIcon className="h-4 w-4" />
                </div>
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
            onClick={() => { setActiveCategory('all'); setActiveCulture('all') }}
            className="text-primary font-medium hover:underline"
          >
            {t('clearFilters')}
          </button>
        </div>
      )}

      {/* CTA Final */}
      <div ref={ctaRef} className="mt-24 rounded-3xl bg-primary text-white p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 max-w-[36rem]">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {t('ctaEyebrow')}
          </span>
          <h2 className="font-montserrat text-3xl md:text-4xl font-black uppercase text-white tracking-tight mb-4 leading-tight">
            {t('ctaTitleStart')} <em className="text-highlight text-white">{t('ctaTitleHighlight')}</em>
          </h2>
          <p className="text-white text-lg">
            {t('ctaBody')}
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <Link
            href="/contato"
            className="inline-flex items-center gap-3 bg-white text-primary px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm transition-transform hover:scale-105 shadow-xl hover:shadow-white/20"
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
