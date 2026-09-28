import React from 'react'
import { setRequestLocale } from 'next-intl/server'
import { ProductGrid } from '@/features/products/components/ProductGrid'
import { getProductCards } from '@/features/products/queries'

// Otimização de metadados para SEO
export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params
  const title = locale === 'pt-BR' ? 'Produtos · Juma-Agro' : locale === 'en' ? 'Products · Juma-Agro' : 'Productos · Juma-Agro'
  
  return {
    title,
  }
}

export default async function ProdutosPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params
  setRequestLocale(locale)
  const products = await getProductCards(locale)

  return (
    <div className="pt-[120px] pb-32">
      <ProductGrid products={products} />
    </div>
  )
}
