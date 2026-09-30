import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig, Field } from 'payload'

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

/** Revisão final com IA na etapa Publicação (components/admin/blog/AiAssist). */
const ai = (name: string): Field => ({
  name,
  type: 'ui',
  admin: { components: { Field: { path: '/components/admin/blog/AiAssist#AiAssist', clientProps: { site: 'us' } } } },
})

/** Rodapé de cada etapa do post ("← anterior · próxima →"). */
const step = (name: string, clientProps: { prev?: string; next?: string; last?: boolean }): Field => ({
  name,
  type: 'ui',
  admin: { components: { Field: { path: '/components/admin/fields/StepFooter#StepFooter', clientProps } } },
})

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
    components: {
      views: { list: { Component: '/components/admin/blog/BlogRedirect#BlogRedirect' } },
      edit: {
        PublishButton: { path: '/components/admin/blog/PublishButton#PublishButton', clientProps: { dateField: 'date' } },
        // Progresso e etapas do post na mesma linha de "Salvar rascunho" e "Publicar".
        beforeDocumentControls: [{ path: '/components/admin/blog/PostProgress#PostProgress', clientProps: { site: 'us' } }],
      },
    },
  },
  defaultSort: '-date',
  versions: { drafts: true, maxPerDoc: 30 },
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    create: ({ req }) => hasRole(req, 'admin', 'editor'),
    update: ({ req }) => hasRole(req, 'admin', 'editor'),
    delete: ({ req }) => hasRole(req, 'admin', 'editor'),
  },
  hooks: {
    beforeChange: [
      // A IA estima na revisão final; sem ela, conta pelas palavras do texto.
      ({ data }) => {
        if (data && !data.readMinutes) {
          const words = (JSON.stringify(data.body ?? '').match(/"text":"([^"]*)"/g) ?? []).join(' ').split(/\s+/).length
          data.readMinutes = Math.max(1, Math.round(words / 200))
        }
        return data
      },
    ],
    afterChange: [revalidate],
    afterDelete: [revalidateOnDelete],
  },
  fields: [
    // Prévia ao lado do formulário: página, Google e o que falta.
    {
      name: 'previa',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: {
            path: '/components/admin/blog/PostUsPreview#PostUsPreview',
            clientProps: { usSite: process.env.US_SITE_URL || 'https://juma-agro-eua.vercel.app' },
          },
        },
      },
    },
    {
      // Etapas do post: cada aba é uma etapa da barra de progresso.
      type: 'tabs',
      tabs: [
        {
          label: 'Assunto',
          description: 'Tudo em inglês americano: é o que o site dos EUA mostra. A IA sugere opções melhores na última etapa.',
          fields: [
            {
              name: 'title',
              label: 'Título (em inglês)',
              type: 'text',
              required: true,
              admin: { description: 'Ex.: Foliar potassium in the Florida spray pass' },
            },
            {
              name: 'excerpt',
              label: 'Resumo (em inglês)',
              type: 'textarea',
              admin: { rows: 2, description: 'Uma ou duas frases. Aparece na lista do blog, no Google e ao compartilhar o link.' },
            },
            {
              name: 'tema',
              label: 'Categoria',
              type: 'relationship',
              relationTo: 'categorias',
              filterOptions: { site: { equals: 'us' } },
              admin: {
                description: 'O assunto do post: vira etiqueta no blog.',
                components: { Field: { path: '/components/admin/blog/CategoryField#CategoryField', clientProps: { site: 'us' } } },
              },
            },
            { name: 'author', label: 'Autor', type: 'text', admin: { description: 'Ex.: Juma-Agro agronomy' } },
            step('passo1', { next: 'Texto' }),
          ],
        },
        {
          label: 'Texto',
          description:
            'Escreva como num documento ou cole um texto pronto, em inglês. Descreva o que o produto entrega, nunca o efeito na planta ou no inseto (FIFRA). Todo número com fonte.',
          fields: [
            {
              // Mesmo editor em blocos do blog BR; grava no texto rico (convertido em HTML para o site).
              name: 'body',
              label: 'Texto (em inglês)',
              type: 'richText',
              admin: { components: { Field: { path: '/components/admin/blog/BlockEditor#BlockEditor', clientProps: { site: 'us' } } } },
            },
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
            step('passo2', { prev: 'Assunto', next: 'Capa' }),
          ],
        },
        {
          label: 'Capa',
          description: 'A foto que abre o post e aparece no card da lista do blog. Envie, escolha da biblioteca ou crie com IA.',
          fields: [
            {
              name: 'cover',
              label: 'Foto de capa',
              type: 'upload',
              relationTo: 'media',
              admin: { components: { Field: { path: '/components/admin/blog/CoverField#CoverField', clientProps: { site: 'us' } } } },
            },
            step('passo3', { prev: 'Texto', next: 'Publicação' }),
          ],
        },
        {
          label: 'Publicação',
          description: 'Revisão final com IA, endereço e data.',
          fields: [
            ai('iaPublicacao'),
            {
              name: 'slug',
              label: 'Endereço',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              admin: {
                components: {
                  Field: {
                    path: '/components/admin/fields/SlugField#SlugField',
                    clientProps: { source: 'title', prefix: 'juma-agro-eua.vercel.app/blog/' },
                  },
                },
              },
              validate: (value: unknown) =>
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value ?? '')) || 'Use só letras minúsculas, números e hífen.',
            },
            {
              // Data de publicação: agora (ao publicar) ou agendada. O site só mostra a partir dela.
              name: 'date',
              label: 'Quando publicar',
              type: 'date',
              required: true,
              defaultValue: () => new Date().toISOString(),
              admin: { components: { Field: '/components/admin/blog/PublishWhen#PublishWhen' } },
            },
            {
              // Só a IA preenche (revisão final); sem ela, o hook conta pelas palavras.
              name: 'readMinutes',
              label: 'Tempo de leitura (min)',
              type: 'number',
              min: 1,
              admin: { hidden: true },
            },
            step('passo4', { prev: 'Capa', last: true }),
          ],
        },
      ],
    },
  ],
}
