import React from 'react'
import { getTranslations } from 'next-intl/server'
import { AboutPage } from '@/features/about/components/AboutPage'

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params
  const title = locale === 'pt-BR' ? 'Sobre a Juma · Juma Agro' : 'About Juma · Juma Agro'
  
  return {
    title,
  }
}

export default function SobreRoute() {
  return (
    <div className="pt-[120px] pb-32">
      <AboutPage />
    </div>
  )
}
