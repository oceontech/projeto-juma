import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

import { CulturePage } from '@/features/cultures/components/CulturePage'
import { getCulture, getCultures } from '@/features/cultures/queries'
import { routing } from '@/i18n/routing'

export async function generateStaticParams() {
  // Os slugs são os mesmos nos 3 idiomas; culturas novas renderizam na primeira visita.
  const cultures = await getCultures(routing.defaultLocale)
  return routing.locales.flatMap((locale) => cultures.map((c) => ({ locale, slug: c.slug })))
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await props.params
  const culture = await getCulture(slug, locale)
  if (!culture) return { title: 'Juma-Agro' }
  return { title: `${culture.name} · Juma-Agro`, description: culture.description }
}

export default async function CulturaPage(props: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await props.params
  setRequestLocale(locale)

  const culture = await getCulture(slug, locale)
  if (!culture) notFound()

  return (
    <div>
      <CulturePage culture={culture} />
    </div>
  )
}
