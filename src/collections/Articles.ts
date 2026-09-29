import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from 'payload'

import { hasRole } from '../access/roles'
import { ARTICLE_CATEGORIES, ARTICLE_COLORS } from '../features/articles/options'
import { revalidateSite } from '../features/cms/revalidate'

/** Minutos de leitura a partir do texto (≈ 200 palavras por minuto). */
function readingMinutes(data: Record<string, unknown>): number {
  const secoes = (data.secoes as { titulo?: string; paragrafos?: string }[] | undefined) ?? []
  const texto = [data.introducao, data.citacao, ...secoes.flatMap((s) => [s.titulo, s.paragrafos])]
    .filter((v): v is string => typeof v === 'string')
    .join(' ')
  const palavras = texto.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(palavras / 200))
}

const revalidate: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  revalidateSite([
    '/',
    '/materias',
    `/materias/${doc.slug}`,
    previousDoc?.slug ? `/materias/${previousDoc.slug}` : null,
  ])
  return doc
}
const revalidateOnDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateSite(['/', '/materias', `/materias/${doc.slug}`])
  return doc
}

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Matéria', plural: 'Blog' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'categoria', 'data', '_status', 'destaque', 'destaqueHome'],
    group: 'Conteúdo',
    description:
      'Matérias do blog do site Brasil. Edite em cada idioma pelo seletor "Idioma" no topo.',
    listSearchableFields: ['titulo', 'slug'],
    hideAPIURL: true,
    pagination: { defaultLimit: 24 },
    components: {
      views: { list: { Component: '/components/admin/content/ContentGrid#ContentGrid' } },
    },
  },
  defaultSort: '-data',
  // Rascunho salvo por botão, sem autosave: abrir "Novo" e desistir não cria rascunho vazio.
  versions: { drafts: true, maxPerDoc: 30 },
  access: {
    // O site só enxerga o que está publicado; o painel vê rascunhos.
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    create: ({ req }) => hasRole(req, 'admin', 'editor'),
    update: ({ req }) => hasRole(req, 'admin', 'editor'),
    delete: ({ req }) => hasRole(req, 'admin', 'editor'),
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data && !data.tempoLeituraManual) data.tempoLeitura = readingMinutes(data)
        return data
      },
    ],
    afterChange: [revalidate],
    afterDelete: [revalidateOnDelete],
  },
  fields: [
    // --- barra lateral
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Endereço: /materias/<slug>. Só letras minúsculas, números e hífen.',
      },
      validate: (value: unknown) =>
        typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
          ? true
          : 'Use só letras minúsculas, números e hífen (ex.: nutricao-fase-certa).',
    },
    {
      name: 'categoria',
      type: 'select',
      required: true,
      options: ARTICLE_CATEGORIES.map((c) => ({ label: c.label, value: c.value })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'data',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        components: { Field: '/components/admin/fields/DateField#DateField' },
      },
    },
    {
      name: 'destaque',
      label: 'Destaque na página de matérias',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
        description: 'A mais recente marcada aparece no bloco grande do topo.',
      },
    },
    {
      name: 'destaqueHome',
      label: 'Mostrar na home',
      type: 'checkbox',
      admin: { position: 'sidebar', description: 'A home mostra as 3 mais recentes marcadas.' },
    },
    {
      name: 'tempoLeitura',
      label: 'Tempo de leitura (min)',
      type: 'number',
      min: 1,
      admin: {
        position: 'sidebar',
        description: 'Calculado pelo texto. Marque a opção abaixo para definir à mão.',
      },
    },
    {
      name: 'tempoLeituraManual',
      label: 'Definir tempo de leitura à mão',
      type: 'checkbox',
      admin: { position: 'sidebar' },
    },

    // --- conteúdo
    { name: 'titulo', label: 'Título', type: 'text', required: true, localized: true },
    {
      name: 'subtitulo',
      label: 'Subtítulo',
      type: 'textarea',
      localized: true,
      admin: { description: 'Aparece abaixo do título e como descrição no Google.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'capa',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: { width: '60%' },
        },
        {
          name: 'cor',
          label: 'Cor de fundo da capa',
          type: 'select',
          defaultValue: ARTICLE_COLORS[0].value,
          options: ARTICLE_COLORS.map((c) => ({ label: c.label, value: c.value })),
          admin: { width: '40%', description: 'Aparece enquanto a foto carrega.' },
        },
      ],
    },
    {
      name: 'assinatura',
      label: 'Autor',
      type: 'text',
      localized: true,
      admin: { description: 'Como aparece na matéria. Ex.: Eng. Agrônomo Marcos Silva' },
    },
    { name: 'introducao', label: 'Introdução', type: 'textarea', localized: true },
    {
      name: 'secoes',
      label: 'Seções',
      type: 'array',
      localized: true,
      labels: { singular: 'Seção', plural: 'Seções' },
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: {
            path: '/components/admin/fields/RowLabel#RowLabel',
            clientProps: { fields: ['titulo'], fallback: 'Seção' },
          },
        },
      },
      fields: [
        { name: 'titulo', label: 'Título da seção', type: 'text' },
        {
          name: 'paragrafos',
          label: 'Texto',
          type: 'textarea',
          required: true,
          admin: { description: 'Deixe uma linha em branco entre os parágrafos.', rows: 8 },
        },
      ],
    },
    {
      name: 'citacao',
      label: 'Citação em destaque',
      type: 'textarea',
      localized: true,
    },
  ],
}
