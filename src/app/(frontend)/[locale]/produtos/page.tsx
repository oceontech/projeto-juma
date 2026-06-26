import React from 'react'
import { getTranslations } from 'next-intl/server'
import { ProductGrid } from '@/features/products/components/ProductGrid'

// Otimização de metadados para SEO
export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params
  const t = await getTranslations({ locale, namespace: 'common' })

  // Por enquanto usando strings diretas, conforme acordado (hardcoded na etapa visual),
  // mas deixando a estrutura de metadados pronta.
  const title = locale === 'pt-BR' ? 'Produtos · Juma Agro' : locale === 'en' ? 'Products · Juma Agro' : 'Productos · Juma Agro'
  
  return {
    title,
  }
}

export default function ProdutosPage() {
  return (
    <div className="pt-[120px] pb-32">
      <ProductGrid />
    </div>
  )
}
