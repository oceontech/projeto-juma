'use client'

import { Fragment } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

/** Rótulo curto em texto, sem bandeiras (ADR-009). */
const labels: Record<string, string> = {
  'pt-BR': 'PT',
  en: 'EN',
  es: 'ES',
}

/**
 * Troca o locale mantendo a rota atual.
 * `usePathname` do next-intl devolve o caminho sem o prefixo de idioma,
 * então `router.replace(pathname, { locale })` reescreve só o idioma.
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('common')

  return (
    <div
      role="group"
      aria-label={t('languageSwitcher')}
      className={`flex items-center gap-xs text-sm tracking-wide ${className}`}
    >
      {routing.locales.map((loc, i) => {
        const active = loc === locale
        return (
          <Fragment key={loc}>
            {i > 0 && (
              <span aria-hidden className="text-foreground/25">
                |
              </span>
            )}
            <button
              type="button"
              onClick={() => router.replace(pathname, { locale: loc })}
              aria-current={active ? 'true' : undefined}
              className={
                active
                  ? 'text-heading text-primary'
                  : 'text-body-regular text-foreground/45 transition-colors hover:text-primary'
              }
            >
              {labels[loc]}
            </button>
          </Fragment>
        )
      })}
    </div>
  )
}
