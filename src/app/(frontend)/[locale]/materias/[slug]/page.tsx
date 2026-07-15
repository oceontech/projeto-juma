import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { ArticlePage } from '@/features/articles/components/ArticlePage'
import { ARTICLES_DATA } from '@/features/articles/data/articlesData'
import { routing } from '@/i18n/routing'

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    ARTICLES_DATA.map((article) => ({ locale, slug: article.id })),
  )
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await props.params
  const article = ARTICLES_DATA.find((a) => a.id === slug)
  if (!article) return { title: 'Juma Agro' }

  const trans = article.translations[locale as 'pt-BR' | 'en' | 'es'] || article.translations['pt-BR']
  return {
    title: `${trans.title} · Juma Agro`,
    description: trans.subtitle,
  }
}

export default async function MateriaPageRoute(props: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await props.params
  setRequestLocale(locale)

  const exists = ARTICLES_DATA.some((a) => a.id === slug)
  if (!exists) notFound()

  return <ArticlePage slug={slug} />
}
