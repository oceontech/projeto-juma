import { RichText } from '@payloadcms/richtext-lexical/react'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

import { Container } from '@/components/layout/Container'
import { getPage, getPublishedPageSlugs } from '@/features/pages/queries'
import { routing } from '@/i18n/routing'

type Locale = 'pt-BR' | 'en' | 'es'

/** Páginas simples do painel (Site › Páginas): política, termos, campanhas. */
export async function generateStaticParams() {
  const slugs = await getPublishedPageSlugs()
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata(props: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await props.params
  const page = await getPage(slug, locale as Locale)
  if (!page) return { title: 'Juma-Agro' }
  return { title: `${page.titulo} · Juma-Agro`, description: page.resumo || undefined }
}

export default async function SimplePage(props: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await props.params
  setRequestLocale(locale)
  const page = await getPage(slug, locale as Locale)
  if (!page) notFound()

  const updated = new Date(page.updatedAt).toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' })
  const label = { 'pt-BR': 'Atualizado em', en: 'Updated on', es: 'Actualizado el' }[locale as Locale] ?? 'Atualizado em'

  return (
    <div className="pt-[140px] pb-32">
      <Container as="article" className="max-w-[46rem]">
        <h1 className="text-4xl font-black leading-tight tracking-tight text-foreground md:text-5xl">{page.titulo}</h1>
        {page.resumo && <p className="mt-md text-lg text-foreground/70">{page.resumo}</p>}
        <p className="mt-md text-sm text-foreground/50">
          {label} {updated}
        </p>
        {page.conteudo && (
          <div className="mt-2xl text-foreground/85 leading-relaxed [&_a]:text-primary [&_a]:underline [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-foreground [&_li]:mb-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_strong]:text-foreground [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic">
            <RichText data={page.conteudo} />
          </div>
        )}
      </Container>
    </div>
  )
}
