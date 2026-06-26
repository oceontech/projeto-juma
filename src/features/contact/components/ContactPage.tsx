'use client'

import React, { useRef } from 'react'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/layout/Container'
import { useTranslations } from 'next-intl'
import { gsap, SplitText, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'

function ArrowTopRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function PinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export function ContactPage() {
  const t = useTranslations('contactPage')
  const reduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLSpanElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const introRef = useRef<HTMLParagraphElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduced || !containerRef.current) return

      const eyebrow = eyebrowRef.current
      const title = titleRef.current
      const intro = introRef.current
      const grid = gridRef.current
      const cta = ctaRef.current

      const split = title ? new SplitText(title, { type: 'chars,lines' }) : null
      const chars = split?.chars ?? []

      if (eyebrow) gsap.set(eyebrow, { y: 15, opacity: 0 })
      if (title) gsap.set(title, { opacity: 0 })
      if (chars.length) gsap.set(chars, { x: 20, opacity: 0, filter: 'blur(10px)' })
      if (intro) gsap.set(intro, { y: 20, opacity: 0 })
      if (cta) gsap.set(cta, { y: 24, opacity: 0 })

      const tl = gsap.timeline({ defaults: { ease: EASE.reveal } })
      if (eyebrow) tl.to(eyebrow, { y: 0, opacity: 1, duration: 0.5 })
      if (title) tl.set(title, { opacity: 1 }, 0.1)
      if (chars.length) tl.to(chars, { x: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.char }, 0.1)
      if (intro) tl.to(intro, { y: 0, opacity: 1, duration: DUR.sub }, 0.4)

      if (grid) {
        const form = grid.querySelector('[data-contact-form]')
        const sidebar = grid.querySelector('[data-contact-sidebar]')
        const sidebarItems = sidebar ? gsap.utils.toArray<HTMLElement>('[data-contact-item]', sidebar) : []

        if (form) gsap.set(form, { y: 24, opacity: 0 })
        if (sidebarItems.length) gsap.set(sidebarItems, { y: 15, opacity: 0 })

        ScrollTrigger.create({
          trigger: grid,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            const tlGrid = gsap.timeline({ defaults: { ease: EASE.reveal } })
            if (form) tlGrid.to(form, { y: 0, opacity: 1, duration: 0.8 })
            if (sidebarItems.length) {
              tlGrid.to(sidebarItems, { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 }, 0.2)
            }
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

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    window.open('https://wa.me/5519999648186', '_blank')
  }

  return (
    <Container>
      <div ref={containerRef}>
        {/* Cabeçalho */}
        <div className="mb-24">
          <span ref={eyebrowRef} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {t('eyebrow')}
          </span>
          <h1 ref={titleRef} className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-black uppercase text-foreground tracking-tight mb-6 max-w-[42rem] leading-tight">
            {t('titleStart')} <em className="text-highlight text-primary">{t('titleHighlight')}</em>
          </h1>
          <p ref={introRef} className="text-lg md:text-xl text-foreground/70 max-w-[48rem] leading-relaxed">
            {t('intro')}
          </p>
        </div>

      <div ref={gridRef} className="flex flex-col lg:flex-row gap-16 lg:gap-24 mb-32">
        {/* Formulário */}
        <div data-contact-form className="lg:w-2/3">
          <form
            onSubmit={handleWhatsAppSubmit}
            className="bg-white rounded-3xl p-8 md:p-12 border border-foreground/10 shadow-sm"
          >
            <h2 className="font-montserrat text-2xl font-black text-foreground mb-8">
              {t('formTitle')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="md:col-span-2 space-y-2">
                <label htmlFor="nome" className="text-sm font-bold text-foreground/80">{t('labelName')}</label>
                <input id="nome" name="nome" type="text" required placeholder={t('placeholderName')} className="w-full bg-foreground/5 border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label htmlFor="wpp" className="text-sm font-bold text-foreground/80">{t('labelWhatsApp')}</label>
                <input id="wpp" name="wpp" type="tel" required placeholder="(19) 9 9999-9999" className="w-full bg-foreground/5 border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold text-foreground/80">{t('labelEmail')}</label>
                <input id="email" name="email" type="email" required placeholder="seu@email.com" className="w-full bg-foreground/5 border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label htmlFor="cultura" className="text-sm font-bold text-foreground/80">{t('labelCulture')}</label>
                <select id="cultura" name="cultura" className="w-full bg-foreground/5 border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer">
                  <option>Soja</option>
                  <option>Milho</option>
                  <option>Café</option>
                  <option>Cana-de-açúcar</option>
                  <option>Algodão</option>
                  <option>Feijão</option>
                  <option>Citros</option>
                  <option>Tomate</option>
                  <option>Batata</option>
                  <option>Pastagem</option>
                  <option>Outra</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="regiao" className="text-sm font-bold text-foreground/80">{t('labelRegion')}</label>
                <input id="regiao" name="regiao" type="text" required placeholder={t('placeholderRegion')} className="w-full bg-foreground/5 border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label htmlFor="produto" className="text-sm font-bold text-foreground/80">{t('labelProduct')}</label>
                <select id="produto" name="produto" className="w-full bg-foreground/5 border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer">
                  <option>{t('productDefault')}</option>
                  <option>Aminosan®</option>
                  <option>Acorda Ultra</option>
                  <option>Acorda Cana</option>
                  <option>Fitofert</option>
                  <option>Linha Revigo</option>
                  <option>RevigoPhos Amino</option>
                  <option>Revigo Cobre Ultra</option>
                  <option>Kmep Ultra</option>
                  <option>Linha Redutan</option>
                  <option>Supermix</option>
                  <option>Revigo + Milho</option>
                  <option>Revigo + Pasto</option>
                  <option>Aduban</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label htmlFor="mensagem" className="text-sm font-bold text-foreground/80">{t('labelMessage')}</label>
                <textarea id="mensagem" name="mensagem" placeholder={t('placeholderMessage')} rows={4} className="w-full bg-foreground/5 border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"></textarea>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-6 border-t border-foreground/10">
              <p className="text-xs text-foreground/50 leading-relaxed flex-1">
                {t('privacyNote')}
              </p>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm transition-transform hover:scale-105 shadow-md"
              >
                {t('submitButton')}
                <WhatsAppIcon className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Informações */}
        <div data-contact-sidebar className="lg:w-1/3 flex flex-col gap-8">
          <div className="p-8 rounded-3xl bg-foreground/5 border border-foreground/10 flex flex-col gap-8">
            <a data-contact-item href="https://wa.me/5519999648186" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
              <div className="shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white shadow-md group-hover:scale-110 transition-transform">
                <WhatsAppIcon className="h-5 w-5" />
              </div>
              <div>
                <b className="block text-lg font-bold text-foreground group-hover:text-primary transition-colors">(19) 99964-8186</b>
                <span className="text-sm text-foreground/60 leading-tight">{t('whatsappSubtitle')}</span>
              </div>
            </a>

            <div data-contact-item className="flex items-start gap-4">
              <div className="shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-white text-primary shadow-sm border border-foreground/10">
                <PhoneIcon className="h-5 w-5" />
              </div>
              <div>
                <b className="block text-lg font-bold text-foreground">(19) 3891-6415</b>
                <span className="text-sm text-foreground/60 leading-tight">{t('phoneSubtitle')}</span>
              </div>
            </div>

            <div data-contact-item className="flex items-start gap-4">
              <div className="shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-white text-primary shadow-sm border border-foreground/10">
                <MailIcon className="h-5 w-5" />
              </div>
              <div>
                <b className="block text-lg font-bold text-foreground">marketing@juma-agro.com.br</b>
                <span className="text-sm text-foreground/60 leading-tight">{t('emailSubtitle')}</span>
              </div>
            </div>

            <div data-contact-item className="flex items-start gap-4">
              <div className="shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-white text-primary shadow-sm border border-foreground/10">
                <ClockIcon className="h-5 w-5" />
              </div>
              <div>
                <b className="block text-lg font-bold text-foreground">{t('hoursMain')}</b>
                <span className="text-sm text-foreground/60 leading-tight">{t('hoursAlt')}</span>
              </div>
            </div>

            <div data-contact-item className="flex items-start gap-4">
              <div className="shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-white text-primary shadow-sm border border-foreground/10">
                <PinIcon className="h-5 w-5" />
              </div>
              <div>
                <b className="block text-lg font-bold text-foreground">{t('locationMain')}</b>
                <span className="text-sm text-foreground/60 leading-tight">{t('locationAlt')}</span>
              </div>
            </div>
          </div>

          <div data-contact-item className="rounded-3xl bg-foreground/10 h-64 border border-foreground/10 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-multiply" />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="h-10 w-10 bg-primary text-white flex items-center justify-center rounded-full shadow-xl">
                <PinIcon className="h-5 w-5" />
              </div>
              <span className="bg-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                {t('mapLabel')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div ref={ctaRef} className="rounded-3xl bg-primary text-white p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 max-w-[36rem]">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {t('ctaEyebrow')}
          </span>
          <h2 className="font-montserrat text-3xl md:text-4xl font-black uppercase text-white tracking-tight mb-4 leading-tight">
            {t('ctaTitleLine1')}<br />
            <em className="text-highlight text-white">{t('ctaTitleHighlight')}</em> {t('ctaTitleLine2')}
          </h2>
          <p className="text-white text-lg">
            {t('ctaBody')}
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <Link
            href="https://wa.me/5519999648186"
            target="_blank"
            className="inline-flex items-center gap-3 bg-yellow-400 text-primary px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm transition-transform hover:scale-105 shadow-xl hover:shadow-yellow-400/20"
          >
            {t('ctaButton')}
            <WhatsAppIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
      </div>
    </Container>
  )
}
