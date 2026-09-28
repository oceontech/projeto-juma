import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

import { ProductPage } from '@/features/products/components/ProductPage'
import { getProduct, getProducts } from '@/features/products/queries'
import { routing } from '@/i18n/routing'

export async function generateStaticParams() {
  // Os slugs são os mesmos nos 3 idiomas; produtos novos renderizam na primeira visita.
  const products = await getProducts(routing.defaultLocale)
  return routing.locales.flatMap((locale) => products.map((p) => ({ locale, slug: p.slug })))
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await props.params
  const product = await getProduct(slug, locale)
  if (!product) return { title: 'Juma-Agro' }
  return { title: `${product.name} · Juma-Agro`, description: product.description }
}

export default async function ProdutoPage(props: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await props.params
  setRequestLocale(locale)

  const product = await getProduct(slug, locale)
  if (!product) notFound()

  return (
    <div className="pt-[80px] bg-[#F2F6F2]">
      <ProductPage product={product} />
    </div>
  )
}
