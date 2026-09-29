import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig } from 'payload'

import { hasRole } from '../access/roles'
import { revalidateUsSite } from '../features/cms/revalidateUs'

/**
 * Blog do site americano (juma-agro-eua.vercel.app/blog). Só em inglês.
 * Regra do mercado dos EUA (FIFRA): descrever o que o produto entrega, nunca o
 * efeito na planta ou no inseto; número só com fonte.
 */

const revalidate: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  await revalidateUsSite(['/', '/blog', `/blog/${doc.slug}`, previousDoc?.slug ? `/blog/${previousDoc.slug}` : ''].filter(Boolean))
  return doc
}
const revalidateOnDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await revalidateUsSite(['/', '/blog', `/blog/${doc.slug}`])
  return doc
}

export const PostsUs: CollectionConfig = {
  slug: 'posts-us',
  labels: { singular: 'Post', plural: 'Blog' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', '_status', 'updatedAt'],
    listSearchableFields: ['title', 'slug'],
    group: 'Conteúdo',
    description:
      'Posts do blog do site americano, em inglês. Descreva o que o produto entrega, nunca o efeito na planta ou no inseto (FIFRA), e todo número com fonte.',
    hideAPIURL: true,
    pagination: { defaultLimit: 24 },
    components: { views: { list: { Component: '/components/admin/blog/BlogRedirect#BlogRedirect' } } },
  },
  defaultSort: '-date',
  versions: { drafts: true, maxPerDoc: 30 },
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    create: ({ req }) => hasRole(req, 'admin', 'editor'),
    update: ({ req }) => hasRole(req, 'admin', 'editor'),
    delete: ({ req }) => hasRole(req, 'admin', 'editor'),
  },
  hooks: { afterChange: [revalidate], afterDelete: [revalidateOnDelete] },
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    {
      name: 'excerpt',
      label: 'Summary',
      type: 'textarea',
      admin: { rows: 2, description: 'One or two sentences. Shows on the blog list, on Google and when the link is shared.' },
    },
    { name: 'cover', label: 'Cover image', type: 'upload', relationTo: 'media' },
    { name: 'body', label: 'Text', type: 'richText' },
    {
      // HTML pronto para o site EUA, que não tem o editor do Payload instalado.
      name: 'bodyHtml',
      type: 'text',
      virtual: true,
      admin: { hidden: true },
      hooks: {
        afterRead: [
          ({ siblingData }) =>
            siblingData?.body ? convertLexicalToHTML({ data: siblingData.body, disableContainer: true }) : '',
        ],
      },
    },
    {
      name: 'slug',
      label: 'Endereço',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Ex.: foliar-feeding-in-florida. Vira /blog/endereço.' },
      validate: (value: unknown) =>
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value ?? '')) || 'Use só letras minúsculas, números e hífen.',
    },
    {
      name: 'date',
      label: 'Data',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' } },
    },
    { name: 'author', label: 'Autor', type: 'text', admin: { position: 'sidebar' } },
    {
      name: 'category',
      label: 'Categoria',
      type: 'select',
      options: [
        { label: 'Field notes', value: 'field-notes' },
        { label: 'Crop nutrition', value: 'crop-nutrition' },
        { label: 'Trials', value: 'trials' },
        { label: 'Company', value: 'company' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
