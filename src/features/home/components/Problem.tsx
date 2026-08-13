'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'

import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { createCharReveal } from '@/features/animation/charReveal'
import { EASE } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'

export function Problem() {
  const t = useTranslations('problem')
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const titleBoxRef = useRef<HTMLDivElement>(null)
  const titleRef   = useRef<HTMLHeadingElement>(null)
  const bodyRef    = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduced) return

      const title = titleRef.current
      const titleBox = titleBoxRef.current
      const body  = bodyRef.current
      if (!title) return

      const isDesktop = window.innerWidth >= 1024

      if (titleBox) {
        /*
         * Técnica "lâmpada por palavra".
         * Cada palavra parte de opacity 0 (apagada de vez, não só fraca) e
         * vai para 1 conforme o usuário desce — preso a um `scrub`, então a
         * velocidade do aceso acompanha a velocidade do dedo/roda.
         *
         * SEM pin. A versão original pinava a seção em `top: top` — o efeito
         * só começava a rodar quando a caixa do título já estava colada no
         * topo da viewport. Só que o título é centralizado dentro de uma
         * caixa de 88vh (`justify-center`), então ele já está bem posicionado
         * na tela BEM antes disso — a caixa começa a entrar pela base da tela
         * e o título passa a maior parte da aproximação já no lugar certo,
         * só que com `opacity: 0`. O pin não escondia o título por precisar
         * escondê-lo; ele só atrasava o INÍCIO do aceso pro momento tardio
         * (`top top`), e é esse atraso — não a opacidade em si — que lia como
         * "tela em branco por um bom trecho de scroll".
         * Medindo pelo TÍTULO (mesma lição do `Solution.tsx`: gatilho na
         * seção alta mede tarde demais) com `start: 'top 85%'` — o padrão do
         * resto do site —, o aceso começa assim que a primeira fatia do
         * título aparece vindo de baixo, e naturalmente. */
        const reveal = createCharReveal(title, { by: 'words', axis: 'y', distance: 0, blur: 12, autoRevert: false })
        const words = reveal ? reveal.chars : []

        // Distribui as 4 cores pelo total de palavras (4 blocos proporcionais)
        const textColors = ['var(--color-foreground)', 'var(--color-primary)', 'var(--color-accent)', 'var(--color-secondary)']
        const wordsPerColor = Math.ceil(words.length / textColors.length)

        words.forEach((word, index) => {
          const colorIndex = Math.min(Math.floor(index / wordsPerColor), textColors.length - 1)
          gsap.set(word, { color: textColors[colorIndex] })
        })

        reveal?.hide()

        // Distribui as palavras em 7 unidades de timeline
        const step = words.length > 1 ? 7 / (words.length - 1) : 7
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: title,
            start: 'top 85%',
            end: 'top 20%',
            scrub: 0.9,
          },
        })

        /* O desfoque de entrada precisa SAIR, e aqui ele não saía.
           `createCharReveal` aplica o `filter: blur()` no título inteiro dentro
           do `hide()`, e quem o desfaz é o `playIn()` — que esta seção não
           chama: a cascata é montada à mão, palavra a palavra, presa ao scrub.
           Resultado no desktop: a frase ficava desfocada e ilegível do começo
           ao fim (no celular passava batido porque `blurPx` desliga o filtro
           em aparelho de toque). O foco entra agora no início do trajeto, bem
           antes de a primeira palavra acender. */
        tl.to(
          title,
          {
            filter: 'blur(0px)',
            duration: step * 1.2,
            ease: 'power2.out',
            onComplete: () => gsap.set(title, { clearProps: 'filter' }),
          },
          0,
        )

        words.forEach((word, i) => {
          tl.to(word, { opacity: 1, duration: step * 0.9 }, i * step)
        })

        // Anima a linha dinamicamente no final do scrub
        const line = titleBox.querySelector<HTMLElement>('[data-gline]')
        if (line) {
          gsap.set(line, { scaleX: 0, opacity: 0, transformOrigin: 'center' })
          tl.to(line, { scaleX: 1, opacity: 1, duration: step * 2 }, (words.length - 1) * step)
        }

        // Corpo: gatilho próprio, revela ao entrar na tela
        let bodyTrigger: ScrollTrigger | null = null
        if (body) {
          gsap.set(body, { y: 28, opacity: 0, ...(isDesktop && { filter: 'blur(8px)' }) })
          bodyTrigger = ScrollTrigger.create({
            trigger: body,
            start: 'top 85%',
            end: 'bottom top',
            onEnter: () => gsap.to(body, { y: 0, opacity: 1, ...(isDesktop && { filter: 'blur(0px)' }), duration: 0.9, ease: EASE.reveal, overwrite: 'auto' }),
            onEnterBack: () => gsap.to(body, { y: 0, opacity: 1, ...(isDesktop && { filter: 'blur(0px)' }), duration: 0.9, ease: EASE.reveal, overwrite: 'auto' }),
          })
        }

        return () => {
          tl.scrollTrigger?.kill(true)
          tl.kill()
          bodyTrigger?.kill()
          reveal?.revert()
        }
      }
    },
    { scope: sectionRef, dependencies: [reduced] },
  )

  return (
    <section ref={sectionRef} className="bg-white">
      {/*
       * min-h-[88vh] dá ao título espaço pra respirar e mantém o corpo
       * abaixo do fold enquanto o "aceso" palavra a palavra ainda corre.
       */}
      <div
        ref={titleBoxRef}
        className="flex min-h-[88vh] flex-col justify-center py-3xl lg:py-5xl"
      >
        <Container className="max-w-[72rem] min-[1600px]:max-w-[100rem] min-[2000px]:max-w-[120rem] flex flex-col items-center text-left">
          {/* Título — as palavras iluminam no desktop */}
          <h2
            ref={titleRef}
            className="font-black leading-[1.06] tracking-tight text-foreground uppercase"
            style={{ fontSize: 'clamp(2.7rem, 5.5vw, 5.6rem)' }}
          >
            {t('titleSentence')}
          </h2>
          <span data-gline aria-hidden className="mt-8 block h-[4px] w-16 rounded-full bg-primary" />
        </Container>
      </div>

      {/* Corpo: dois parágrafos abaixo do título */}
      <div ref={bodyRef} className="pb-4xl lg:pb-5xl">
        <Container className="max-w-[72rem] min-[1600px]:max-w-[100rem] min-[2000px]:max-w-[120rem]">
          <div className="grid grid-cols-1 gap-xl border-t border-foreground/8 pt-xl lg:grid-cols-2 lg:gap-3xl lg:pt-2xl">
            <p className="text-subtitle m-0 max-w-none text-base leading-relaxed text-foreground/65 lg:text-lg">
              {t('bodyRest')}
            </p>
            <p className="text-subtitle m-0 max-w-none text-base leading-relaxed text-foreground/65 lg:text-lg">
              {t('paragraph2')}
            </p>
          </div>
        </Container>
      </div>
    </section>
  )
}
