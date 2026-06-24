import React from 'react'
import { Montserrat, Space_Grotesk } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { routing } from '@/i18n/routing'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SmoothScroll } from '@/features/animation/SmoothScroll'
import '../globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['300', '400', '600', '900'],
  style: ['normal', 'italic'],
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
})


export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params

  const titles: Record<string, string> = {
    'pt-BR': 'Juma Agro — Fertilizantes especiais e aminoácidos',
    en: 'Juma Agro — Specialty fertilizers and amino acids',
    es: 'Juma Agro — Fertilizantes especiales y aminoácidos',
  }

  const descriptions: Record<string, string> = {
    'pt-BR':
      'A Juma Agro desenvolve fertilizantes especiais e aminoácidos que aumentam a produtividade do campo, fase a fase.',
    en: 'Juma Agro develops specialty fertilizers and amino acids that boost field productivity, phase by phase.',
    es: 'Juma Agro desarrolla fertilizantes especiales y aminoácidos que aumentan la productividad del campo, fase a fase.',
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
    <html lang={locale} className={`${montserrat.variable} ${spaceGrotesk.variable}`}>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider messages={messages}>
          <SmoothScroll>
            <Navbar />
            <main id="main" className="flex-1">
              {props.children}
            </main>
            <Footer />
          </SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
