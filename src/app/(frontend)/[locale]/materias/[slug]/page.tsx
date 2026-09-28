import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { ArticlePage } from '@/features/articles/components/ArticlePage'
import { getArticle, getArticles } from '@/features/articles/queries'
import { routing } from '@/i18n/routing'

export async function generateStaticParams() {
  // A lista de slugs é a mesma nos 3 idiomas; matérias novas renderizam na primeira visita.
  const articles = await getArticles(routing.defaultLocale)
  return routing.locales.flatMap((locale) => articles.map((article) => ({ locale, slug: article.id })))
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await props.params
  const article = await getArticle(slug, locale)
  if (!article) return { title: 'Juma-Agro' }

  return {
    title: `${article.title} · Juma-Agro`,
    description: article.subtitle,
  }
}

export default async function MateriaPageRoute(props: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await props.params
  setRequestLocale(locale)

  const articles = await getArticles(locale)
  const article = articles.find((a) => a.id === slug)
  if (!article) notFound()

  const related = articles.filter((a) => a.id !== slug).slice(0, 3)
  return <ArticlePage article={article} related={related} />
}
