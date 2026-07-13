'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { useLenis } from '@/features/animation/SmoothScroll'
import { ScrollTrigger } from '@/features/animation/gsap'

/**
 * Navegador de seções da home — timeline vertical discreta à direita, estilo
 * Awwwards. Não é scrollbar: é um seletor de atos da jornada. Cada traço marca
 * uma seção; o ativo se alonga e ganha cor. Ao passar o mouse, o rótulo desliza.
 * Clique salta para a seção (via Lenis, com fallback nativo em reduced-motion).
 *
 * `dark` = fundo da seção correspondente é escuro → o navegador inverte o
 * esquema de cor (traços claros) para manter legibilidade sobre qualquer fundo.
 */

type Section = { id: string; key: string; dark: boolean }

const SECTIONS: Section[] = [
  { id: 'sec-inicio', key: 'inicio', dark: false },
  { id: 'sec-historia', key: 'historia', dark: false },
  { id: 'sec-origem', key: 'origem', dark: false },
  { id: 'sec-produtos', key: 'produtos', dark: true },
  { id: 'sec-culturas', key: 'culturas', dark: false },
  { id: 'sec-numeros', key: 'numeros', dark: true },
  { id: 'sec-desafio', key: 'desafio', dark: false },
  { id: 'sec-programa', key: 'programa', dark: false },
  { id: 'sec-linhas', key: 'linhas', dark: false },
  { id: 'sec-calculadora', key: 'calculadora', dark: false },
  { id: 'sec-experience', key: 'experience', dark: true },
  { id: 'sec-presenca', key: 'presenca', dark: false },
  { id: 'sec-depoimentos', key: 'depoimentos', dark: false },
  { id: 'sec-materias', key: 'materias', dark: false },
  { id: 'sec-contato', key: 'contato', dark: true },
]

// Offset para o salto parar abaixo da navbar fixa
const NAV_OFFSET = 96

export function SectionNav() {
  const t = useTranslations('sectionNav')
  const lenis = useLenis()
  const [active, setActive] = useState(0)

  // Scroll-spy: usa a posição absoluta (getBoundingClientRect) para funcionar
  // mesmo com âncoras aninhadas e seções pinadas/altas.
  useEffect(() => {
    let raf = 0
    const compute = () => {
      raf = 0
      const line = window.scrollY + window.innerHeight * 0.35
      let idx = 0
      for (let i = 0; i < SECTIONS.length; i++) {
        const el = document.getElementById(SECTIONS[i].id)
        if (!el) continue
        const top = el.getBoundingClientRect().top + window.scrollY
        if (top <= line) idx = i
      }
      setActive(idx)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute)
    }
    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Salto instantâneo (sem fly-through): evita disparar o onEnter de todas as
  // seções no caminho (cascata de animações pela metade). Assim o ScrollTrigger
  // avalia só o estado final — a seção-alvo faz a entrada dela naturalmente ao
  // chegar, como se o usuário tivesse rolado até ela.
  const go = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    // Sincroniza o scroll-jacking do hero: se o salto é para o início, replay do
    // intro; se passa por cima do hero, finaliza a jornada para o scroll normal
    // voltar a funcionar (senão a trava do hero devolve o usuário ao topo).
    window.dispatchEvent(
      new CustomEvent(id === 'sec-inicio' ? 'herojornada:reset' : 'herojornada:complete'),
    )
    if (lenis) {
      lenis.scrollTo(el, { offset: -NAV_OFFSET, immediate: true, force: true })
    } else {
      const y = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET
      window.scrollTo({ top: y })
    }
    // Assenta pins/triggers na nova posição
    requestAnimationFrame(() => ScrollTrigger.update())
  }

  const activeDark = SECTIONS[active]?.dark ?? false

  return (
    <nav
      aria-label={t('label')}
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
    >
      <ul className="flex flex-col items-end gap-3">
        {SECTIONS.map((s, i) => {
          const isActive = i === active
          const tick = isActive
            ? activeDark
              ? 'w-8 bg-white'
              : 'w-8 bg-primary'
            : activeDark
              ? 'w-4 bg-white/30 group-hover/nav:w-6 group-hover/nav:bg-white/60'
              : 'w-4 bg-black/25 group-hover/nav:w-6 group-hover/nav:bg-black/50'

          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => go(s.id)}
                aria-label={t(s.key)}
                aria-current={isActive ? 'true' : undefined}
                className="group/nav flex items-center justify-end gap-2.5 py-0.5"
              >
                <span
                  className={`pointer-events-none translate-x-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] opacity-0 backdrop-blur-sm transition-all duration-300 ease-out group-hover/nav:translate-x-0 group-hover/nav:opacity-100 group-focus-visible/nav:translate-x-0 group-focus-visible/nav:opacity-100 ${
                    activeDark ? 'bg-white/10 text-white/90' : 'bg-black/[0.06] text-foreground/80'
                  }`}
                >
                  {t(s.key)}
                </span>
                <span
                  aria-hidden
                  className={`block h-[2px] rounded-full transition-all duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${tick}`}
                />
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
