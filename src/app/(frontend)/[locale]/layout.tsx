import React from 'react'
import { Montserrat, Space_Grotesk } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { routing } from '@/i18n/routing'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Preloader } from '@/components/layout/Preloader'
import { SmoothScroll } from '@/features/animation/SmoothScroll'
import { MobileLogo } from '@/components/layout/MobileLogo'
import '../globals.css'

/* `display: 'optional'`, não `'swap'`.
   Títulos usam peso 900 (Black) — bem mais largo que a fonte de fallback do
   sistema. Com `swap`, o texto renderiza primeiro no fallback (mais estreito),
   e a troca para a Montserrat Black assim que ela carrega FAZ o texto ocupar
   mais espaço horizontal — uma linha que cabia no fallback deixa de caber e
   quebra, o título "pula" sozinho alguns instantes depois de aparecer. É um
   problema em QUALQUER título do site, não de uma seção: a fonte é uma
   instância só, usada em `--font-heading`/`--font-body`/`--font-sans`.
   `optional` dá à fonte real uma janela curta para chegar a tempo do primeiro
   paint; se não chegar, o fallback fica — sem troca tardia, sem o salto. */
const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'optional',
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '900'],
  style: ['normal', 'italic'],
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'optional',
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
})


export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params

  const titles: Record<string, string> = {
    'pt-BR': 'Juma-Agro — Fertilizantes especiais e aminoácidos',
    en: 'Juma-Agro — Specialty fertilizers and amino acids',
    es: 'Juma-Agro — Fertilizantes especiales y aminoácidos',
  }

  const descriptions: Record<string, string> = {
    'pt-BR':
      'A Juma-Agro desenvolve fertilizantes especiais e aminoácidos que aumentam a produtividade do campo, fase a fase.',
    en: 'Juma-Agro develops specialty fertilizers and amino acids that boost field productivity, phase by phase.',
    es: 'Juma-Agro desarrolla fertilizantes especiales y aminoácidos que aumentan la productividad del campo, fase a fase.',
  }

  return {
    title: titles[locale] || titles['pt-BR'],
    description: descriptions[locale] || descriptions['pt-BR'],
  }
}

export default async function LocaleLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params

  // Validate locale
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  // Load messages for the NextIntlClientProvider
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning className={`${montserrat.variable} ${spaceGrotesk.variable}`}>
      <body suppressHydrationWarning className="flex min-h-[100dvh] w-full max-w-full flex-col overflow-x-hidden relative">
        <Preloader />
        <NextIntlClientProvider messages={messages}>
          <SmoothScroll>
            <Navbar />
            <MobileLogo />
            <main id="main" className="flex-1 w-full max-w-full overflow-x-hidden">
              {props.children}
            </main>
            <Footer />
          </SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
