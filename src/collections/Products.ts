import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  Field,
  Payload,
} from 'payload'

import { hasRole } from '../access/roles'
import { revalidateSite } from '../features/cms/revalidate'
import {
  PRODUCT_CATEGORIES,
  PRODUCT_FILTER_CROPS,
  PRODUCT_SIZES,
  PROBLEM_ICONS,
} from '../features/products/options'

// Um produto aparece na própria página, no catálogo e nos "relacionados" de
// outros produtos: publicar regera o catálogo e as páginas de todos os produtos.
async function revalidateProducts(payload: Payload, extraSlug?: string) {
  const { docs } = await payload.find({
    collection: 'products',
    limit: 500,
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })
  const slugs = new Set([...docs.map((d) => d.slug), ...(extraSlug ? [extraSlug] : [])])
  revalidateSite(['/produtos', ...[...slugs].map((slug) => `/produtos/${slug}`)])
}
const revalidate: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  await revalidateProducts(req.payload, previousDoc?.slug)
  return doc
}
const revalidateOnDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await revalidateProducts(req.payload, doc.slug)
  return doc
}

const hexColor = (value: unknown) =>
  value == null || value === '' || (typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value))
    ? true
    : 'Use o formato #RRGGBB (ex.: #659357).'

const oneLine = { description: 'Uma por linha.' }

const tabs: Field = {
  type: 'tabs',
  tabs: [
    {
      label: 'Página',
      fields: [
        { name: 'nome', type: 'text', required: true, localized: true },
        {
          name: 'tag',
          label: 'Categoria exibida',
          type: 'text',
          localized: true,
          admin: { description: 'Pílula acima do nome. Ex.: Nutrição e Fisiologia Vegetal' },
        },
        { name: 'descricao', label: 'Descrição', type: 'textarea', localized: true },
        {
          name: 'frasco',
          label: 'Foto do frasco',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Imagem quadrada com fundo transparente ou claro.' },
        },
      ],
    },
    {
      label: 'Culturas',
      fields: [
        {
          name: 'culturasRotulo',
          label: 'Culturas do rótulo',
          type: 'textarea',
          localized: true,
          admin: { ...oneLine, rows: 10 },
        },
        {
          name: 'gruposCulturas',
          label: 'Culturas agrupadas por forma de aplicação (opcional)',
          type: 'array',
          labels: { singular: 'Grupo', plural: 'Grupos' },
          admin: {
            components: {
              RowLabel: {
                path: '/components/admin/fields/RowLabel#RowLabel',
                clientProps: { fields: ['rotulo'], fallback: 'Grupo' },
              },
            },
            initCollapsed: true,
            description:
              'Use quando o rótulo autoriza a cultura só em foliar ou só em TS. Substitui a lista acima.',
          },
          fields: [
            { name: 'rotulo', label: 'Grupo', type: 'text', localized: true },
            { name: 'culturas', type: 'textarea', localized: true, admin: oneLine },
          ],
        },
        {
          name: 'notaCulturas',
          label: 'Nota no lugar das culturas (opcional)',
          type: 'textarea',
          localized: true,
          admin: {
            description:
              'Ex.: adjuvante dosado por volume de calda. Substitui a lista de culturas.',
          },
        },
      ],
    },
    {
      label: 'Problemas e benefícios',
      fields: [
        {
          name: 'problemas',
          type: 'array',
          labels: { singular: 'Problema', plural: 'Problemas' },
          admin: {
            components: {
              RowLabel: {
                path: '/components/admin/fields/RowLabel#RowLabel',
                clientProps: { fields: ['titulo'], fallback: 'Problema' },
              },
            },
            initCollapsed: true,
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'icone',
                  label: 'Ícone',
                  type: 'select',
                  required: true,
                  defaultValue: 'leaf',
                  options: [...PROBLEM_ICONS],
                  admin: { width: '25%' },
                },
                {
                  name: 'titulo',
                  label: 'Título',
                  type: 'text',
                  localized: true,
                  admin: { width: '75%' },
                },
              ],
            },
            { name: 'descricao', label: 'Descrição', type: 'textarea', localized: true },
          ],
        },
        {
          name: 'listaBeneficios',
          label: 'Benefícios',
          type: 'array',
          labels: { singular: 'Benefício', plural: 'Benefícios' },
          admin: {
            components: {
              RowLabel: {
                path: '/components/admin/fields/RowLabel#RowLabel',
                clientProps: { fields: ['titulo'], fallback: 'Benefício' },
              },
            },
            initCollapsed: true,
          },
          fields: [
            { name: 'titulo', label: 'Título', type: 'text', localized: true },
            { name: 'descricao', label: 'Descrição', type: 'textarea', localized: true },
          ],
        },
      ],
    },
    {
      label: 'Aplicação',
      fields: [
        {
          name: 'aplicacoes',
          label: 'Tabelas de aplicação',
          type: 'array',
          labels: { singular: 'Tabela', plural: 'Tabelas' },
          admin: {
            components: {
              RowLabel: {
                path: '/components/admin/fields/RowLabel#RowLabel',
                clientProps: { fields: ['rotulo'], fallback: 'Tabela' },
              },
            },
            initCollapsed: true,
            description: 'Texto literal do rótulo. Uma tabela por forma de aplicação.',
          },
          fields: [
            { name: 'rotulo', label: 'Forma de aplicação', type: 'text', localized: true },
            { name: 'nota', type: 'textarea', localized: true },
            {
              name: 'linhas',
              type: 'array',
              labels: { singular: 'Linha', plural: 'Linhas' },
              admin: {
                components: {
                  RowLabel: {
                    path: '/components/admin/fields/RowLabel#RowLabel',
                    clientProps: { fields: ['cultura', 'quando'], fallback: 'Linha' },
                  },
                },
                initCollapsed: true,
              },
              fields: [
                { name: 'cultura', type: 'text', localized: true },
                { name: 'quando', label: 'Quando / como', type: 'textarea', localized: true },
              ],
            },
          ],
        },
        {
          name: 'notaAplicacoes',
          label: 'Nota abaixo das tabelas (opcional)',
          type: 'textarea',
          localized: true,
        },
      ],
    },
    {
      label: 'Resultados',
      fields: [
        {
          name: 'listaResultados',
          label: 'Resultados',
          type: 'array',
          labels: { singular: 'Resultado', plural: 'Resultados' },
          admin: {
            components: {
              RowLabel: {
                path: '/components/admin/fields/RowLabel#RowLabel',
                clientProps: { fields: ['valor', 'unidade'], fallback: 'Resultado' },
              },
            },
            initCollapsed: true,
            description: 'Todo número precisa vir com a fonte do ensaio na descrição.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'valor',
                  type: 'text',
                  localized: true,
                  admin: { width: '50%', description: 'Ex.: +13,4' },
                },
                {
                  name: 'unidade',
                  type: 'text',
                  localized: true,
                  admin: { width: '50%', description: 'Ex.: sc/ha' },
                },
              ],
            },
            {
              name: 'descricao',
              label: 'Descrição com a fonte',
              type: 'textarea',
              localized: true,
              validate: (value: unknown) =>
                !value || /fonte|source|fuente/i.test(String(value))
                  ? true
                  : 'Inclua a fonte do ensaio (ex.: "Fonte: ensaio DETEC, Taquarivaí/SP").',
            },
          ],
        },
      ],
    },
    {
      label: 'Galeria e relacionados',
      fields: [
        {
          name: 'galeria',
          type: 'upload',
          relationTo: 'media',
          hasMany: true,
          admin: { description: 'Quatro fotos: a 1ª fica grande e a 4ª larga.' },
        },
        {
          name: 'relacionados',
          type: 'array',
          labels: { singular: 'Produto relacionado', plural: 'Produtos relacionados' },
          admin: { initCollapsed: true },
          fields: [
            { name: 'produto', type: 'relationship', relationTo: 'products', required: true },
            { name: 'tag', label: 'Etiqueta', type: 'text', localized: true },
            { name: 'descricao', label: 'Chamada', type: 'text', localized: true },
          ],
        },
      ],
    },
    {
      label: 'Card do catálogo',
      fields: [
        { name: 'tagCatalogo', label: 'Etiqueta no catálogo', type: 'text', localized: true },
        { name: 'resumoCatalogo', label: 'Resumo no catálogo', type: 'textarea', localized: true },
      ],
    },
  ],
}

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Produto', plural: 'Produtos' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'categoria', 'ordem', '_status'],
    group: 'Conteúdo',
    description: 'Produtos do site Brasil. Textos em cada idioma pelo seletor "Idioma" no topo.',
    hideAPIURL: true,
    pagination: { defaultLimit: 24 },
    components: {
      views: { list: { Component: '/components/admin/content/ContentGrid#ContentGrid' } },
    },
    listSearchableFields: ['nome', 'slug'],
  },
  defaultSort: 'ordem',
  // Rascunho salvo por botão, sem autosave: abrir "Novo" e desistir não cria rascunho vazio.
  versions: { drafts: true, maxPerDoc: 30 },
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    create: ({ req }) => hasRole(req, 'admin', 'editor'),
    update: ({ req }) => hasRole(req, 'admin', 'editor'),
    delete: ({ req }) => hasRole(req, 'admin', 'editor'),
  },
  hooks: { afterChange: [revalidate], afterDelete: [revalidateOnDelete] },
  fields: [
    // --- barra lateral
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Endereço: /produtos/<slug>.' },
      validate: (value: unknown) =>
        typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
          ? true
          : 'Use só letras minúsculas, números e hífen.',
    },
    {
      name: 'categoria',
      type: 'select',
      required: true,
      options: [...PRODUCT_CATEGORIES],
      admin: { position: 'sidebar', description: 'Filtro do catálogo.' },
    },
    {
      name: 'culturasFiltro',
      label: 'Culturas no filtro do catálogo',
      type: 'select',
      hasMany: true,
      options: [...PRODUCT_FILTER_CROPS],
      admin: { position: 'sidebar' },
    },
    {
      name: 'embalagens',
      type: 'select',
      hasMany: true,
      options: PRODUCT_SIZES.map((s) => ({ label: s, value: s })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'corRotulo',
      label: 'Cor do rótulo',
      type: 'text',
      required: true,
      validate: hexColor,
      admin: {
        position: 'sidebar',
        description: 'Pílulas e destaques da página. Formato #RRGGBB.',
      },
    },
    {
      name: 'corCard',
      label: 'Cor do card no catálogo',
      type: 'text',
      validate: hexColor,
      admin: { position: 'sidebar', description: 'Vazio = cor do rótulo.' },
    },
    {
      name: 'ordem',
      type: 'number',
      defaultValue: 100,
      admin: { position: 'sidebar', description: 'Menor aparece primeiro no catálogo.' },
    },
    tabs,
  ],
}
