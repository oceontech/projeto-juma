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

  /**
   * `--vh-stable` — altura de viewport que NÃO muda quando a barra do navegador
   * do celular recolhe ou volta.
   *
   * No mobile o `100dvh` é recalculado a cada vez que a barra some/aparece. O
   * hero mede a altura da viewport, então todo o resto da página descia ou
   * subia de uma vez junto com ele — medido em 96px (Chrome Android e iOS
   * Safari), sem nenhuma compensação de scroll do browser. Como o hero trava o
   * scroll durante a jornada, a primeira vez que a barra recolhe é exatamente
   * no gesto que leva o usuário para a seção seguinte ("Nossa História"): daí o
   * corte seco para cima ou para baixo só ali. Num arrasto lento, com a barra
   * indo e voltando, o deslocamento anula o gesto e a página parece presa.
   *
   * O valor é o da viewport GRANDE (`100lvh`), não o `innerHeight` do momento.
   * Os dois são estáveis, mas `innerHeight` congela a altura que a tela tinha
   * na primeira medida — e essa medida quase sempre acontece com a barra do
   * navegador ABERTA, ou seja, a menor das duas alturas. Assim que a barra
   * recolhia, a tela ficava ~90px mais alta que o hero e o branco da seção
   * seguinte aparecia por baixo dele: era a "linha branca embaixo da imagem".
   * Com `lvh` o hero tem sempre a altura da tela com a barra recolhida — no
   * pior caso o rodapé da imagem fica um pouco cortado enquanto a barra está
   * de pé, que é o comportamento normal de qualquer hero de tela cheia, e
   * nunca sobra fundo aparecendo.
   *
   * A altura só é recalculada quando a LARGURA muda (rotação ou
   * redimensionamento real) — nunca no vai-e-vem da barra. Só vale para
   * ponteiro grosso; no desktop a variável não é definida e o CSS cai no
   * `100dvh` nativo, que lá acompanha a janela como deve.
   */
  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)')
    const root = document.documentElement
    let lastWidth = window.innerWidth

    /** `100lvh` em px. Sonda no DOM porque não há como ler a unidade direto. */
    const largeViewportHeight = () => {
      const probe = document.createElement('div')
      probe.style.cssText =
        'position:absolute;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none'
      root.appendChild(probe)
      const h = probe.getBoundingClientRect().height
      probe.remove()
      // Navegador sem `lvh`: o innerHeight é o melhor palpite disponível.
      return h > 0 ? h : window.innerHeight
    }

    const apply = () => {
      if (coarse.matches) root.style.setProperty('--vh-stable', `${largeViewportHeight()}px`)
      else root.style.removeProperty('--vh-stable')
    }

    const onResize = () => {
      if (window.innerWidth === lastWidth) return // só a barra mexeu: ignora
      lastWidth = window.innerWidth
      apply()
      ScrollTrigger.refresh()
    }

    // O iOS só entrega o innerHeight novo alguns frames depois do evento.
    const onOrientation = () => {
      setTimeout(() => {
        lastWidth = -1
        onResize()
      }, 300)
    }

    apply()
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onOrientation)
    coarse.addEventListener('change', apply)

    // A troca de fonte (FOUT) reposiciona texto depois que os triggers já
    // mediram start/end. No mobile o Lenis não monta, então este refresh vive
    // aqui fora para valer nos dois casos.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onOrientation)
      coarse.removeEventListener('change', apply)
      root.style.removeProperty('--vh-stable')
    }
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Previne que o navegador tente restaurar o scroll em recarregamentos (F5)
    // forçando a volta para o topo e evitando quebra das animações do GSAP.
    // Aplicado para desktop e mobile, antes do retorno antecipado.
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)

    // Celular/tablet (ponteiro grosso, sem hover) ou telas menores que 1024px: usa o scroll nativo direto.
    // O Lenis some com o listener extra de 'scroll' -> ScrollTrigger.update em
    // cada evento nativo de touch — um custo a mais que só se paga no desktop,
    // onde o Lenis existe pra suavizar a roda do mouse (o toque já rola nativo
    // por conta própria). O ScrollTrigger continua funcionando: sem proxy, ele
    // escuta o 'scroll' nativo sozinho (mesmo caminho do reduced-motion acima).
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.innerWidth < 1024
    ) {
      return
    }

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
