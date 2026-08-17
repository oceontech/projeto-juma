'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import { Container } from '@/components/layout/Container'
import { useTranslations } from 'next-intl'
import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { createCharReveal, createTextReveal, revealToggleActions } from '@/features/animation/charReveal'
import { onPageEntrance } from '@/features/animation/pageEntrance'
import { DUR, EASE, STAGGER, TRIGGER_START, blurPx } from '@/features/animation/motion'
import { isLowPower } from '@/features/animation/device'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { HomeCtaFinal } from '@/features/home/components/HomeCtaFinal'

export function OlhoNoAlvoPage() {
  const t = useTranslations('olhoNoAlvoPage')
  const reduced = useReducedMotion()

  const containerRef = useRef<HTMLDivElement>(null)
  const heroTitleRef = useRef<HTMLHeadingElement>(null)
  const heroDescRef = useRef<HTMLParagraphElement>(null)

  const topicsRef = useRef<HTMLDivElement>(null)
  const teamRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLDivElement>(null)

  const topics = [
    { titleStart: t('topics.t1TitleStart'), titleHighlight: t('topics.t1TitleHighlight'), alt: t('topics.t1Title'), desc: t('topics.t1Desc'), image: '/olho-no-alvo/olho-no-alvo-comercial.webp', reverse: true },
    { titleStart: t('topics.t2TitleStart'), titleHighlight: t('topics.t2TitleHighlight'), alt: t('topics.t2Title'), desc: t('topics.t2Desc'), image: '/desata/maquina-aplicacao-agricola.webp', reverse: false },
    { titleStart: t('topics.t3TitleStart'), titleHighlight: t('topics.t3TitleHighlight'), alt: t('topics.t3Title'), desc: t('topics.t3Desc'), image: '/desata/maquina-hidratacao-agricola.webp', reverse: true },
  ]

  // Só o time Juma-Agro — o programa não é mais uma parceria com a UENP.
  const team = [
    { name: t('team.member1Name'), role: t('team.member1Role'), image: '/desata/team-1.webp' },
  ]

  useGSAP(
    () => {
      if (reduced || !containerRef.current) return

      // Hero
      const heroTitle = heroTitleRef.current
      const heroDesc = heroDescRef.current

      const heroReveal = createCharReveal(heroTitle as HTMLElement | null, { by: 'words', axis: 'y', distance: 24 })

      if (heroTitle) gsap.set(heroTitle, { opacity: 0 })
      heroReveal?.hide()
      if (heroDesc) gsap.set(heroDesc, { y: 20, opacity: 0 })

      /* A abertura somava 1,4s antes de o texto de apoio começar a aparecer:
         0,8s de espera inicial mais 0,6s de posição na timeline. No celular
         isso é uma eternidade — o título já terminou de entrar e o parágrafo
         ainda não existe, o que faz a tela parecer travada. Os tempos caem
         para menos da metade, e mais ainda em aparelho de toque: o texto passa
         a acompanhar o fim da cascata do título em vez de esperar por ela. */
      const compacto = isLowPower()
      const espera = compacto ? 0.2 : 0.4
      const textoEm = compacto ? 0.28 : 0.42

      /* Pausada: quem solta é o portão do preloader (ver `pageEntrance`).
         Sem ele, a abertura rodava inteira atrás do overlay branco. */
      const heroTl = gsap.timeline({ paused: true, delay: espera, defaults: { ease: EASE.reveal } })
      if (heroTitle) heroTl.set(heroTitle, { opacity: 1 }, 0.1)
      heroReveal?.playIn(heroTl, 0.1)
      if (heroDesc) heroTl.to(heroDesc, { y: 0, opacity: 1, duration: DUR.sub }, textoEm)
      const soltarAbertura = onPageEntrance(() => heroTl.play())

      // Topics — mesmo mecanismo de reveal reversível usado no resto do site
      if (topicsRef.current) {
        const rows = gsap.utils.toArray<HTMLElement>('[data-topic-row]', topicsRef.current)
        rows.forEach((row) => {
          const title = row.querySelector<HTMLElement>('[data-topic-title]')
          const desc = row.querySelector<HTMLElement>('[data-topic-desc]')
          const media = row.querySelector<HTMLElement>('[data-topic-media]')

          const titleReveal = createCharReveal(title)
          const descReveal = createTextReveal(desc)

          titleReveal?.hide()
          descReveal?.hide()
          if (media) gsap.set(media, { y: 30, opacity: 0, scale: 0.97, filter: blurPx(8) })

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: row,
              start: TRIGGER_START,
              end: 'bottom top',
              toggleActions: revealToggleActions(),
            },
            defaults: { ease: EASE.reveal },
          })

          if (media) tl.to(media, { y: 0, opacity: 1, scale: 1, filter: blurPx(0), duration: DUR.title }, 0)
          titleReveal?.playIn(tl, 0)
          descReveal?.playIn(tl, '<0.1')
        })
      }

      // Team
      if (teamRef.current) {
        const section = teamRef.current
        const title = section.querySelector<HTMLElement>('[data-team-title]')
        const cards = gsap.utils.toArray<HTMLElement>('[data-team-card]', section)
        const photos = gsap.utils.toArray<HTMLElement>('[data-team-photo]', section)

        const titleReveal = createCharReveal(title)
        titleReveal?.hide()
        if (cards.length) gsap.set(cards, { y: 30, opacity: 0 })
        if (photos.length) gsap.set(photos, { scale: 0.5, opacity: 0 })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: TRIGGER_START,
            end: 'bottom top',
            toggleActions: revealToggleActions(),
          },
          defaults: { ease: EASE.reveal },
        })

        titleReveal?.playIn(tl, 0)
        if (cards.length) tl.to(cards, { y: 0, opacity: 1, duration: DUR.sub, stagger: STAGGER.card }, '<0.1')
        if (photos.length) tl.to(photos, { scale: 1, opacity: 1, duration: DUR.title, stagger: STAGGER.card, ease: 'back.out(1.4)' }, '<0.2')
      }

      // Video
      if (videoRef.current) {
        const videoWrapper = videoRef.current.querySelector<HTMLElement>('[data-video-wrapper]')
        if (videoWrapper) {
          gsap.set(videoWrapper, { clipPath: 'inset(10% 5% 10% 5% round 24px)', scale: 0.95, opacity: 0, filter: blurPx(10) })
          ScrollTrigger.create({
            trigger: videoRef.current,
            start: TRIGGER_START,
            animation: gsap.to(videoWrapper, {
              clipPath: 'inset(0% 0% 0% 0% round 24px)',
              scale: 1,
              opacity: 1,
              filter: blurPx(0),
              duration: 1.5,
              ease: EASE.inOut,
            }),
          })
        }
      }

      return () => soltarAbertura()
    },
    { scope: containerRef },
  )

  return (
    <div ref={containerRef} className="flex flex-col gap-24 md:gap-32">
      {/* 1. Hero */}
      <section className="relative w-full min-h-[90vh] flex flex-col justify-center items-center pt-[140px] pb-[80px] overflow-hidden bg-black">
        <Image
          src="/olho-no-alvo/banner-olho-no-alvo.webp"
          alt="Programa Olho no Alvo Juma Agro - Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        <Container className="relative z-10 w-full flex flex-col items-center">
          <div className="bg-black/30 backdrop-blur-md border border-white/20 p-8 md:p-14 rounded-3xl flex flex-col items-center text-center max-w-[840px] w-full shadow-2xl">
            <h1
              ref={heroTitleRef}
              className="m-0 mb-6 font-black uppercase leading-[1.05] tracking-tight text-white drop-shadow-md"
              style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}
            >
              {t.rich('hero.title', { highlight: (chunks) => <span className="text-highlight text-[#00A859] drop-shadow-md">{chunks}</span> })}
            </h1>
            <p ref={heroDescRef} className="text-lg md:text-xl max-w-[48rem] text-white/90 drop-shadow-sm">
              {t('hero.description')}
            </p>
          </div>
        </Container>
      </section>

      {/* 2. Topics */}
      <section ref={topicsRef} className="w-full">
        <Container>
          <div className="flex flex-col gap-16 md:gap-32">
            {topics.map((topic, i) => (
              <div
                key={i}
                data-topic-row
                className={`flex flex-col items-center gap-8 md:gap-16 ${topic.reverse ? 'md:flex-row-reverse' : 'md:flex-row'}`}
              >
                <div data-topic-media className="w-full md:w-1/2 relative h-[300px] md:h-[450px] rounded-3xl overflow-hidden shadow-xl">
                  <Image src={topic.image} alt={topic.alt} fill className="object-cover" />
                </div>
                <div className="w-full md:w-1/2 flex flex-col gap-6">
                  <h3 data-topic-title className="text-3xl md:text-4xl font-black uppercase tracking-wide font-montserrat text-foreground">
                    {topic.titleStart} <em className="text-highlight text-primary">{topic.titleHighlight}</em>
                  </h3>
                  <p data-topic-desc className="text-lg md:text-xl text-[#5A5A57] leading-relaxed">
                    {topic.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 3. Team */}
      <section ref={teamRef} className="w-full bg-muted/30 py-24">
        <Container>
          <div className="flex flex-col items-center text-center mb-16">
            <h2 data-team-title className="text-3xl md:text-4xl font-black uppercase font-montserrat tracking-tight text-foreground mb-4">
              {t('team.titleStart')} <em className="text-highlight text-primary">{t('team.titleHighlight')}</em>
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-12 max-w-[56rem] mx-auto">
            {team.map((member, i) => (
              <div key={i} data-team-card className="flex flex-col items-center gap-6">
                <div data-team-photo className="relative w-[16rem] h-[16rem] rounded-full overflow-hidden border-4 border-primary/20">
                  <Image src={member.image} alt={member.name} fill className="object-cover" />
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-black font-montserrat">{member.name}</h4>
                  <p className="text-muted-foreground mt-2">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 4. Video */}
      <section ref={videoRef} className="w-full pb-24">
        <Container>
          <div data-video-wrapper className="w-full max-w-[64rem] mx-auto rounded-3xl overflow-hidden shadow-2xl relative aspect-video bg-black">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/82rGv7Kv5Vw?si=pTp4nEsyxi4QJrq4&rel=0"
              title="Programa Olho no Alvo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </Container>
      </section>

      {/* 5. CTA final — mesmo fechamento de conversão das outras páginas internas */}
      <HomeCtaFinal />
    </div>
  )
}
