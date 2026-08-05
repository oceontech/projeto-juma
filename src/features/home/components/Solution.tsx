'use client'

import { Lightbulb, Search, Sprout, LineChart } from 'lucide-react'
import Image from 'next/image'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'

import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { createCharReveal, revealToggleActions } from '@/features/animation/charReveal'
import { DUR, EASE } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/layout/Container'

export function Solution() {
  const t = useTranslations('solution')
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const introRef = useRef<HTMLParagraphElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  const images = [
    '/solution/trator-campo-aberto.webp', // Campo agrícola/Cultura
    '/solution/campo-crescendo.webp', // Agrônomo com tablet / Planejamento
    '/solution/produtor-tecnico.webp', // Time técnico/Conversa
  ]

  useGSAP(
    () => {
      if (reduced || !ref.current) return

      const title = titleRef.current
      const intro = introRef.current
      const cta = ctaRef.current

      const reveal = createCharReveal(title)
      const isMobile = window.innerWidth < 1024

      if (title) gsap.set(title, { opacity: 0 })
      reveal?.hide()
      if (intro) gsap.set(intro, { y: 20, opacity: 0 })
      if (cta) gsap.set(cta, { y: 16, opacity: 0 })

      /* O gatilho mede o TÍTULO, não a seção.
         Esta seção é altíssima — três passos de 60 a 75vh cada, mais de dois
         mil pixels. Ancorado nela, o `top 85%` disparava assim que a BORDA de
         cima da seção aparecia, com o título ainda lá embaixo: quando o usuário
         finalmente chegava a ele para ler, a animação havia terminado fazia
         tempo, e a impressão era de que ela não existia. Medindo o título, a
         entrada acontece quando é ele que chega. */
      const tlHead = gsap.timeline({
        scrollTrigger: {
          trigger: title ?? ref.current,
          start: 'top 85%',
          end: 'bottom top',
          toggleActions: revealToggleActions(),
        },
      })

      const gline = ref.current.querySelector<HTMLElement>('[data-gline]')
      if (gline) gsap.set(gline, { scaleX: 0, opacity: 0, transformOrigin: 'left center' })

      if (title) tlHead.set(title, { opacity: 1 }, 0)
      reveal?.playIn(tlHead, 0)

      if (gline)
        tlHead.to(gline, { scaleX: 1, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.2)

      if (intro)
        tlHead.to(intro, { y: 0, opacity: 1, duration: DUR.sub, ease: EASE.reveal }, 0.35)

      if (cta)
        tlHead.to(cta, { y: 0, opacity: 1, duration: 0.6, ease: EASE.reveal }, 0.45)

      // Timeline Progress e animações dos passos
      if (stepsRef.current) {
        // Preenchimento da linha de progresso e indicador da ponta
        const timelineProgress = stepsRef.current.querySelector('[data-timeline-progress]')
        const timelineTip = stepsRef.current.querySelector('[data-timeline-tip]')
        
        if (timelineProgress && timelineTip) {
          gsap.set(timelineProgress, { scaleY: 0, transformOrigin: 'top center' })
          gsap.set(timelineTip, { top: 0 })

          /* Uma timeline só dirigindo os dois, em vez de duas tweens com o
             MESMO objeto de config passado por scrollTrigger — cada uma virava
             seu próprio ScrollTrigger, com o mesmo range e o mesmo scrub
             inercial (0.5) rodando em dobro. Numa seção com tantos outros
             gatilhos por scroll (o pulso de cada passo, mais abaixo), essa
             redundância pesava exatamente no tipo de scroll rápido do celular
             — cada evento de scroll deixava DOIS tweens de inércia terminando
             de assentar em vez de um, e era esse acúmulo que fazia a rolagem
             "acelerar" ao passar por aqui e continuar pesada logo depois. */
          const progressTl = gsap.timeline({
            scrollTrigger: {
              trigger: stepsRef.current,
              start: 'top 50%', // Inicia quando o topo da timeline chega próximo do centro
              end: 'bottom 50%', // Termina quando o fundo chega próximo do centro
              scrub: 0.5,
            },
          })
          progressTl.to(timelineProgress, { scaleY: 1, ease: 'none' }, 0)
          progressTl.to(timelineTip, { top: '100%', ease: 'none' }, 0)
        }

        const steps = gsap.utils.toArray<HTMLElement>('[data-step]', stepsRef.current)

        steps.forEach((step, index) => {
          const bg = step.querySelector<HTMLElement>('[data-step-bg]')
          const card = step.querySelector<HTMLElement>('[data-step-card]')
          const dot = step.querySelector<HTMLElement>('[data-step-dot]')
          const icon = step.querySelector<HTMLElement>('[data-step-icon]')

          // Estado inicial (fora de foco)
          if (bg) gsap.set(bg, { opacity: 0.15, scale: 0.9, ...(!isMobile && { filter: 'blur(12px)' }) })
          if (card) gsap.set(card, { opacity: 0, y: 30, scale: 0.95 })
          if (dot) gsap.set(dot, { scale: 1, backgroundColor: '#F7F8F6', borderColor: 'rgba(26, 26, 26, 0.1)' })
          if (icon) gsap.set(icon, { color: 'rgba(26, 26, 26, 0.2)' })

          /* Pulso móvel cresce ao se aproximar da etapa — só no desktop.
             No celular é um detalhe fácil de não notar (o indicador é
             pequeno, numa coluna estreita), e cada passo soma mais um
             ScrollTrigger de scrub rodando durante o scroll — três a mais
             numa seção que já tem bastante coisa presa ao scroll. */
          if (!isMobile) {
            ScrollTrigger.create({
              trigger: step,
              start: 'top 50%',
              end: 'center 50%',
              scrub: true,
              animation: gsap.fromTo(timelineTip, { scale: 0.2 }, { scale: 1, ease: 'none', immediateRender: false })
            })
          }

          // Trigger para a bolinha fixa e o card de conteúdo
          ScrollTrigger.create({
            trigger: step,
            start: 'center 50%', // Exatamente quando o pulso atinge o tamanho máximo dentro da bolinha
            end: 'bottom 50%',
            onEnter: () => {
              if (bg) gsap.to(bg, { opacity: 1, scale: 1, ...(!isMobile && { filter: 'blur(0px)' }), duration: 0.8, ease: 'power3.out', overwrite: 'auto' })
              if (card) gsap.to(card, { opacity: 1, y: 0, scale: 1, duration: 0.5, delay: 0.1, ease: 'back.out(1.2)', overwrite: 'auto' })
              if (dot) gsap.to(dot, { scale: 1.05, backgroundColor: '#004C26', borderColor: '#004C26', duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
              if (icon) gsap.to(icon, { color: '#FFFFFF', duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
              
              // Murcha o pulso rapidamente logo após o encaixe
              if (timelineTip) gsap.to(timelineTip, { scale: 0.2, duration: 0.2, overwrite: 'auto' })
            },
            onLeave: () => {
              // Mantém a imagem e o card visíveis ao rolar para baixo
              if (dot) gsap.to(dot, { scale: 1, backgroundColor: '#004C26', borderColor: '#004C26', duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
              if (icon) gsap.to(icon, { color: '#FFFFFF', duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
            },
            onEnterBack: () => {
              if (bg) gsap.to(bg, { opacity: 1, scale: 1, ...(!isMobile && { filter: 'blur(0px)' }), duration: 0.8, ease: 'power3.out', overwrite: 'auto' })
              if (card) gsap.to(card, { opacity: 1, y: 0, scale: 1, duration: 0.5, delay: 0.1, ease: 'back.out(1.2)', overwrite: 'auto' })
              if (dot) gsap.to(dot, { scale: 1.05, backgroundColor: '#004C26', borderColor: '#004C26', duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
              if (icon) gsap.to(icon, { color: '#FFFFFF', duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
              
              // Mantém o pulso pequeno ao voltar de baixo para cima
              if (timelineTip) gsap.to(timelineTip, { scale: 0.2, duration: 0.2, overwrite: 'auto' })
            },
            onLeaveBack: () => {
              if (bg) gsap.to(bg, { opacity: 0.15, scale: 0.9, ...(!isMobile && { filter: 'blur(12px)' }), duration: 0.6, ease: 'power2.out', overwrite: 'auto' })
              if (card) gsap.to(card, { opacity: 0, y: 20, scale: 0.95, duration: 0.4, ease: 'power2.in', overwrite: 'auto' })
              if (dot) gsap.to(dot, { scale: 1, backgroundColor: '#F7F8F6', borderColor: 'rgba(26, 26, 26, 0.1)', duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
              if (icon) gsap.to(icon, { color: 'rgba(26, 26, 26, 0.2)', duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
            }
          })
        })
      }

      return () => reveal?.revert()
    },
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <section ref={ref} className="bg-[#F7F8F6] py-4xl lg:py-5xl">
      <Container className="min-[1600px]:max-w-[100rem] min-[2000px]:max-w-[120rem]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-12 lg:gap-20 items-start relative">
          
          {/* Coluna Esquerda: Informações Fixas/Sticky no Desktop */}
          <div className="lg:sticky lg:top-24 flex flex-col justify-between py-4">
            <div>
              <div className="mb-8">
                <span className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] uppercase rounded-full px-4 py-2 mb-6 border border-primary/20 bg-primary/5 text-primary">
                  <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" />
                  {t('stepsTitle')}
                </span>
              </div>

              <h2
                ref={titleRef}
                className="font-black uppercase leading-[1.05] tracking-tight text-foreground"
                style={{ fontSize: 'clamp(2.5rem, 4vw, 4.5rem)' }}
              >
                {t.rich('title', {
                  highlight: (chunks) => <span className="text-highlight text-primary">{chunks}</span>,
                })}
              </h2>
              <span data-gline aria-hidden className="mt-8 block h-[3px] w-12 rounded-full bg-primary" />

              <p
                ref={introRef}
                className="text-subtitle m-0 mt-xl max-w-none text-base leading-relaxed text-foreground/65 lg:text-lg"
              >
                {t('intro')}
              </p>
            </div>

            {/* Botão de CTA integrado na barra lateral sticky */}
            <div ref={ctaRef} className="mt-10 lg:mt-12">
              <Link
                href="/contato"
                className="text-body-regular inline-flex items-center justify-center rounded-full bg-primary px-xl py-md text-base text-white transition-opacity hover:opacity-80"
              >
                {t('cta')}
              </Link>
            </div>
          </div>

          {/* Coluna Direita: Passos Roláveis */}
          <div ref={stepsRef} className="relative pl-[60px] lg:pl-[100px] mt-8 lg:mt-0">
            {/* Linha vertical da timeline */}
            <div className="absolute left-[29px] lg:left-[49px] top-0 bottom-0 w-[2px] bg-foreground/10" />

            {/* Linha vertical de progresso (preenchimento no scroll) */}
            <div
              data-timeline-progress
              className="absolute left-[29px] lg:left-[49px] top-0 bottom-0 w-[2px] bg-primary origin-top scale-y-0"
            />

            {/* Indicador móvel na ponta da linha (O Pulso Verde) */}
            <div
              data-timeline-tip
              className="absolute left-[30px] lg:left-[50px] top-0 w-10 h-10 -ml-5 -mt-5 rounded-full bg-primary shadow-[0_0_15px_rgba(0,76,38,0.5)] z-20 pointer-events-none"
              style={{ transform: 'scale(0.2)' }}
            />

            {/* Cada um dos 3 Passos */}
            {([1, 2, 3] as const).map((n) => (
              <div
                key={n}
                data-step
                className="relative flex items-center py-12 lg:py-16 first:pt-4 last:pb-4"
              >
                {/* Fundo fixo da bolinha da timeline (z-10) */}
                <div
                  data-step-dot
                  className="absolute left-[-30px] lg:left-[-50px] top-1/2 -mt-5 w-10 h-10 -ml-5 rounded-full border-2 border-foreground/10 bg-[#F7F8F6] z-10 transition-all duration-300"
                />

                {/* Ícone fixo da bolinha (z-30) sobrepõe o pulso */}
                <div
                  data-step-icon
                  className="absolute left-[-30px] lg:left-[-50px] top-1/2 -mt-5 w-10 h-10 -ml-5 flex items-center justify-center text-foreground/20 z-30 pointer-events-none transition-colors duration-300"
                >
                  {n === 1 && <Search size={20} />}
                  {n === 2 && <Sprout size={20} />}
                  {n === 3 && <LineChart size={20} />}
                </div>

                {/* Conteúdo do Passo.
                    No desktop, alterna de lado a cada passo — a primeira
                    imagem fica à direita (longe da linha do tempo), a
                    segunda à esquerda (perto dela), e assim por diante — só
                    a largura muda de lugar, o layout mobile (coluna única,
                    imagem cheia) continua igual. */}
                <div
                  className={`relative w-full aspect-[4/3] lg:aspect-auto lg:h-[75vh] lg:w-[70%] flex ${
                    n % 2 === 0 ? 'lg:mr-auto' : 'lg:ml-auto'
                  }`}
                >
                  <div data-step-bg className="absolute inset-0 origin-center rounded-[24px] overflow-hidden shadow-2xl">
                    <Image
                      src={images[n - 1]}
                      alt={t(`step${n}.title` as any)}
                      fill
                      sizes="(max-width: 1024px) 100vw, 70vw"
                      className="object-cover"
                      priority={n === 1}
                      quality={60}
                    />
                    {/* Overlay escuro sutil sobre a imagem */}
                    <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                  </div>
                  
                  {/* Posicionamento alternado do card de vidro */}
                  <div className={`relative z-10 w-full h-full p-6 lg:p-12 flex flex-col ${
                    n === 1 ? 'justify-start items-start' : 
                    n === 2 ? 'justify-center items-end' : 
                    'justify-end items-start'
                  } pointer-events-none`}>
                    {/* Sem backdrop-blur no celular: estes cards ficam por cima
                        do fundo que o ScrollTrigger escala e desfoca durante o
                        scrub da seção, então o desfoque de fundo era recalculado
                        a cada passo do scroll. `bg-black/60` mantém a legibilidade
                        do texto branco sem reler o que está atrás. */}
                    <div data-step-card className="bg-black/60 md:bg-black/35 md:backdrop-blur-md border border-white/20 p-6 lg:p-10 rounded-2xl flex flex-col max-w-[95%] lg:max-w-[65%] pointer-events-auto shadow-xl">
                      <span className="font-tech text-xs lg:text-sm font-semibold tracking-widest text-white/80 uppercase mb-3">
                        {String(t('stepsTitle')).split(',')[0]} {String(n).padStart(2, '0')}
                      </span>
                      <h3
                        className="font-black uppercase tracking-tight text-white m-0 mb-4 drop-shadow-md leading-tight"
                        style={{ fontSize: 'clamp(1.5rem, 2vw, 2.25rem)' }}
                      >
                        {t(`step${n}.title` as any)}
                      </h3>
                      <p className="text-white/95 m-0 text-base lg:text-lg leading-relaxed drop-shadow-sm font-medium">
                        {t(`step${n}.body` as any)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </Container>
    </section>
  )
}

