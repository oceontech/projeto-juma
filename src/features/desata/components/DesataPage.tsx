'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import { Container } from '@/components/layout/Container'
import { useTranslations } from 'next-intl'
import { gsap, SplitText, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'

export function DesataPage() {
  const t = useTranslations('desataPage')
  const reduced = useReducedMotion()

  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const heroTitleRef = useRef<HTMLHeadingElement>(null)
  const heroDescRef = useRef<HTMLParagraphElement>(null)
  
  const topicsRef = useRef<HTMLDivElement>(null)
  const teamRef = useRef<HTMLDivElement>(null)
  const partnersRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduced || !containerRef.current) return

      // Hero Animation
      const heroTitle = heroTitleRef.current
      const heroDesc = heroDescRef.current

      const split = heroTitle ? new SplitText(heroTitle, { type: 'words,lines' }) : null
      const words = split?.words ?? []

      if (heroTitle) gsap.set(heroTitle, { opacity: 0 })
      if (words.length) gsap.set(words, { y: 24, opacity: 0, filter: 'blur(10px)' })
      if (heroDesc) gsap.set(heroDesc, { y: 20, opacity: 0 })

      const tl = gsap.timeline({ delay: 0.8, defaults: { ease: EASE.reveal } })
      if (heroTitle) tl.set(heroTitle, { opacity: 1 }, 0.1)
      if (words.length) tl.to(words, { y: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.word }, 0.1)
      if (heroDesc) tl.to(heroDesc, { y: 0, opacity: 1, duration: DUR.sub }, 0.6)

      // Topics Section
      if (topicsRef.current) {
        const section = topicsRef.current
        const rows = gsap.utils.toArray<HTMLElement>('.fade-up', section)
        rows.forEach((row) => {
          gsap.set(row, { y: 50, opacity: 0, scale: 0.98, filter: 'blur(8px)' })
          ScrollTrigger.create({
            trigger: row,
            start: 'top 85%',
            animation: gsap.to(row, {
              y: 0,
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)',
              duration: 1.2,
              ease: 'power3.out'
            })
          })
        })
      }

      // Team Section
      if (teamRef.current) {
        const section = teamRef.current
        const title = section.querySelector('h2')
        const members = gsap.utils.toArray<HTMLElement>('.fade-up', section)
        const images = section.querySelectorAll('.rounded-full')

        if (title) gsap.set(title, { y: 20, opacity: 0 })
        if (members.length) gsap.set(members, { y: 30, opacity: 0 })
        if (images.length) gsap.set(images, { scale: 0.5, opacity: 0 })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
          }
        })

        if (title) tl.to(title, { y: 0, opacity: 1, duration: 0.8, ease: EASE.reveal })
        if (members.length) tl.to(members, { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: EASE.reveal }, '-=0.4')
        if (images.length) tl.to(images, { scale: 1, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'back.out(1.4)' }, '<0.2')
      }

      // Partners Section
      if (partnersRef.current) {
        const section = partnersRef.current
        const title = section.querySelector('h2')
        const logos = gsap.utils.toArray<HTMLElement>('.partner-logo', section)

        if (title) gsap.set(title, { y: 20, opacity: 0 })
        if (logos.length) gsap.set(logos, { y: 20, opacity: 0, scale: 0.8 })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
          }
        })
        if (title) tl.to(title, { y: 0, opacity: 1, duration: 0.8, ease: EASE.reveal })
        if (logos.length) tl.to(logos, { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, ease: 'back.out(1.5)' }, '-=0.4')
      }

      // Video Section
      if (videoRef.current) {
        const section = videoRef.current
        const videoWrapper = section.querySelector('.aspect-video')
        if (videoWrapper) {
          gsap.set(videoWrapper, { clipPath: 'inset(10% 5% 10% 5% round 24px)', scale: 0.95, opacity: 0, filter: 'blur(10px)' })
          ScrollTrigger.create({
            trigger: section,
            start: 'top 85%',
            animation: gsap.to(videoWrapper, {
              clipPath: 'inset(0% 0% 0% 0% round 24px)',
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 1.5,
              ease: 'power3.inOut'
            })
          })
        }
      }
    },
    { scope: containerRef }
  )

  return (
    <div ref={containerRef} className="flex flex-col gap-24 md:gap-32">
      {/* 1. Hero Section */}
      <section ref={heroRef} className="relative w-full min-h-[90vh] flex flex-col justify-center items-center pt-[140px] pb-[80px] overflow-hidden bg-black">
        {/* Background Image Placeholder from Unsplash */}
        <Image
          src="/desata/maquina-agricola.webp"
          alt="Desata Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        <Container className="relative z-10 w-full flex flex-col items-center">
          {/* Glassmorphism Card */}
          <div className="bg-black/30 backdrop-blur-md border border-white/20 p-8 md:p-14 rounded-3xl flex flex-col items-center text-center max-w-[840px] w-full shadow-2xl">
            <h1 ref={heroTitleRef} className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight font-montserrat text-white drop-shadow-md mb-6">
              {t.rich('hero.title', { highlight: (chunks) => <span className="text-[#00A859] drop-shadow-md">{chunks}</span> })}
            </h1>
            <p ref={heroDescRef} className="text-lg md:text-xl max-w-[48rem] text-white/90 drop-shadow-sm">
              {t('hero.description')}
            </p>
          </div>
        </Container>
      </section>

      {/* 2. Topics Section */}
      <section ref={topicsRef} className="w-full">
        <Container>
          <div className="flex flex-col gap-16 md:gap-32">
            
            {/* Topic 1 - Image Left, Text Right */}
            <div className="fade-up flex flex-col md:flex-row items-center gap-8 md:gap-16">
              <div className="w-full md:w-1/2 relative h-[300px] md:h-[450px] rounded-3xl overflow-hidden shadow-xl">
                <Image src="/desata/maquina-hidratacao-agricola.webp" alt="Quem Somos" fill className="object-cover" />
              </div>
              <div className="w-full md:w-1/2 flex flex-col gap-6">
                <h3 className="text-3xl md:text-4xl font-bold uppercase tracking-wide font-montserrat text-[#004C26]">{t('topics.t1Title')}</h3>
                <p className="text-lg md:text-xl text-[#5A5A57] leading-relaxed">{t('topics.t1Desc')}</p>
              </div>
            </div>

            {/* Topic 2 - Image Right, Text Left */}
            <div className="fade-up flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16">
              <div className="w-full md:w-1/2 relative h-[300px] md:h-[450px] rounded-3xl overflow-hidden shadow-xl">
                <Image src="/desata/maquina-aplicacao-agricola.webp" alt="Nosso Propósito" fill className="object-cover" />
              </div>
              <div className="w-full md:w-1/2 flex flex-col gap-6">
                <h3 className="text-3xl md:text-4xl font-bold uppercase tracking-wide font-montserrat text-[#004C26]">{t('topics.t2Title')}</h3>
                <p className="text-lg md:text-xl text-[#5A5A57] leading-relaxed">{t('topics.t2Desc')}</p>
              </div>
            </div>

            {/* Topic 3 - Image Left, Text Right */}
            <div className="fade-up flex flex-col md:flex-row items-center gap-8 md:gap-16">
              <div className="w-full md:w-1/2 relative h-[300px] md:h-[450px] rounded-3xl overflow-hidden shadow-xl">
                <Image src="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=1200&auto=format&fit=crop" alt="Por Que Nascemos" fill className="object-cover" />
              </div>
              <div className="w-full md:w-1/2 flex flex-col gap-6">
                <h3 className="text-3xl md:text-4xl font-bold uppercase tracking-wide font-montserrat text-[#004C26]">{t('topics.t3Title')}</h3>
                <p className="text-lg md:text-xl text-[#5A5A57] leading-relaxed">{t('topics.t3Desc')}</p>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* 3. Team Section */}
      <section ref={teamRef} className="w-full bg-muted/30 py-24">
        <Container>
          <div className="fade-up flex flex-col items-center text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold uppercase font-montserrat tracking-tight mb-4">
              {t('team.title')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-[56rem] mx-auto">
            <div className="fade-up flex flex-col items-center gap-6">
              <div className="relative w-[16rem] h-[16rem] rounded-full overflow-hidden border-4 border-primary/20">
                <Image
                  src="/desata/team-1.webp"
                  alt={t('team.member1Name')}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-center">
                <h4 className="text-xl font-bold font-montserrat">{t('team.member1Name')}</h4>
                <p className="text-muted-foreground mt-2">{t('team.member1Role')}</p>
              </div>
            </div>
            
            <div className="fade-up flex flex-col items-center gap-6">
              <div className="relative w-[16rem] h-[16rem] rounded-full overflow-hidden border-4 border-primary/20">
                <Image
                  src="/desata/team-2.webp"
                  alt={t('team.member2Name')}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-center">
                <h4 className="text-xl font-bold font-montserrat">{t('team.member2Name')}</h4>
                <p className="text-muted-foreground mt-2">{t('team.member2Role')}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 4. Partners Section */}
      <section ref={partnersRef} className="w-full py-12">
        <Container>
          <div className="fade-up flex flex-col items-center text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold uppercase font-montserrat tracking-tight">
              {t('partners.title')}
            </h2>
          </div>
          
          <div className="fade-up flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-80">
            <div className="partner-logo relative w-[12rem] md:w-[16rem] h-[6rem] md:h-[8rem]">
              <Image src="/desata/logo_nitec.webp" alt="NITEC" fill className="object-contain" />
            </div>
            <div className="partner-logo relative w-[12rem] md:w-[16rem] h-[6rem] md:h-[8rem]">
              <Image src="/desata/logo_uenp.webp" alt="UENP" fill className="object-contain" />
            </div>
            <div className="partner-logo relative w-[12rem] md:w-[16rem] h-[6rem] md:h-[8rem]">
              <Image src="/brand/logo-juma-agro.png" alt="Juma Agro" fill className="object-contain" />
            </div>
          </div>
        </Container>
      </section>

      {/* 5. Video Section */}
      <section ref={videoRef} className="w-full pb-24">
        <Container>
          <div className="fade-up w-full max-w-[64rem] mx-auto rounded-3xl overflow-hidden shadow-2xl relative aspect-video bg-black">
            <iframe 
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/82rGv7Kv5Vw?si=pTp4nEsyxi4QJrq4&rel=0" 
              title="Programa Desata"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen>
            </iframe>
          </div>
        </Container>
      </section>
    </div>
  )
}
