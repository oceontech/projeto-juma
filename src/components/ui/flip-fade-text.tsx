'use client'

/**
 * Palavra que se troca sozinha, letra a letra — usada na cena da gota, no fim
 * da jornada do hero.
 *
 * ── Por que foi reescrito ─────────────────────────────────────────────
 * A versão anterior custava caro de três formas ao mesmo tempo, e o pior é que
 * o custo era PERMANENTE: o componente vive no hero, no topo da página, mas o
 * laço não parava — seguia trocando a palavra a cada 2,5s com o usuário lendo
 * uma seção dez telas abaixo. Medido na home, os spans deste componente eram
 * os únicos elementos com `filter` ativo na região do rodapé.
 *
 *  1. `filter: blur(8px)` animado EM CADA LETRA. Desfoque é propriedade de
 *     pintura: o navegador redesenha e refaz o desfoque a cada frame, por
 *     letra. Num laço infinito, isso é um relógio consumindo frames para
 *     sempre.
 *  2. `rotateX` dentro de uma `perspective`, que promove cada letra a camada
 *     própria em contexto 3D.
 *  3. framer-motion só para isto — uma segunda biblioteca de animação num
 *     projeto de motor único (GSAP + Lenis, ADR-021).
 *
 * A versão em GSAP mantém a leitura (a palavra troca, letra a letra, em
 * cascata) e corta o que era caro: transform e opacity apenas, ambos
 * compostos. E o laço só corre com o componente em cena e a aba à frente.
 */

import { useEffect, useRef, useState } from 'react'

import { gsap, useGSAP } from '@/features/animation/gsap'
import { useReducedMotion } from '@/features/animation/useReducedMotion'

interface FlipFadeTextProps {
  /** Palavras que se alternam. */
  words?: string[]
  /** Intervalo entre trocas, em ms. */
  interval?: number
  className?: string
  textClassName?: string
  /** Duração da animação de cada letra, em segundos. */
  letterDuration?: number
  /** Intervalo entre letras na entrada, em segundos. */
  staggerDelay?: number
  /** Intervalo entre letras na saída, em segundos. */
  exitStaggerDelay?: number
}

const defaultWords = ['LOADING', 'COMPUTING', 'SEARCHING', 'RETRIEVING', 'ASSEMBLING']

export function FlipFadeText({
  words = defaultWords,
  interval = 2500,
  className,
  textClassName,
  letterDuration = 0.6,
  staggerDelay = 0.1,
  exitStaggerDelay = 0.05,
}: FlipFadeTextProps) {
  const [index, setIndex] = useState(0)
  const hostRef = useRef<HTMLSpanElement>(null)
  const wordRef = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  /* O rodízio só corre com o elemento em cena E a aba à frente. Sem isto o
     intervalo seguia disparando (e reanimando letras) com o usuário dez telas
     abaixo — custo pago pelo resto da visita, para animar algo que ninguém
     está vendo. */
  const [active, setActive] = useState(false)
  useEffect(() => {
    const el = hostRef.current
    if (!el || reduced || words.length < 2) return

    let visible = !document.hidden
    let onScreen = false
    const sync = () => setActive(visible && onScreen)

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      sync()
    })
    io.observe(el)

    const onVisibility = () => {
      visible = !document.hidden
      sync()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced, words.length])

  useEffect(() => {
    if (!active) return
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % words.length), interval)
    return () => clearInterval(timer)
  }, [active, interval, words.length])

  const currentWord = words[index] ?? ''

  useGSAP(
    () => {
      const el = wordRef.current
      if (!el || reduced) return

      const letters = gsap.utils.toArray<HTMLElement>('[data-letter]', el)
      if (!letters.length) return

      /* Só transform e opacity — o desenho continua sendo uma cascata de
         letras subindo, sem nenhuma repintura. */
      gsap.fromTo(
        letters,
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: letterDuration,
          ease: 'power2.out',
          stagger: staggerDelay,
          // Devolve a memória de vídeo assim que a troca termina.
          clearProps: 'transform',
        },
      )
    },
    { dependencies: [currentWord, reduced], scope: wordRef },
  )

  return (
    <span ref={hostRef} className={`inline-flex items-center justify-center ${className || ''}`}>
      <span className="relative inline-flex items-center justify-center">
        <span
          ref={wordRef}
          className={`flex text-highlight text-primary items-center justify-center min-w-max ${textClassName || ''}`}
        >
          {currentWord.split('').map((char, i) => (
            <span key={`${char}-${i}`} data-letter className="inline-block whitespace-pre">
              {char === ' ' ? ' ' : char}
            </span>
          ))}
        </span>
      </span>
    </span>
  )
}

export default FlipFadeText
