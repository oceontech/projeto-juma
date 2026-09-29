import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig } from 'payload'

import { hasRole } from '../access/roles'
import { revalidateAllPages, revalidateSite } from '../features/cms/revalidate'

/**
 * Páginas simples do site Brasil: política de privacidade, termos de uso,
 * página de campanha ou evento. Cada uma vira juma-agro.com.br/<endereço>.
 * As páginas desenhadas (Home, Sobre, Produtos...) ficam no código.
 */

// Endereços que já são páginas do site: uma Página com esse nome nunca apareceria.
const RESERVED = ['produtos', 'culturas', 'materias', 'sobre', 'contato', 'juma-experience', 'olho-no-alvo', 'desata', 'admin', 'api']

const revalidate: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  revalidateSite([`/${doc.slug}`, previousDoc?.slug && previousDoc.slug !== doc.slug ? `/${previousDoc.slug}` : null])
  // O rodapé mostra o link da política só quando ela está publicada.
  if (doc.slug === 'politica-de-privacidade' || previousDoc?._status !== doc._status) revalidateAllPages()
}

const revalidateOnDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateSite([`/${doc.slug}`])
  revalidateAllPages()
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Página', plural: 'Páginas' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'slug', '_status', 'updatedAt'],
    group: 'Site',
    description:
      'Páginas de texto do site Brasil, como política de privacidade, termos de uso ou uma campanha. O endereço vira juma-agro.com.br/endereço.',
    hideAPIURL: true,
    pagination: { defaultLimit: 20 },
  },
  versions: { drafts: true, maxPerDoc: 30 },
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    create: ({ req }) => hasRole(req, 'admin', 'editor'),
    update: ({ req }) => hasRole(req, 'admin', 'editor'),
    delete: ({ req }) => hasRole(req, 'admin'),
  },
  hooks: { afterChange: [revalidate], afterDelete: [revalidateOnDelete] },
  fields: [
    { name: 'titulo', label: 'Título', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      label: 'Endereço',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Só letras minúsculas, números e hífen. Ex.: politica-de-privacidade, termos-de-uso.',
      },
      validate: (value: unknown) => {
        const v = String(value ?? '')
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)) return 'Use só letras minúsculas sem acento, números e hífen.'
        if (RESERVED.includes(v)) return 'Esse endereço já é uma página do site. Escolha outro.'
        return true
      },
    },
    {
      name: 'resumo',
      label: 'Resumo',
      type: 'textarea',
      localized: true,
      admin: { rows: 2, description: 'Aparece no Google e ao compartilhar o link. Até 160 caracteres.' },
    },
    { name: 'conteudo', label: 'Conteúdo', type: 'richText', localized: true },
  ],
}
