import React from 'react'
import { setRequestLocale } from 'next-intl/server'
import { CulturesGrid } from '@/features/cultures/components/CulturesGrid'
import { getCultureCards } from '@/features/cultures/queries'

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params
  const title = locale === 'pt-BR' ? 'Culturas · Juma-Agro' : locale === 'en' ? 'Crops · Juma-Agro' : 'Cultivos · Juma-Agro'

  return {
    title,
  }
}

export default async function CulturasPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params
  setRequestLocale(locale)
  const cultures = await getCultureCards(locale)

  return (
    <div className="pt-[120px] pb-32">
      <CulturesGrid cultures={cultures} />
    </div>
  )
}
