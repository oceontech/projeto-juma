import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  Field,
  Payload,
} from 'payload'

import { hasRole, isAdminField } from '../access/roles'
import { revalidateSite } from '../features/cms/revalidate'

// Uma cultura aparece na própria página, na grade /culturas e na home.
async function revalidateCultures(payload: Payload, extraSlug?: string) {
  const { docs } = await payload.find({
    collection: 'cultures',
    limit: 500,
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })
  const slugs = new Set([...docs.map((d) => d.slug), ...(extraSlug ? [extraSlug] : [])])
  revalidateSite(['/', '/culturas', ...[...slugs].map((slug) => `/culturas/${slug}`)])
}
const revalidate: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  await revalidateCultures(req.payload, previousDoc?.slug)
  return doc
}
const revalidateOnDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await revalidateCultures(req.payload, doc.slug)
  return doc
}

const oneLine = { description: 'Um item por linha.' }

const tabs: Field = {
  type: 'tabs',
  tabs: [
    {
      label: 'Página',
      fields: [
        { name: 'nome', type: 'text', required: true, localized: true },
        {
          name: 'etiqueta',
          type: 'text',
          localized: true,
          admin: { description: 'Pílula acima do nome. Ex.: Grão' },
        },
        { name: 'descricao', label: 'Descrição', type: 'textarea', localized: true },
        {
          name: 'foto',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Foto de campo usada no topo, na grade e na home.' },
        },
        {
          name: 'listaAtuacao',
          label: 'Como a Juma atua',
          type: 'textarea',
          localized: true,
          admin: { ...oneLine, rows: 8 },
        },
      ],
    },
    {
      label: 'Desafios',
      fields: [
        {
          name: 'listaDesafios',
          label: 'Desafios por fase',
          type: 'array',
          labels: { singular: 'Desafio', plural: 'Desafios' },
          admin: {
            components: {
              RowLabel: {
                path: '/components/admin/fields/RowLabel#RowLabel',
                clientProps: { fields: ['etapa', 'titulo'], fallback: 'Desafio' },
              },
            },
            initCollapsed: true,
          },
          fields: [
            {
              name: 'etapa',
              type: 'text',
              localized: true,
              admin: { description: 'Ex.: 01 · Tratamento de sementes' },
            },
            { name: 'titulo', label: 'Título', type: 'text', localized: true },
            { name: 'descricao', label: 'Descrição', type: 'textarea', localized: true },
          ],
        },
      ],
    },
    {
      label: 'Manejo',
      fields: [
        {
          name: 'fasesManejo',
          label: 'Manejo por fase',
          type: 'array',
          labels: { singular: 'Fase', plural: 'Fases' },
          admin: {
            components: {
              RowLabel: {
                path: '/components/admin/fields/RowLabel#RowLabel',
                clientProps: { fields: ['rotulo', 'fase'], fallback: 'Fase' },
              },
            },
            initCollapsed: true,
            description: 'Texto do folheto de sugestões de nutrição da cultura.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'rotulo',
                  label: 'Rótulo',
                  type: 'text',
                  localized: true,
                  admin: { width: '30%', description: 'Ex.: Fase 01' },
                },
                {
                  name: 'fase',
                  type: 'text',
                  localized: true,
                  admin: { width: '70%', description: 'Ex.: Tratamento de sementes ou V2' },
                },
              ],
            },
            {
              name: 'itens',
              label: 'Produtos e doses',
              type: 'array',
              labels: { singular: 'Produto', plural: 'Produtos' },
              admin: {
                components: {
                  RowLabel: {
                    path: '/components/admin/fields/RowLabel#RowLabel',
                    clientProps: { fields: ['produto', 'dose'], fallback: 'Produto' },
                  },
                },
                initCollapsed: true,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'produto',
                      type: 'text',
                      localized: true,
                      admin: {
                        width: '40%',
                        description: 'Nome livre: vale também para produtos sem página no site.',
                      },
                    },
                    { name: 'dose', type: 'text', localized: true, admin: { width: '60%' } },
                  ],
                },
              ],
            },
          ],
        },
        { name: 'notaManejo', label: 'Nota do manejo', type: 'textarea', localized: true },
        {
          name: 'fonte',
          type: 'text',
          localized: true,
          admin: { description: 'Ex.: Folheto Juma-Agro · Sugestões de nutrição para soja (2025)' },
        },
      ],
    },
    {
      label: 'Produtos recomendados',
      fields: [
        {
          name: 'recomendados',
          type: 'array',
          labels: { singular: 'Produto recomendado', plural: 'Produtos recomendados' },
          admin: {
            initCollapsed: true,
            description: 'Nome, cor e foto vêm do cadastro do produto.',
          },
          fields: [
            { name: 'produto', type: 'relationship', relationTo: 'products', required: true },
            { name: 'tag', label: 'Etiqueta', type: 'text', localized: true },
            { name: 'descricao', label: 'Chamada', type: 'text', localized: true },
          ],
        },
      ],
    },
    {
      label: 'Textos e aparência',
      fields: [
        {
          name: 'preposicoes',
          label: 'Preposições (montam frases como "na soja", "da soja")',
          type: 'group',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'em',
                  type: 'text',
                  localized: true,
                  admin: { width: '25%', description: 'na / no / nos' },
                },
                {
                  name: 'de',
                  type: 'text',
                  localized: true,
                  admin: { width: '25%', description: 'da / do / dos' },
                },
                {
                  name: 'para',
                  type: 'text',
                  localized: true,
                  admin: { width: '25%', description: 'para a / para o' },
                },
                {
                  name: 'sua',
                  type: 'text',
                  localized: true,
                  admin: { width: '25%', description: 'na sua / no seu' },
                },
              ],
            },
          ],
        },
        {
          name: 'aparencia',
          label: 'Fundos enquanto a foto carrega (só admin)',
          type: 'group',
          access: { update: isAdminField },
          fields: [
            { name: 'gradienteHero', label: 'Topo da página (CSS)', type: 'text' },
            { name: 'fundoHome', label: 'Card da home (CSS)', type: 'text' },
          ],
        },
      ],
    },
  ],
}

export const Cultures: CollectionConfig = {
  slug: 'cultures',
  labels: { singular: 'Cultura', plural: 'Culturas' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'slug', 'ordem', '_status'],
    group: 'Conteúdo',
    description: 'Culturas do site Brasil. Textos em cada idioma pelo seletor "Idioma" no topo.',
    hideAPIURL: true,
    pagination: { defaultLimit: 24 },
    components: {
      views: { list: { Component: '/components/admin/content/ContentGrid#ContentGrid' } },
    },
  },
  defaultSort: 'ordem',
  // Rascunho salvo por botão, sem autosave: abrir "Novo" e desistir não cria rascunho vazio.
  versions: { drafts: true, maxPerDoc: 30 },
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    create: ({ req }) => hasRole(req, 'admin', 'editor'),
    update: ({ req }) => hasRole(req, 'admin', 'editor'),
    // Culturas são referenciadas por produtos e pela home: só admin exclui.
    delete: ({ req }) => hasRole(req, 'admin'),
  },
  hooks: { afterChange: [revalidate], afterDelete: [revalidateOnDelete] },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Endereço: /culturas/<slug>.' },
      validate: (value: unknown) =>
        typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
          ? true
          : 'Use só letras minúsculas, números e hífen.',
    },
    {
      name: 'ordem',
      type: 'number',
      defaultValue: 100,
      admin: { position: 'sidebar', description: 'Menor aparece primeiro na grade e na home.' },
    },
    tabs,
  ],
}
