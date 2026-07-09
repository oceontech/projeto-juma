'use client'

import { useEffect, useRef, useState } from 'react'
import type { ComponentType, ReactElement, SVGProps } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

/**
 * Seletor de idioma com bandeiras (SVG inline — emoji de bandeira não renderiza
 * no Windows). Trigger mostra a bandeira do idioma atual e abre um dropdown com
 * os três idiomas (bandeira + nome nativo). Abertura animada com GSAP (o painel
 * cresce do canto do gatilho e os itens entram em cascata). Substitui os
 * acrônimos do ADR-009.
 */

type Locale = (typeof routing.locales)[number]
type FlagComp = ComponentType<SVGProps<SVGSVGElement>>

/* ── Bandeiras (SVG, viewBox 24×16) ──────────────────────────────── */

function FlagBR(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 16" preserveAspectRatio="xMidYMid slice" {...props}>
      <rect width="24" height="16" fill="#009739" />
      <polygon points="12,1.8 22.2,8 12,14.2 1.8,8" fill="#FEDD00" />
      <circle cx="12" cy="8" r="3.1" fill="#002776" />
      <path d="M9.2 7.3 Q12 6.1 14.8 7.3" stroke="#fff" strokeWidth="0.7" fill="none" />
    </svg>
  )
}

function FlagUS(props: SVGProps<SVGSVGElement>) {
  const stripe = 16 / 13
  const stars: ReactElement[] = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      const x = 1.1 + c * 1.75 + (r % 2) * 0.88
      const y = 1.25 + r * 1.95
      if (x < 9.1) stars.push(<circle key={`${r}-${c}`} cx={x} cy={y} r={0.3} fill="#fff" />)
    }
  }
  return (
    <svg viewBox="0 0 24 16" preserveAspectRatio="xMidYMid slice" {...props}>
      <rect width="24" height="16" fill="#B22234" />
      {[1, 3, 5, 7, 9, 11].map((i) => (
        <rect key={i} y={i * stripe} width="24" height={stripe} fill="#fff" />
      ))}
      <rect width="9.6" height={7 * stripe} fill="#3C3B6E" />
      {stars}
    </svg>
  )
}

function FlagES(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 16" preserveAspectRatio="xMidYMid slice" {...props}>
      <rect width="24" height="16" fill="#AA151B" />
      <rect y="4" width="24" height="8" fill="#F1BF00" />
    </svg>
  )
}

const localeMeta: Record<string, { label: string; Flag: FlagComp }> = {
  'pt-BR': { label: 'Português', Flag: FlagBR },
  en: { label: 'English', Flag: FlagUS },
  es: { label: 'Español', Flag: FlagES },
}

/* ── Ícones ──────────────────────────────────────────────────────── */

function ChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function Check(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function FlagChip({ Flag, className = '' }: { Flag: FlagComp; className?: string }) {
  return (
    <span className={`inline-flex h-4 w-6 shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/10 shadow-sm ${className}`}>
      <Flag className="h-full w-full" />
    </span>
  )
}

/* ── Seletor ─────────────────────────────────────────────────────── */

/**
 * Troca o locale mantendo a rota atual.
 * `usePathname` do next-intl devolve o caminho sem o prefixo de idioma,
 * então `router.replace(pathname, { locale })` reescreve só o idioma.
 */
export function LanguageSwitcher({
  className = '',
  align = 'right',
}: {
  className?: string
  align?: 'left' | 'right'
}) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('common')
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLUListElement>(null)

  const current = localeMeta[locale] ?? localeMeta['pt-BR']

  // Abertura/fechamento animados com GSAP (painel cresce do canto + itens em cascata)
  useGSAP(
    () => {
      const panel = panelRef.current
      if (!panel) return
      const items = gsap.utils.toArray<HTMLElement>('[data-lang-item]', panel)

      if (open) {
        gsap.set(panel, { display: 'block' })
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .fromTo(
            panel,
            { autoAlpha: 0, scale: 0.9, y: -10 },
            { autoAlpha: 1, scale: 1, y: 0, duration: 0.34, ease: 'back.out(1.7)' },
          )
          .fromTo(
            items,
            { autoAlpha: 0, y: 12, filter: 'blur(3px)' },
            { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.3, stagger: 0.06 },
            '-=0.2',
          )
      } else {
        gsap.to(panel, {
          autoAlpha: 0,
          scale: 0.95,
          y: -8,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => gsap.set(panel, { display: 'none' }),
        })
      }
    },
    { dependencies: [open], scope: rootRef },
  )

  // Fecha ao clicar fora ou apertar Escape
  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const choose = (loc: Locale) => {
    setOpen(false)
    if (loc !== locale) router.replace(pathname, { locale: loc })
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t('languageSwitcher')}: ${current.label}`}
        className="group/trigger flex items-center gap-1.5 py-1 text-foreground/80 transition-colors hover:text-primary"
      >
        <FlagChip
          Flag={current.Flag}
          className="transition-transform duration-300 ease-out group-hover/trigger:scale-110 group-hover/trigger:-rotate-3"
        />
        <ChevronDown
          className={`h-3 w-3 shrink-0 transition-transform duration-300 ease-out ${open ? 'rotate-180' : 'group-hover/trigger:translate-y-0.5'}`}
        />
      </button>

      <ul
        ref={panelRef}
        role="listbox"
        aria-label={t('languageSwitcher')}
        style={{ display: 'none' }}
        className={`absolute top-full z-50 mt-2 min-w-[11.5rem] overflow-hidden rounded-2xl border border-white/25 bg-gradient-to-br from-white/75 to-white/45 p-1 backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.14),_inset_0_1px_2px_rgba(255,255,255,0.6)] ${
          align === 'right' ? '-right-[1rem] origin-top-right' : 'left-0 origin-top-left'
        }`}
      >
        {routing.locales.map((loc) => {
          const meta = localeMeta[loc]
          const active = loc === locale
          return (
            <li key={loc} role="option" aria-selected={active} data-lang-item>
              <button
                type="button"
                onClick={() => choose(loc)}
                className={`group/item flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all duration-200 ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/80 hover:bg-primary/[0.07] hover:text-primary hover:translate-x-0.5'
                }`}
              >
                <FlagChip
                  Flag={meta.Flag}
                  className="transition-transform duration-300 ease-out group-hover/item:scale-110 group-hover/item:-rotate-3"
                />
                <span className={`flex-1 text-[13px] leading-none ${active ? 'text-heading' : 'text-body-regular'}`}>
                  {meta.label}
                </span>
                {active && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
