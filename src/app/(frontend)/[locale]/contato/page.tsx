import React from 'react'
import { getTranslations } from 'next-intl/server'
import { ContactPage } from '@/features/contact/components/ContactPage'

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params
  const title = locale === 'pt-BR' ? 'Contato · Juma Agro' : 'Contact · Juma Agro'
  
  return {
    title,
  }
}

export default function ContatoRoute() {
  return (
    <div className="pt-[120px] pb-32">
      <ContactPage />
    </div>
  )
}
