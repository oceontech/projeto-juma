import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

import { ProductPage } from '@/features/products/components/ProductPage'
import { PRODUCT_SLUGS } from '@/features/products/data/slugs'
import { routing } from '@/i18n/routing'

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    PRODUCT_SLUGS.map((slug) => ({ locale, slug })),
  )
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { slug } = await props.params
  return { title: `${slug.replace(/-/g, ' ')} · Produtos · Juma Agro` }
}

export default async function ProdutoPage(props: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await props.params
  setRequestLocale(locale)

  if (!(PRODUCT_SLUGS as readonly string[]).includes(slug)) notFound()

  return (
    <div className="pt-[80px] bg-[#F2F6F2]">
      <ProductPage slug={slug} />
    </div>
  )
}
