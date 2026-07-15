'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/layout/Container'
import { useTranslations, useLocale } from 'next-intl'
import { gsap, SplitText, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { ARTICLES_DATA, Article } from '../data/articlesData'

interface ArticlePageProps {
  slug: string
}

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function ArrowTopRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export function ArticlePage({ slug }: ArticlePageProps) {
  const t = useTranslations('articleDetailPage')
  const tCat = useTranslations('articlesPage.categories')
  const locale = useLocale() as 'pt-BR' | 'en' | 'es'
  const reduced = useReducedMotion()

  const article = ARTICLES_DATA.find((a) => a.id === slug)

  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const headerContentRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const relatedRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  // GSAP animations
  useGSAP(
    () => {
      if (!article) return

      // 1. Initial State / Setup
      if (!reduced) {
        // Hero image initial scale and opacity
        if (imageRef.current) {
          gsap.set(imageRef.current, { scale: 1.15, opacity: 0 })
          // Entrance animation for image
          gsap.to(imageRef.current, {
            scale: 1,
            opacity: 1,
            duration: 1.6,
            ease: 'power3.out',
          })

          // Parallax Scroll Trigger
          gsap.to(imageRef.current, {
            yPercent: 18,
            ease: 'none',
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          })
        }

        // Header content elements
        const backBtn = headerContentRef.current?.querySelector('[data-back-btn]')
        const meta = headerContentRef.current?.querySelector('[data-meta]')
        const title = headerContentRef.current?.querySelector('[data-title]')
        const subtitle = headerContentRef.current?.querySelector('[data-subtitle]')
        const author = headerContentRef.current?.querySelector('[data-author]')

        // Split text for title
        let split: SplitText | null = null
        if (title) {
          split = new SplitText(title as HTMLElement, { type: 'chars,lines' })
          gsap.set(split.chars, { x: 20, opacity: 0, filter: 'blur(8px)' })
        }

        if (backBtn) gsap.set(backBtn, { y: -15, opacity: 0 })
        if (meta) gsap.set(meta, { y: 15, opacity: 0 })
        if (subtitle) gsap.set(subtitle, { y: 20, opacity: 0 })
        if (author) gsap.set(author, { y: 15, opacity: 0 })

        // Timeline for header text reveal
        const tl = gsap.timeline({ delay: 0.2 })
        if (backBtn) tl.to(backBtn, { y: 0, opacity: 1, duration: 0.5, ease: EASE.reveal })
        if (meta) tl.to(meta, { y: 0, opacity: 1, duration: 0.5, ease: EASE.reveal }, '<0.1')
        if (split) {
          tl.to(split.chars, { x: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.char, ease: EASE.reveal }, '<0.1')
        }
        if (subtitle) tl.to(subtitle, { y: 0, opacity: 1, duration: DUR.sub, ease: EASE.reveal }, '<0.2')
        if (author) tl.to(author, { y: 0, opacity: 1, duration: 0.5, ease: EASE.reveal }, '<0.15')

        // 2. Content elements reveal on scroll
        if (contentRef.current) {
          const blocks = contentRef.current.querySelectorAll('[data-content-block]')
          gsap.set(blocks, { y: 30, opacity: 0 })

          blocks.forEach((block) => {
            ScrollTrigger.create({
              trigger: block,
              start: 'top 85%',
              once: true,
              onEnter: () => {
                gsap.to(block, { y: 0, opacity: 1, duration: 0.8, ease: EASE.reveal })
              },
            })
          })
        }

        // 3. Related articles reveal
        if (relatedRef.current) {
          const rTitle = relatedRef.current.querySelector('[data-related-title]')
          const cards = relatedRef.current.querySelectorAll('[data-related-card]')

          if (rTitle) gsap.set(rTitle, { y: 20, opacity: 0 })
          if (cards.length > 0) gsap.set(cards, { y: 30, opacity: 0 })

          ScrollTrigger.create({
            trigger: relatedRef.current,
            start: 'top 80%',
            once: true,
            onEnter: () => {
              const rTl = gsap.timeline()
              if (rTitle) rTl.to(rTitle, { y: 0, opacity: 1, duration: 0.6, ease: EASE.reveal })
              if (cards.length > 0) {
                rTl.to(cards, { y: 0, opacity: 1, duration: 0.8, stagger: STAGGER.card, ease: EASE.reveal }, '<0.15')
              }
            },
          })
        }

        // 4. CTA banner reveal
        if (ctaRef.current) {
          gsap.set(ctaRef.current, { y: 30, opacity: 0 })
          ScrollTrigger.create({
            trigger: ctaRef.current,
            start: 'top 88%',
            once: true,
            onEnter: () => {
              gsap.to(ctaRef.current, { y: 0, opacity: 1, duration: 0.8, ease: EASE.reveal })
            },
          })
        }

        return () => {
          split?.revert()
        }
      } else {
        // If reduced motion is enabled, make everything visible
        if (imageRef.current) gsap.set(imageRef.current, { scale: 1, opacity: 1 })
      }
    },
    { scope: containerRef, dependencies: [slug, reduced] }
  )

  if (!article) return null

  const translation = article.translations[locale] || article.translations['pt-BR']

  // Find 3 related articles (exclude current one)
  const relatedArticles = ARTICLES_DATA
    .filter((a) => a.id !== slug)
    .slice(0, 3)

  return (
    <div ref={containerRef} className="bg-[#F8FAF8] text-foreground min-h-screen">
      {/* ─── Hero Banner Full-bleed ─── */}
      <div ref={heroRef} className="relative w-full h-[60vh] min-h-[400px] max-h-[620px] bg-black overflow-hidden select-none">
        {/* Imagem com Parallax */}
        <div ref={imageRef} className="absolute inset-0 w-full h-[120%] -top-[10%]">
          <Image
            src={article.image}
            alt={translation.title}
            fill
            priority
            sizes="100vw"
            className="object-cover hero-image"
          />
          {/* Overlay escuro para contraste */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Máscara gradiente inferior para suavizar transição com o fundo */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent, #F8FAF8)'
          }}
        />

        {/* Botão de Voltar absoluto sobre a imagem */}
        <div className="absolute top-8 left-0 right-0 z-20">
          <Container>
            <div ref={headerContentRef}>
              <Link
                href="/materias"
                data-back-btn
                className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 bg-black/20 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/40"
              >
                <ArrowLeftIcon className="h-4 w-4" /> {t('backButton')}
              </Link>
            </div>
          </Container>
        </div>
      </div>

      {/* ─── Header da Matéria (Sobreposto) ─── */}
      <Container className="relative z-10 -mt-24 md:-mt-32 mb-16">
        <div className="max-w-[48rem] mx-auto bg-white rounded-3xl p-8 md:p-12 border border-foreground/5 shadow-xl shadow-black/5">
          {/* Meta Info */}
          <div data-meta className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-widest text-[#7A8F6E] mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2F6F2] text-primary">
              {tCat(article.category)}
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-[#7A8F6E]/40" />
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" />
              {article.date}
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-[#7A8F6E]/40" />
            <span className="flex items-center gap-1.5">
              <ClockIcon className="h-3.5 w-3.5" />
              {article.readTime} {t('readingTime')}
            </span>
          </div>

          {/* Title */}
          <h1 
            data-title
            className="font-montserrat text-3xl md:text-4xl lg:text-5xl font-black uppercase text-foreground leading-[1.05] tracking-tight mb-6"
            style={{ fontWeight: 900 }}
          >
            {translation.title}
          </h1>

          {/* Subtitle / Lede */}
          <p 
            data-subtitle
            className="text-lg md:text-xl text-foreground/75 leading-relaxed font-normal mb-8 border-l-4 border-primary pl-4"
          >
            {translation.subtitle}
          </p>

          {/* Author */}
          <div data-author className="flex items-center gap-3 border-t border-foreground/10 pt-6">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-[#006838] flex items-center justify-center text-white font-bold text-sm shadow-md">
              {translation.author.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="block text-xs text-foreground/50 uppercase tracking-widest font-semibold">{t('author')}</span>
              <span className="block text-sm font-bold text-foreground">{translation.author}</span>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── Conteúdo da Matéria ─── */}
      <Container className="mb-24">
        <div ref={contentRef} className="max-w-[48rem] mx-auto">
          {/* Introdução */}
          <div data-content-block className="prose max-w-none text-foreground/80 leading-relaxed text-lg mb-10">
            <p>{translation.introduction}</p>
          </div>

          {/* Seções */}
          {translation.sections.map((section, idx) => (
            <div key={idx} data-content-block className="mb-12">
              {section.title && (
                <h3 className="font-montserrat text-xl md:text-2xl font-black uppercase text-primary tracking-tight mb-4">
                  {section.title}
                </h3>
              )}
              <div className="space-y-6 text-foreground/80 leading-relaxed text-base">
                {section.content.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>
            </div>
          ))}

          {/* Citação / Destaque */}
          {translation.quote && (
            <div data-content-block className="my-14 p-8 md:p-10 rounded-3xl bg-[#F2F6F2] border-l-8 border-primary relative overflow-hidden">
              <div className="absolute -top-6 -left-2 text-primary/5 text-9xl font-black select-none pointer-events-none">“</div>
              <p className="relative z-10 font-medium italic text-lg md:text-xl text-primary leading-relaxed">
                "{translation.quote}"
              </p>
            </div>
          )}
        </div>
      </Container>

      {/* ─── Seção Leia Também ─── */}
      <div ref={relatedRef} className="border-t border-foreground/10 bg-[#F2F6F2] py-24">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-baseline gap-4 mb-12">
            <div data-related-title>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('relatedTitle')}
              </span>
              <h2 className="font-montserrat text-3xl md:text-4xl font-black uppercase text-foreground tracking-tight leading-[0.95]">
                {t('relatedTitle')}
              </h2>
            </div>
            <Link
              href="/materias"
              className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs transition-transform hover:translate-x-1"
            >
              {t('backButton')} <ArrowTopRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedArticles.map((rel) => {
              const relTrans = rel.translations[locale] || rel.translations['pt-BR']
              return (
                <Link
                  key={rel.id}
                  href={`/materias/${rel.id}`}
                  data-related-card
                  className="group flex flex-col h-full rounded-2xl overflow-hidden border border-foreground/10 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`relative h-44 bg-gradient-to-br ${rel.color} overflow-hidden`}>
                    <Image
                      src={rel.image}
                      alt={relTrans.title}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                    <span className="absolute top-4 left-4 z-10 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-foreground shadow-sm">
                      {tCat(rel.category)}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-foreground/50 mb-3">
                      {rel.date} · {rel.readTime}
                    </span>
                    <h3 className="text-base font-bold text-foreground mb-6 group-hover:text-primary transition-colors leading-snug flex-1">
                      {relTrans.title}
                    </h3>
                    <span className="mt-auto inline-flex items-center gap-1.5 text-primary font-bold uppercase tracking-wider text-xs transition-transform group-hover:translate-x-1">
                      {t('backButton').split(' ')[0]} <ArrowTopRightIcon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </Container>
      </div>

      {/* ─── CTA WhatsApp ─── */}
      <Container className="py-16">
        <div 
          ref={ctaRef} 
          className="rounded-3xl bg-[#004C26] text-white p-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 max-w-[640px]">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {t('author')}
            </span>
            <h2 className="font-montserrat text-3xl md:text-4xl font-black uppercase tracking-tight mb-4 leading-[0.95] text-white">
              {t('ctaTitleStart')} <em className="text-[#F0E27A] not-italic">{t('ctaTitleHighlight')}</em>
            </h2>
            <p className="text-white/80 text-base md:text-lg">
              {t('ctaBody')}
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <a
              href="https://wa.me/5519999648186"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-primary px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm transition-transform hover:scale-105 shadow-xl hover:shadow-yellow-400/20"
            >
              {t('ctaButton')}
              <ArrowTopRightIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </Container>
    </div>
  )
}
