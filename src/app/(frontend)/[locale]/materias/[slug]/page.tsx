import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { ArticlePage } from '@/features/articles/components/ArticlePage'
import { getArticle, getArticles } from '@/features/articles/queries'
import { routing } from '@/i18n/routing'

// Publicação agendada: regera a cada 15 min para a matéria aparecer no horário marcado.
export const revalidate = 900

export async function generateStaticParams() {
  // A lista de slugs é a mesma nos 3 idiomas; matérias novas renderizam na primeira visita.
  const articles = await getArticles(routing.defaultLocale)
  return routing.locales.flatMap((locale) => articles.map((article) => ({ locale, slug: article.id })))
}

const snippet = (text: string, max = 155) => {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : `${clean.slice(0, clean.lastIndexOf(' ', max))}…`
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await props.params
  const article = await getArticle(slug, locale)
  if (!article) return { title: 'Juma-Agro' }

  return {
    title: `${article.title} · Juma-Agro`,
    // Descrição do Google: o subtítulo; sem ele, o começo do primeiro parágrafo.
    description: article.subtitle || snippet(article.blocks.flatMap((b) => (b.type === 'p' ? [b.text] : []))[0] ?? ''),
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
