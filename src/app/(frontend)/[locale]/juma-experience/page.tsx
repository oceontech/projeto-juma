import React from 'react'
import { getTranslations } from 'next-intl/server'
import { ExperiencePage } from '@/features/experience/components/ExperiencePage'

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params
  const title = locale === 'pt-BR' ? 'Juma Experience · Juma Agro' : 'Juma Experience · Juma Agro'
  
  return {
    title,
  }
}

export default function JumaExperienceRoute() {
  return (
    <div className="pt-[120px] pb-32">
      <ExperiencePage />
    </div>
  )
}
