import React from 'react'
import { getTranslations } from 'next-intl/server'
import { CulturesGrid } from '@/features/cultures/components/CulturesGrid'

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params
  const title = locale === 'pt-BR' ? 'Culturas · Juma Agro' : locale === 'en' ? 'Crops · Juma Agro' : 'Cultivos · Juma Agro'
  
  return {
    title,
  }
}

export default function CulturasPage() {
  return (
    <div className="pt-[120px] pb-32">
      <CulturesGrid />
    </div>
  )
}
