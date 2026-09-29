'use client'

import { useLocale, useTranslations } from 'next-intl'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'

import { track } from '@/features/analytics/track'
import { useLenis } from '@/features/animation/SmoothScroll'
import { useSiteSettings } from '@/features/settings/SiteSettingsProvider'

import { submitLead } from '../actions'
import { whatsappUrl, type LeadContext } from '../whatsapp'

/** Quem já abriu a conversa uma vez vai direto ao WhatsApp nas próximas (copy: "Retorno (cookie)"). */
const KNOWN_COOKIE = 'juma_lead'
const KNOWN_MAX_AGE = 60 * 60 * 24 * 365

type LeadApi = {
  openWhatsApp: (context?: LeadContext) => void
  messageFor: (context?: LeadContext) => string
}

const LeadContextApi = createContext<LeadApi | null>(null)

export function useLead() {
  return useContext(LeadContextApi)
}

type FieldName = 'nome' | 'email' | 'telefone'
type Status = 'idle' | 'sending' | 'saved' | 'error'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function maskBrPhone(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function LeadProvider({ children }: { children: ReactNode }) {
  const t = useTranslations('leadPopup')
  const locale = useLocale()
  const lenis = useLenis()
  const settings = useSiteSettings()
  const titleId = useId()

  const [open, setOpen] = useState(false)
  const [context, setContext] = useState<LeadContext | undefined>()
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<FieldName[]>([])
  const [values, setValues] = useState({ nome: '', email: '', telefone: '', website: '' })
  const openedAt = useRef(0)
  const returnFocus = useRef<HTMLElement | null>(null)
  const firstField = useRef<HTMLInputElement>(null)

  const messageFor = useCallback(
    (ctx?: LeadContext) => {
      if (ctx?.tipo === 'experience') return t('messages.experience')
      if (ctx?.produto) return t('messages.product', { produto: ctx.produto })
      if (ctx?.cultura) return t('messages.culture', { cultura: ctx.cultura })
      return t('messages.default')
    },
    [t],
  )

  const openWhatsApp = useCallback(
    (ctx?: LeadContext) => {
      if (document.cookie.includes(`${KNOWN_COOKIE}=`)) {
        track('whatsapp', { produto: ctx?.produto, cultura: ctx?.cultura })
        window.open(whatsappUrl(settings.whatsappHref, messageFor(ctx)), '_blank', 'noopener,noreferrer')
        return
      }
      returnFocus.current = document.activeElement as HTMLElement | null
      openedAt.current = Date.now()
      setContext(ctx)
      setErrors([])
      setStatus('idle')
      setOpen(true)
    },
    [messageFor, settings.whatsappHref],
  )

  const close = useCallback(() => {
    setOpen(false)
    returnFocus.current?.focus?.()
  }, [])

  // Trava a rolagem suave e foca o primeiro campo enquanto o pop-up está aberto.
  useEffect(() => {
    if (!open) return
    lenis?.stop()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    firstField.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open, lenis, close])

  const validate = (): FieldName[] => {
    const bad: FieldName[] = []
    if (values.nome.trim().length < 2) bad.push('nome')
    if (!EMAIL.test(values.email.trim())) bad.push('email')
    const digits = values.telefone.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 15) bad.push('telefone')
    return bad
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    const bad = validate()
    setErrors(bad)
    if (bad.length) return

    // A aba abre no clique; se abrisse depois do await, o navegador bloquearia.
    const tab = window.open('', '_blank')
    setStatus('sending')
    const result = await submitLead({
      formulario: 'whatsapp',
      nome: values.nome,
      email: values.email,
      telefone: values.telefone,
      locale,
      pagina: window.location.pathname,
      contexto: {
        produto: context?.produto,
        cultura: context?.cultura,
        detalhe: context?.detalhe ?? context?.tipo,
      },
      consentimento: t('lede'),
      website: values.website,
      tempoMs: Date.now() - openedAt.current,
    }).catch(() => ({ ok: false as const, error: 'server' as const, fields: undefined }))

    if (!result.ok) {
      tab?.close()
      if (result.error === 'invalid' && result.fields?.length) {
        setErrors(
          result.fields.filter((f): f is FieldName => ['nome', 'email', 'telefone'].includes(f)),
        )
        setStatus('idle')
      } else {
        setStatus('error')
      }
      return
    }

    document.cookie = `${KNOWN_COOKIE}=1; Max-Age=${KNOWN_MAX_AGE}; Path=/; SameSite=Lax`
    setStatus('saved')
    track('lead', { formulario: 'whatsapp', produto: context?.produto, cultura: context?.cultura })
    const url = whatsappUrl(settings.whatsappHref, messageFor(context))
    if (tab) tab.location.href = url
    else window.location.href = url
    window.setTimeout(() => setOpen(false), 1600)
  }

  const api = useMemo(() => ({ openWhatsApp, messageFor }), [openWhatsApp, messageFor])

  const input =
    'w-full rounded-xl border border-transparent bg-foreground/5 px-4 py-3 text-foreground outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20'
  const fieldError = (name: FieldName) =>
    errors.includes(name) ? (
      <p id={`${titleId}-${name}-error`} className="text-xs text-red-700">
        {t('errorField')}
      </p>
    ) : null
  const described = (name: FieldName) =>
    errors.includes(name) ? `${titleId}-${name}-error` : undefined

  return (
    <LeadContextApi.Provider value={api}>
      {children}
      {open && (
        // A camada rola sozinha: com as mensagens de erro, o diálogo pode passar
        // da altura da tela (celular deitado, notebook pequeno) e o botão sumiria.
        <div
          className="fixed inset-0 z-[1000] overflow-y-auto overscroll-contain bg-black/55 backdrop-blur-sm"
          data-lenis-prevent
        >
          <div
            className="flex min-h-full items-end justify-center p-4 sm:items-center"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) close()
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative w-full max-w-[28rem] rounded-3xl bg-white p-7 shadow-2xl sm:p-9"
            >
              <button
                type="button"
                onClick={close}
                aria-label={t('close')}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden
                  className="h-4 w-4"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>

              {status === 'saved' ? (
                <p
                  className="py-6 pr-8 font-montserrat text-xl font-black uppercase leading-tight text-primary"
                  role="status"
                >
                  {t('saved', { nome: values.nome.trim().split(/\s+/)[0] })}
                </p>
              ) : (
                <form onSubmit={onSubmit} noValidate>
                  <h2
                    id={titleId}
                    className="mb-2 pr-8 font-montserrat text-xl font-black uppercase leading-tight text-foreground sm:text-2xl"
                  >
                    {t('title')}
                  </h2>
                  <p className="mb-6 text-sm text-foreground/60">{t('lede')}</p>

                  <div className="flex flex-col gap-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor={`${titleId}-nome`}
                        className="text-sm font-bold text-foreground/80"
                      >
                        {t('nameLabel')}
                      </label>
                      <input
                        ref={firstField}
                        id={`${titleId}-nome`}
                        name="nome"
                        autoComplete="name"
                        value={values.nome}
                        onChange={(e) => setValues((v) => ({ ...v, nome: e.target.value }))}
                        aria-invalid={errors.includes('nome')}
                        aria-describedby={described('nome')}
                        className={input}
                      />
                      {fieldError('nome')}
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor={`${titleId}-email`}
                        className="text-sm font-bold text-foreground/80"
                      >
                        {t('emailLabel')}
                      </label>
                      <input
                        id={`${titleId}-email`}
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder={t('emailPlaceholder')}
                        value={values.email}
                        onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                        aria-invalid={errors.includes('email')}
                        aria-describedby={described('email')}
                        className={input}
                      />
                      {fieldError('email')}
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor={`${titleId}-telefone`}
                        className="text-sm font-bold text-foreground/80"
                      >
                        {t('phoneLabel')}
                      </label>
                      <input
                        id={`${titleId}-telefone`}
                        name="telefone"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder={t('phonePlaceholder')}
                        value={values.telefone}
                        onChange={(e) =>
                          setValues((v) => ({
                            ...v,
                            telefone:
                              locale === 'pt-BR' ? maskBrPhone(e.target.value) : e.target.value,
                          }))
                        }
                        aria-invalid={errors.includes('telefone')}
                        aria-describedby={described('telefone')}
                        className={input}
                      />
                      {fieldError('telefone')}
                    </div>
                    {/* Isca para robôs: invisível para pessoas e leitores de tela. */}
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      value={values.website}
                      onChange={(e) => setValues((v) => ({ ...v, website: e.target.value }))}
                      className="absolute -left-[9999px] h-px w-px opacity-0"
                    />
                  </div>

                  {status === 'error' && (
                    <p className="mt-4 text-sm text-red-700" role="alert">
                      {t('errorSend', { phone: settings.whatsappNumber })}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="btn-type mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-white shadow-md transition-transform hover:scale-[1.02] disabled:opacity-70"
                  >
                    {status === 'sending' ? t('sending') : t('submit')}
                  </button>
                  <p className="mt-3 text-center text-xs text-foreground/50">{t('support')}</p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </LeadContextApi.Provider>
  )
}
