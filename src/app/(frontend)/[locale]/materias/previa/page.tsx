import { setRequestLocale } from 'next-intl/server'

import { ArticlePreviewFrame } from '@/features/articles/components/ArticlePreviewFrame'

/** Prévia da matéria usada pelo painel (iframe). Fora do Google. */
export const metadata = { title: 'Prévia · Juma-Agro', robots: { index: false, follow: false } }

export default async function PreviaMateria(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params
  setRequestLocale(locale)
  return <ArticlePreviewFrame />
}
