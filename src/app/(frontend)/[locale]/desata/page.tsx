import React from 'react'
import { DesataPage } from '@/features/desata/components/DesataPage'

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params
  
  const titles: Record<string, string> = {
    'pt-BR': 'Programa Desata · Juma Agro',
    'en': 'Desata Program · Juma Agro',
    'es': 'Programa Desata · Juma Agro',
  }
  
  return {
    title: titles[locale] || titles['pt-BR'],
  }
}

export default function DesataRoute() {
  return (
    <div>
      <DesataPage />
    </div>
  )
}
