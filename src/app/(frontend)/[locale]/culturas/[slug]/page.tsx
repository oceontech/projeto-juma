import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

import { CulturePage } from '@/features/cultures/components/CulturePage'
import { CULTURE_SLUGS } from '@/features/cultures/data/slugs'
import { routing } from '@/i18n/routing'

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    CULTURE_SLUGS.map((slug) => ({ locale, slug })),
  )
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { slug } = await props.params
  return { title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} · Culturas · Juma Agro` }
}

export default async function CulturaPage(props: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await props.params
  setRequestLocale(locale)

  if (!(CULTURE_SLUGS as readonly string[]).includes(slug)) notFound()

  return (
    <div>
      <CulturePage slug={slug} />
    </div>
  )
}
