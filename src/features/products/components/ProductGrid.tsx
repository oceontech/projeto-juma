'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/layout/Container'
import { useTranslations } from 'next-intl'
import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { createCharReveal, revealToggleActions } from '@/features/animation/charReveal'
import { onPageEntrance } from '@/features/animation/pageEntrance'
import { DUR, EASE } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { DropdownMenu } from '@/components/ui/dropdown-menu'

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
    image: '/produtos/acorda-cana.webp',
  },
  {
    id: 'acorda-ultra',
    name: 'Acorda Ultra',
    tKey: 'acordaUltra' as const,
    categoryId: 'cat-tratamento',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata'],
    color: '#008dc2',
    href: '/produtos/acorda-ultra',
    image: '/produtos/acorda-ultra.webp',
  },
  {
    id: 'aduban',
    name: 'Aduban',
    tKey: 'aduban' as const,
    categoryId: 'cat-tratamento',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata'],
    color: '#ad1115',
    href: '/produtos/aduban',
    image: '/produtos/aduban.webp',
  },
  {
    id: 'aminosan',
    name: 'Aminosan®',
    tKey: 'aminosan' as const,
    categoryId: 'cat-nutricao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata'],
    color: '#006838',
    href: '/produtos/aminosan',
    image: '/produtos/aminosan.webp',
  },
  {
    id: 'fitofert',
    name: 'Fitofert',
    tKey: 'fitofert' as const,
    categoryId: 'cat-nutricao',
    cultures: ['cul-soja', 'cul-cafe', 'cul-feijao', 'cul-citros', 'cul-tomate'],
    color: '#006838',
    href: '/produtos/fitofert',
    image: '/produtos/fitofert.webp',
  },
  {
    id: 'revigo-comoni',
    name: 'Revigo CoMoNi',
    tKey: 'revigoComoni' as const,
    categoryId: 'cat-nutricao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-cana'],
    color: '#312783',
    href: '/produtos/revigo-comoni',
    image: '/produtos/revigo-comoni.webp',
  },
  {
    id: 'revigophos-amino',
    name: 'RevigoPhos Amino',
    tKey: 'revigophosAmino' as const,
    categoryId: 'cat-nutricao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata', 'cul-pastagem'],
    color: '#312783',
    href: '/produtos/revigophos-amino',
    image: '/produtos/revigophos-amino.webp',
  },
  {
    id: 'revigo-cobre-ultra',
    name: 'Revigo Cobre Ultra',
    tKey: 'revigoCobreUltra' as const,
    categoryId: 'cat-nutricao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata'],
    color: '#312783',
    href: '/produtos/revigo-cobre-ultra',
    image: '/produtos/revigo-cobre-ultra.webp',
  },
  {
    id: 'kmep-ultra',
    name: 'Kmep Ultra',
    tKey: 'kmepUltra' as const,
    categoryId: 'cat-protecao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata'],
    color: '#ad1115',
    href: '/produtos/kmep-ultra',
    image: '/produtos/kmep-ultra.webp',
  },
  {
    id: 'redutan-sili-4',
    name: 'Redutan NPK Sili-4',
    tKey: 'redutanSili4' as const,
    categoryId: 'cat-aplicacao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata', 'cul-cana', 'cul-pastagem'],
    color: '#006838',
    href: '/produtos/redutan-sili-4',
    image: '/produtos/redutan-sili-4.webp',
  },
  {
    id: 'redutan-sili-5',
    name: 'Redutan NPK Sili-5',
    tKey: 'redutanSili5' as const,
    categoryId: 'cat-aplicacao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata', 'cul-cana', 'cul-pastagem'],
    color: '#7d252a',
    href: '/produtos/redutan-sili-5',
    image: '/produtos/redutan-sili-5.webp',
  },
  {
    id: 'supermix',
    name: 'Supermix',
    tKey: 'supermix' as const,
    categoryId: 'cat-aplicacao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata', 'cul-cana', 'cul-pastagem'],
    color: '#388123',
    href: '/produtos/supermix',
    image: '/produtos/supermix.webp',
  },
  {
    id: 'revigo-milho',
    name: 'Revigo + Milho',
    tKey: 'revigoMilho' as const,
    categoryId: 'cat-manejo',
    cultures: ['cul-milho'],
    color: '#312783',
    href: '/produtos/revigo-milho',
    image: '/produtos/revigo-milho.webp',
  },
  {
    id: 'revigo-pasto',
    name: 'Revigo + Pasto',
    tKey: 'revigoPasto' as const,
    categoryId: 'cat-manejo',
    cultures: ['cul-pastagem', 'cul-milho'],
    color: '#312783',
    href: '/produtos/revigo-pasto',
    image: '/produtos/revigo-pasto.webp',
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

      const reveal = createCharReveal(title)
      const chars = reveal?.chars ?? []
      let ctaReveal: ReturnType<typeof createCharReveal> = null

      if (eyebrow) gsap.set(eyebrow, { y: 15, opacity: 0 })
      if (title) gsap.set(title, { opacity: 0 })
      reveal?.hide()
      if (intro) gsap.set(intro, { y: 20, opacity: 0 })
      if (filters) gsap.set(filters, { y: 20, opacity: 0 })
      if (cta) gsap.set(cta, { y: 24, opacity: 0 })

      /* Pausada: quem solta é o portão do preloader (ver `pageEntrance`). */
      const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.reveal } })
      if (eyebrow) tl.to(eyebrow, { y: 0, opacity: 1, duration: 0.5 })
      if (title) tl.set(title, { opacity: 1 }, 0.1)
      reveal?.playIn(tl, 0.1)
      if (intro) tl.to(intro, { y: 0, opacity: 1, duration: DUR.sub }, 0.4)
      if (filters) tl.to(filters, { y: 0, opacity: 1, duration: DUR.sub }, 0.5)
      const soltarAbertura = onPageEntrance(() => tl.play())

      if (grid) {
        const cards = gsap.utils.toArray<HTMLElement>('[data-product-card]', grid)
        gsap.set(cards, { y: 20, opacity: 0 })
        /* `batch` agrupa os cards que cruzam o gatilho no mesmo frame — um
           stagger só para a leva inteira, em vez de uma tween por card.

           Aqui a grade tem SÓ entrada: o card aparece uma vez e fica. Numa
           listagem, sair e voltar a entrar a cada passagem de scroll atrapalha
           quem está comparando produtos — o conteúdo pisca no meio da leitura,
           e é o oposto do que se espera de uma lista. `once: true` também
           dispensa os callbacks de saída. */
        const entra = (batch: Element[]) =>
          gsap.to(batch, { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out', overwrite: true })
        ScrollTrigger.batch(cards, {
          start: 'top 95%', // Gatilho antecipado para não parecer travado
          once: true,
          onEnter: entra,
        })
      }

      if (cta) {
        const ctaTitle = cta.querySelector<HTMLElement>('[data-cta-title]')
        ctaReveal = createCharReveal(ctaTitle)
        ctaReveal?.hide()

        const ctaTl = gsap.timeline({
          scrollTrigger: {
            trigger: cta,
            start: 'top 90%',
            end: 'bottom top',
            toggleActions: revealToggleActions(),
          },
          defaults: { ease: EASE.reveal },
        })
        ctaTl.to(cta, { y: 0, opacity: 1, duration: 0.7 })
        ctaReveal?.playIn(ctaTl, 0.15)
      }

      return () => {
        soltarAbertura()
        reveal?.revert()
        ctaReveal?.revert()
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
          <h1 ref={titleRef} className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-black uppercase text-foreground tracking-tight mb-6 max-w-[64rem] leading-[0.95]">
            {t('titleStart')} <em className="text-highlight text-primary">{t('titleHighlight')}</em> {t('titleEnd')}
          </h1>
          <p ref={introRef} className="text-lg md:text-xl text-foreground/70 max-w-[56rem] leading-relaxed">
            {t('intro')}
          </p>
        </div>

      <div ref={filtersRef} className="relative z-50 flex flex-col md:flex-row md:items-center gap-4 mb-12">
        <div className="flex flex-wrap gap-4 items-center">
          <DropdownMenu 
            options={CATEGORY_IDS.map(cat => ({
              label: t(`categories.${cat.key}`),
              active: activeCategory === cat.id,
              count: getCategoryCount(cat.id),
              onClick: () => setActiveCategory(cat.id)
            }))}
          >
            <span className="font-semibold text-foreground/60 mr-1">{t('filterCategory')}:</span> 
            {t(`categories.${CATEGORY_IDS.find(c => c.id === activeCategory)?.key || 'all'}`)}
          </DropdownMenu>

          <DropdownMenu
            options={CULTURE_IDS.map(cul => ({
              label: t(`cultures.${cul.key}`),
              active: activeCulture === cul.id,
              onClick: () => setActiveCulture(cul.id)
            }))}
          >
            <span className="font-semibold text-foreground/60 mr-1">{t('filterCulture')}:</span>
            {t(`cultures.${CULTURE_IDS.find(c => c.id === activeCulture)?.key || 'all'}`)}
          </DropdownMenu>
        </div>
      </div>

      {/* Grid de Produtos */}
      {filteredProducts.length > 0 ? (
        <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={product.href}
              data-product-card
              className="group flex flex-col h-full rounded-2xl overflow-hidden border border-foreground/10 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className="relative h-72 flex items-center justify-center p-5 overflow-hidden transition-colors duration-500 bg-[#f4f9f0]"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#ebf4e3]"
                />
                <span className="absolute top-4 left-4 z-10 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-white/90 backdrop-blur text-foreground shadow-sm">
                  {t(`products.${product.tKey}.tag`)}
                </span>
                <div className="relative z-10 h-full w-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                  <Image
                    src={product.image || "/produtos/placeholder-produto.png"}
                    alt={`${t('productImageAlt')} ${product.name}`}
                    width={400}
                    height={400}
                    quality={75}
                    className="object-contain h-full w-auto drop-shadow-xl"
                  />
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 bg-white">
                <h3 className="text-xl text-subtitle font-bold font-montserrat text-primary mb-2 group-hover:text-opacity-80 transition-colors">
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
        <div className="relative z-10 max-w-[64rem]">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {t('ctaEyebrow')}
          </span>
          <h2 data-cta-title className="font-montserrat text-3xl md:text-4xl font-black uppercase text-white tracking-tight mb-4 leading-[0.95]">
            {t('ctaTitleStart')} <em className="text-highlight text-[#F0E27A]">{t('ctaTitleHighlight')}</em>
          </h2>
          <p className="text-white text-lg">
            {t('ctaBody')}
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <Link
            href="/contato"
            className="inline-flex items-center gap-3 bg-white text-primary px-8 py-4 rounded-full btn-type transition-transform hover:scale-105 shadow-xl hover:shadow-white/20"
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
