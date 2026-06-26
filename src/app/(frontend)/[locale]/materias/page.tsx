import React from 'react'
import { getTranslations } from 'next-intl/server'
import { ArticlesPage } from '@/features/articles/components/ArticlesPage'

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params
  const title = locale === 'pt-BR' ? 'Matérias · Juma Agro' : 'Articles · Juma Agro'
  
  return {
    title,
  }
}

export default function MateriasRoute() {
  return (
    <div className="pt-[120px] pb-32">
      <ArticlesPage />
    </div>
  )
}
