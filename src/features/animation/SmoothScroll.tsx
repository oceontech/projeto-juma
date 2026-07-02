'use client'

/**
 * Smooth scroll global via Lenis, sincronizado com o ScrollTrigger do GSAP.
 *
 * - Inicializa o Lenis uma vez e conduz o rAF pelo ticker do GSAP (uma só fonte
 *   de tempo, sem dois loops competindo).
 * - `prefers-reduced-motion`: não instancia o Lenis (scroll nativo do browser).
 * - Expõe a instância via contexto para quem precisar de `scrollTo` (âncoras, CTA).
 * - `ScrollTrigger.refresh()` global ao terminar de carregar (load) e ao assentar
 *   as web fonts: salvaguarda padrão do GSAP contra a troca de fonte (FOUT)
 *   reposicionar o texto depois que os triggers já calcularam start/end no mount.
 * - ResizeObserver no body, debounced: imagens/vídeos abaixo da dobra (ex: o vídeo
 *   de transição do Aminosan) podem terminar de carregar bem depois do 'load' e do
 *   fonts.ready, deslocando a altura do documento — sem isto, os ScrollTriggers de
 *   seções mais abaixo travam com base numa posição de "top top" desatualizada
 *   (a trava dispara cedo demais, antes da seção realmente chegar ao topo da tela).
 *
 * Referência: docs/05-design-direction/06-brief-construcao-home.md §3.1.
 */
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import Lenis from 'lenis'

import { gsap, ScrollTrigger } from './gsap'

const LenisContext = createContext<Lenis | null>(null)

/** Acesso à instância do Lenis (null quando reduced-motion ou ainda não montou). */
export function useLenis() {
  return useContext(LenisContext)
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Previne que o navegador tente restaurar o scroll em recarregamentos (F5)
    // forçando a volta para o topo e evitando quebra das animações do GSAP.
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)

    const instance = new Lenis({ lerp: 0.1, smoothWheel: true })
    lenisRef.current = instance
    setLenis(instance)

    instance.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    const refresh = () => requestAnimationFrame(() => ScrollTrigger.refresh())
    if (document.readyState === 'complete') refresh()
    else window.addEventListener('load', refresh, { once: true })
    document.fonts?.ready.then(refresh)

    let resizeTimeout: ReturnType<typeof setTimeout> | undefined
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(refresh, 200)
    })
    ro.observe(document.body)

    return () => {
      gsap.ticker.remove(raf)
      instance.destroy()
      lenisRef.current = null
      setLenis(null)
      window.removeEventListener('load', refresh)
      clearTimeout(resizeTimeout)
      ro.disconnect()
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
