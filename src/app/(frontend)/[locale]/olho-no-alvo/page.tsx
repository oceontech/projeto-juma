import React from 'react'
import { OlhoNoAlvoPage } from '@/features/olho-no-alvo/components/OlhoNoAlvoPage'

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params

  const titles: Record<string, string> = {
    'pt-BR': 'Programa Olho no Alvo · Juma-Agro',
    'en': 'Olho no Alvo Program · Juma-Agro',
    'es': 'Programa Olho no Alvo · Juma-Agro',
  }

  return {
    title: titles[locale] || titles['pt-BR'],
  }
}

export default function OlhoNoAlvoRoute() {
  return (
    <div>
      <OlhoNoAlvoPage />
    </div>
  )
}
