'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'
import { navLinks, jobsUrl } from '@/config/site'
import { useLenis } from '@/features/animation/SmoothScroll'
import { Container } from './Container'
import { LanguageSwitcher } from './LanguageSwitcher'

function ArrowUpRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden width="12" height="12" {...props}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden width="14" height="14" {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export function Navbar() {
  const t = useTranslations('nav')
  const tc = useTranslations('common')
  const pathname = usePathname()
  const lenis = useLenis()
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  // Tema da navbar conforme o fundo da seção sob ela (claro = texto escuro, escuro = texto branco)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const dark = theme === 'dark'

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  // Reseta o estado oculto ao trocar de rota
  useEffect(() => {
    setHidden(false)
    setOpen(false)
  }, [pathname])

  // Detecção automática de fundo escuro via IntersectionObserver: substitui listeners de
  // scroll/wheel/touchmove e chamadas getBoundingClientRect por checagem nativa assíncrona,
  // eliminando completamente o reflow forçado no Navbar.
  useEffect(() => {
    const darkSections = document.querySelectorAll<HTMLElement>('[data-nav-theme="dark"]')
    if (!darkSections.length) {
      setTheme('light')
      return
    }

    const activeMap = new Map<HTMLElement, boolean>()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          activeMap.set(entry.target as HTMLElement, entry.isIntersecting)
        })
        const isDark = Array.from(activeMap.values()).some(Boolean)
        setTheme(isDark ? 'dark' : 'light')
      },
      {
        // ProbeY ~ 40px no topo do viewport
        rootMargin: '-30px 0px -90% 0px',
        threshold: 0,
      },
    )

    darkSections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [pathname])

  // Esconde ao rolar para baixo, reaparece ao rolar para cima (imersão) SOMENTE NO DESKTOP.
  // Funciona mesmo com o scroll travado (locking) da jornada via eventos de wheel/touch.
  useEffect(() => {
    let last = window.scrollY
    let ticking = false

    /* Enquanto uma seção dirige o scroll por conta própria (catálogo de
       produtos: cada troca de produto é um scroll programático), a heurística
       de direção abaixo não vale — ela lia o vai-e-vem desses scrolls
       animados como "usuário subindo/descendo" e ficava mostrando/escondendo
       a navbar a cada passo (o menu "indo e voltando"). Quem manda nesses
       trechos é o próprio `nav:hide`/`nav:show` que a seção dispara; um
       `nav:hide` com `lock` suspende a heurística até o próximo `nav:show`. */
    let navLocked = false

    /* Quem ESCONDE a navbar é o gesto do usuário — roda, dedo ou tecla. O
       evento `scroll` só serve para MOSTRAR.
       A página se movimenta sozinha em vários pontos: o snap do CTA final
       assenta a cena quando o usuário para perto do fim, o catálogo de produtos
       reposiciona a cada troca, âncoras do menu rolam com o Lenis. Todos esses
       ajustes chegam como um `scroll` para baixo — e escondiam o menu que o
       usuário tinha acabado de trazer de volta, sem ele ter pedido nada.
       Fazendo o esconder depender do gesto, "descendo some, subindo aparece"
       passa a responder a quem está no controle, e nunca ao movimento que a
       própria página faz. */
    const handleScrollDirection = (direction: 'up' | 'down', currentY: number, doUsuario = false) => {
      if (navLocked) return
      if (direction === 'up') {
        setHidden(false)
        return
      }
      if (!doUsuario) return
      const isLocked = document.documentElement.style.overflow === 'hidden'
      if (currentY > 50 || isLocked) setHidden(true)
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        if (y > last) {
          handleScrollDirection('down', y)
        } else if (y < last) {
          handleScrollDirection('up', y)
        }
        last = y
        ticking = false
      })
    }

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 10) {
        handleScrollDirection('down', window.scrollY, true)
      } else if (e.deltaY < -10) {
        handleScrollDirection('up', window.scrollY, true)
      }
    }

    /* Teclado conta como gesto: sem isto, quem rola com PageDown/setas (ou
       barra de espaço) nunca veria a navbar sair do caminho, já que o `scroll`
       resultante sozinho não esconde mais nada. */
    const TECLAS_DOWN = new Set(['PageDown', 'ArrowDown', 'End', ' ', 'Spacebar'])
    const TECLAS_UP = new Set(['PageUp', 'ArrowUp', 'Home'])
    const onKeyDown = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null
      // Digitando num campo, as mesmas teclas movem o cursor, não a página.
      if (alvo && /^(INPUT|TEXTAREA|SELECT)$/.test(alvo.tagName)) return
      if (alvo?.isContentEditable) return
      if (TECLAS_DOWN.has(e.key)) handleScrollDirection('down', window.scrollY, true)
      else if (TECLAS_UP.has(e.key)) handleScrollDirection('up', window.scrollY, true)
    }

    let touchY = 0
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (e.defaultPrevented) return
      const endY = e.changedTouches[0]?.clientY || touchY
      const diff = touchY - endY
      if (diff > 40) {
        handleScrollDirection('down', window.scrollY, true)
      } else if (diff < -40) {
        handleScrollDirection('up', window.scrollY, true)
      }
    }

    const handleNavHide = (e: Event) => {
      if ((e as CustomEvent<{ lock?: boolean }>).detail?.lock) navLocked = true
      setHidden(true)
    }
    /* `nav:show` destrava por padrão — válvula de segurança para quando a seção
       que travou sai de cena sem avisar (troca de rota, breakpoint, etc.).
       Com `lock: true` ele apenas MOSTRA e mantém a trava: é o que a seção
       imersiva usa quando o usuário pede pra voltar (gesto pra cima) sem que a
       heurística volte a reagir aos scrolls programáticos dela. */
    const handleNavShow = (e: Event) => {
      if (!(e as CustomEvent<{ lock?: boolean }>).detail?.lock) navLocked = false
      setHidden(false)
    }
    /* Devolve o controle à heurística SEM mexer no estado atual: é o que a
       seção dispara ao sair de cena rolando pra baixo, onde `nav:show` seria
       errado (descendo, a navbar tem que continuar escondida). */
    const handleNavUnlock = () => {
      navLocked = false
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('nav:hide', handleNavHide)
    window.addEventListener('nav:show', handleNavShow)
    window.addEventListener('nav:unlock', handleNavUnlock)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('nav:hide', handleNavHide)
      window.removeEventListener('nav:show', handleNavShow)
      window.removeEventListener('nav:unlock', handleNavUnlock)
    }
  }, [])

  // Clique na logo volta para a hero (topo). Em outras rotas, o Link navega para "/".
  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname !== '/') return
    e.preventDefault()
    setOpen(false)
    if (lenis) lenis.scrollTo(0, { duration: 1.1, force: true })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Classes por tema ────────────────────────────────────────────
  const pillTheme = dark
    ? 'border-white/15 bg-gradient-to-r from-white/[0.12] to-white/[0.05] border-t-white/25'
    : 'border-white/20 bg-gradient-to-r from-white/30 to-white/[0.12] border-t-white/40'

  const linkClass = (active: boolean) =>
    `whitespace-nowrap text-[10px] xl:text-[11px] uppercase tracking-wide transition-all duration-200 hover:scale-110 ${
      active
        ? `text-heading ${dark ? 'text-white' : 'text-primary'}`
        : `text-body-regular ${dark ? 'text-white/75 hover:text-white' : 'text-foreground/70 hover:text-primary'}`
    }`

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[999] isolate transform-gpu will-change-transform pt-4 sm:pt-4 lg:pt-3 transition-transform duration-300 bg-gradient-to-b from-black/[.20] to-transparent ${
        hidden && !open ? '-translate-y-[150%]' : ''
      }`}
    >
      {/* 1440px em notebooks, 1600px em telas ≥1600px, 1920px em monitores grandes (≥2000px).
          Padding espelha a escala do Container (ver doc lá): enxuto até 1599px
          para a pílula acompanhar a largura maior do conteúdo, 64px a partir
          de 1600px. */}
      <Container className="!px-lg lg:!px-[1.5rem] xl:!px-[2rem] min-[1600px]:!px-[4rem] min-[1600px]:max-w-[100rem] min-[2000px]:max-w-[120rem]">
        <div className="flex items-stretch justify-end xl:justify-start gap-sm mx-auto w-full max-w-[1344px] lg:max-w-[1440px] min-[1600px]:max-w-[1600px] min-[2000px]:max-w-[1920px]">
          {/* Pílula principal — flex-1 para ocupar toda a largura disponível */}
          <div id="main-nav-pill" className={`xl:flex-1 rounded-full border backdrop-blur-xl border-t shadow-[0_8px_32px_rgba(0,0,0,0.06),_0_0_0_1px_rgba(0,0,0,0.08),_inset_0_1px_2px_rgba(255,255,255,0.5)] origin-center overflow-hidden transition-colors duration-500 ${pillTheme}`}>
              <div className="flex justify-center xl:justify-between items-center xl:gap-lg mx-auto w-full p-1.5 xl:px-sm xl:py-1.5">
                {/* Logo Desktop (dentro da pílula) — clique volta para a hero */}
                <Link
                  href="/"
                  onClick={handleLogoClick}
                  aria-label="Juma Agro — início"
                  className="hidden xl:block shrink-0 overflow-hidden relative ml-3 transition-transform duration-300 hover:scale-[1.04]"
                >
                  <Image
                    src={dark ? '/brand/logo-juma-agro-branca.png' : '/brand/logo-juma-agro.png'}
                    alt="Juma Agro"
                    width={160}
                    height={81}
                    priority
                    className="h-[40px] w-auto object-cover object-top shrink-0"
                  />
                </Link>

                {/* Navegação desktop */}
                <nav id="nav-desktop-links" aria-label="Principal" className="hidden xl:block shrink-0">
                  <ul className="flex items-center gap-sm xl:gap-md min-[1300px]:gap-lg">
                    {navLinks.map((link) => (
                      <li key={link.key}>
                        <Link
                          href={link.href}
                          aria-current={isActive(link.href) ? 'page' : undefined}
                          className={`inline-block ${linkClass(isActive(link.href))}`}
                        >
                          {t(link.key)}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <a
                        href={jobsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-xs ${linkClass(false)}`}
                      >
                        {t('jobs')}
                        <ArrowUpRight className="h-2.5 w-2.5 xl:h-3 xl:w-3" />
                      </a>
                    </li>
                  </ul>
                </nav>

                {/* CTA desktop — ml-auto empurra para a borda direita da pílula */}
                <Link
                  id="nav-cta-btn"
                  href="/contato"
                  className="whitespace-nowrap rounded-full btn-metallic-blue px-md py-[8px] text-body-regular text-[10px] xl:text-[11px] uppercase tracking-wider items-center justify-center gap-1.5 hidden xl:inline-flex shrink-0 transition-transform duration-200 hover:scale-[1.03] active:scale-95"
                >
                  <span>{tc('contactCta')}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                </Link>

                {/* Botão hambúrguer (mobile/tablet) */}
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  aria-expanded={open}
                  aria-controls="mobile-menu"
                  aria-label={open ? tc('closeMenu') : tc('openMenu')}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors xl:hidden ${
                    dark ? 'text-white hover:bg-white/10' : 'text-primary hover:bg-primary/5'
                  }`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden width="22" height="22">
                    {open ? <path d="M6 6 18 18M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                  </svg>
                </button>
              </div>
            </div>

          {/* Col 3: Seletor de idioma — expand via GSAP após a pílula principal */}
          <div className="hidden xl:flex items-stretch justify-end gap-sm shrink-0">
            {/* Pílula de Idioma */}
            <div id="nav-lang-pill" className={`flex items-center justify-center rounded-full border px-md backdrop-blur-xl border-t shadow-[0_8px_32px_rgba(0,0,0,0.06),_0_0_0_1px_rgba(0,0,0,0.08),_inset_0_1px_2px_rgba(255,255,255,0.5)] transition-colors duration-500 ${pillTheme}`}>
              <LanguageSwitcher className="shrink-0" align="right" theme={theme} />
            </div>
          </div>
        </div>

        {/* Painel mobile / Sidebar */}
        {open && (
          <div
            id="mobile-menu"
            className="mt-sm rounded-2xl border border-white/20 bg-gradient-to-br from-white/60 to-white/30 p-lg backdrop-blur-xl border-t border-t-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06),_0_0_0_1px_rgba(0,0,0,0.08),_inset_0_1px_2px_rgba(255,255,255,0.5)] xl:hidden"
          >
            <nav aria-label="Principal">
              <ul className="flex flex-col gap-xs">
                {navLinks.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive(link.href) ? 'page' : undefined}
                      className={
                        isActive(link.href)
                          ? 'block rounded-md px-sm py-xs text-heading text-xs text-primary'
                          : 'block rounded-md px-sm py-xs text-body-regular text-xs text-foreground/80 transition-colors hover:bg-primary/5 hover:text-primary'
                      }
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href={jobsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-xs rounded-md px-sm py-xs text-body-regular text-xs text-foreground/80 transition-colors hover:bg-primary/5 hover:text-primary"
                  >
                    {t('jobs')}
                    <ArrowUpRight className="h-2.5 w-2.5" />
                  </a>
                </li>
              </ul>
            </nav>

            <div className="mt-md flex items-center justify-between border-t border-foreground/10 pt-md">
              <LanguageSwitcher className="text-xs" align="left" />
              <Link
                href="/contato"
                onClick={() => setOpen(false)}
                className="rounded-full btn-metallic-blue px-md py-[10px] text-body-regular text-[10px] uppercase tracking-wider inline-flex items-center justify-center gap-1.5"
              >
                <span>{tc('contactCta')}</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              </Link>
            </div>
          </div>
        )}
      </Container>
    </header>
  )
}
