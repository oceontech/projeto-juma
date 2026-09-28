import React from 'react'
import { setRequestLocale } from 'next-intl/server'
import { ArticlesPage } from '@/features/articles/components/ArticlesPage'
import { getArticles } from '@/features/articles/queries'

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params
  const title = locale === 'pt-BR' ? 'Matérias · Juma-Agro' : locale === 'es' ? 'Artículos · Juma-Agro' : 'Articles · Juma-Agro'

  return {
    title,
  }
}

export default async function MateriasRoute(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params
  setRequestLocale(locale)
  const articles = await getArticles(locale)

  return (
    <div className="pt-[120px] pb-32">
      <ArticlesPage articles={articles} />
    </div>
  )
}
