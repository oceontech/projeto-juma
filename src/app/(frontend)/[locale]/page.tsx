import React from 'react'
import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

export default async function HomePage(props: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params
  setRequestLocale(locale)

  return <HomeContent />
}

function HomeContent() {
  const t = useTranslations('nav')

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header de verificação ─────────────────────────── */}
      <header className="bg-primary px-xl py-lg">
        <p className="text-white text-body-regular text-sm tracking-wider uppercase">
          Juma Agro — i18n check
        </p>
      </header>

      <div className="mx-auto max-w-5xl px-lg py-3xl">
        {/* ── Verificação de tradução ─────────────────────── */}
        <section className="mb-3xl">
          <h1 className="text-primary mb-lg">
            Juntos alimentamos o mundo
          </h1>
          <p className="text-foreground mb-lg">
            Navegação traduzida (namespace &quot;nav&quot;):
          </p>
          <nav>
            <ul className="flex flex-wrap gap-md">
              <NavItem label={t('home')} />
              <NavItem label={t('products')} />
              <NavItem label={t('cultures')} />
              <NavItem label={t('calculator')} />
              <NavItem label={t('experience')} />
              <NavItem label={t('about')} />
              <NavItem label={t('articles')} />
              <NavItem label={t('contact')} />
            </ul>
          </nav>
        </section>

        {/* ── Paleta da marca ─────────────────────────────── */}
        <section className="mb-3xl">
          <h3 className="text-foreground mb-lg">Paleta da marca</h3>
          <div className="grid grid-cols-2 gap-md sm:grid-cols-3 md:grid-cols-5">
            <ColorSwatch color="bg-primary" label="Primária" hex="#004C26" />
            <ColorSwatch color="bg-secondary" label="Secundária" hex="#302783" />
            <ColorSwatch color="bg-accent" label="Apoio" hex="#659357" />
            <ColorSwatch color="bg-background" label="Fundo" hex="#F2F6F2" border />
            <ColorSwatch color="bg-foreground" label="Texto" hex="#1A1A1A" />
          </div>
        </section>
      </div>
    </div>
  )
}

/* ── Componentes auxiliares (temporários) ──────────────────── */
function NavItem({ label }: { label: string }) {
  return (
    <li className="rounded-md bg-primary/10 px-md py-sm text-sm text-heading text-primary">
      {label}
    </li>
  )
}

function ColorSwatch({
  color,
  label,
  hex,
  border,
}: {
  color: string
  label: string
  hex: string
  border?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-xs">
      <div
        className={`h-16 w-full rounded-md ${color} ${
          border ? 'border border-foreground/20' : ''
        }`}
      />
      <span className="text-heading text-xs uppercase tracking-wider text-foreground">
        {label}
      </span>
      <span className="text-body font-mono text-xs text-foreground/60">
        {hex}
      </span>
    </div>
  )
}
