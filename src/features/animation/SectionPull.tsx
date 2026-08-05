'use client'

/**
 * "Puxa" a seção que entra para o espaço que a anterior deixou.
 *
 * ── O problema ─────────────────────────────────────────────────────────
 * A animação de saída apaga o conteúdo, mas não devolve o espaço: o texto some
 * e a caixa dele continua ocupando a mesma altura. Na divisa entre duas seções
 * isso vira um vazio — o usuário rola por uma faixa em branco até a próxima
 * seção chegar.
 *
 * ── Por que NÃO é scroll programático ──────────────────────────────────
 * A leitura literal do efeito seria empurrar a página com `scrollTo` quando a
 * saída dispara. Seria o pior caminho possível: disputa o controle com o gesto
 * de quem está rolando, pode realimentar os próprios gatilhos que a
 * dispararam (o scroll move, o gatilho reage, o gatilho move o scroll) e
 * quebraria os trechos pinados, que dependem de o scroll ser exatamente o que
 * o usuário fez.
 *
 * Aqui a seção que entra sobe alguns pixels POR TRANSFORM, presa ao scroll.
 * Nada de scroll programático: quem manda continua sendo o dedo. O efeito é
 * puramente de composição — sem layout, sem pintura — e some sozinho quando a
 * seção assenta no lugar.
 *
 * ── Onde NÃO usar ──────────────────────────────────────────────────────
 * Seções com `pin` ou `sticky` (hero, Aminosan, catálogo, desafio, programa) e
 * a seção final, que já tem movimento próprio preso ao scroll. Transform num
 * ancestral muda o referencial de `position: fixed` e desloca o que o pin
 * fixou — daí a lista curta de quem recebe o efeito.
 */

import { useRef, type ReactNode } from 'react'

import { gsap, useGSAP } from './gsap'
import { useReducedMotion } from './useReducedMotion'

export function SectionPull({
  children,
  /** Quanto a seção sobe ao entrar, em px. Sutil de propósito. */
  distance = 56,
  className,
  id,
  ...rest
}: {
  children: ReactNode
  distance?: number
  className?: string
  id?: string
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'id' | 'className'>) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reduced) return

      const tween = gsap.fromTo(
        el,
        { y: distance },
        {
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            /* Começa quando o topo da seção toca a base da tela — é aí que o
               vazio da seção anterior aparece — e termina quando ela já ocupou
               o lugar. Faixa curta de propósito: o movimento serve à transição,
               não à seção inteira. */
            start: 'top bottom',
            end: 'top 62%',
            /* `scrub: true` cola o movimento ao scroll, sem tween intermediária
               correndo por fora. Além de ser o que dá a sensação de a seção
               acompanhar o dedo, é a opção mais barata: um valor numérico
               manteria uma tween viva a cada frame para suavizar algo que já é
               contínuo. */
            scrub: true,
            invalidateOnRefresh: true,
            /* `will-change` vive só na janela da transição.
               Declarado na tween ele ficaria de pé enquanto a tween existisse —
               e com `scrub` ela existe o tempo todo. Seriam sete seções
               INTEIRAS com camada reservada pelo resto da visita, que é
               exatamente o custo que já tivemos de caçar no catálogo. Aqui a
               promessa entra quando a faixa fica ativa e sai junto com ela. */
            onToggle: (self) =>
              gsap.set(el, { willChange: self.isActive ? 'transform' : 'auto' }),
          },
        },
      )

      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
        gsap.set(el, { clearProps: 'transform,willChange' })
      }
    },
    { dependencies: [reduced, distance], scope: ref },
  )

  return (
    <div ref={ref} id={id} className={className} {...rest}>
      {children}
    </div>
  )
}
