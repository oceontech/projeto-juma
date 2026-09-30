import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  Field,
} from 'payload'

import { hasRole } from '../access/roles'
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

/** Revisão final com IA na etapa Publicação (components/admin/blog/AiAssist). */
const ai = (name: string): Field => ({
  name,
  type: 'ui',
  admin: { components: { Field: { path: '/components/admin/blog/AiAssist#AiAssist', clientProps: { site: 'br' } } } },
})

/** Rodapé de cada etapa do post ("← anterior · próxima →"). */
const step = (name: string, clientProps: { prev?: string; next?: string; last?: boolean }): Field => ({
  name,
  type: 'ui',
  admin: { components: { Field: { path: '/components/admin/fields/StepFooter#StepFooter', clientProps } } },
})

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Matéria', plural: 'Blog' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'tema', 'data', '_status', 'destaque'],
    group: 'Conteúdo',
    description: 'Matéria do blog do site Brasil, em 4 etapas. Traduza pelo seletor "Idioma do conteúdo" no topo.',
    listSearchableFields: ['titulo', 'slug'],
    hideAPIURL: true,
    pagination: { defaultLimit: 24 },
    components: {
      views: { list: { Component: '/components/admin/blog/BlogRedirect#BlogRedirect' } },
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
        // A IA estima na revisão final; sem ela, conta pelas palavras.
        if (data && !data.tempoLeitura) data.tempoLeitura = readingMinutes(data)
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
      admin: { position: 'sidebar', components: { Field: '/components/admin/blog/ArticlePreview#ArticlePreview' } },
    },
    {
      // Progresso e etapas do post (as abas do Payload ficam escondidas).
      name: 'passos',
      type: 'ui',
      admin: { components: { Field: { path: '/components/admin/blog/PostStepper#PostStepper', clientProps: { site: 'br' } } } },
    },
    {
      // Etapas do post: cada aba é uma etapa da barra de progresso.
      type: 'tabs',
      tabs: [
        {
          label: 'Assunto',
          description: 'Sobre o que é a matéria e quem assina. A IA sugere opções melhores na última etapa.',
          fields: [
            {
              name: 'titulo',
              label: 'Título',
              type: 'text',
              required: true,
              localized: true,
              admin: { description: 'Curto e direto. Ex.: Nutrição na fase certa: o que muda na soja' },
            },
            {
              name: 'subtitulo',
              label: 'Subtítulo',
              type: 'textarea',
              localized: true,
              admin: { rows: 2, description: 'Uma frase que complementa o título. Também é a descrição no Google.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'tema',
                  label: 'Categoria',
                  type: 'relationship',
                  relationTo: 'categorias',
                  required: true,
                  filterOptions: { site: { equals: 'br' } },
                  admin: {
                    width: '50%',
                    description: 'O assunto principal: vira etiqueta e filtro na página de matérias. Nenhuma serve? Crie uma no +.',
                  },
                },
                {
                  name: 'assinatura',
                  label: 'Autor',
                  type: 'text',
                  localized: true,
                  admin: { width: '50%', description: 'Como aparece na matéria. Ex.: Eng. Agrônomo Marcos Silva' },
                },
              ],
            },
            step('passo1', { next: 'Texto' }),
          ],
        },
        {
          label: 'Texto',
          description: 'Escreva ou cole o texto. Em cada caixa, a etiqueta ✨ IA corrige, organiza, aprimora ou aumenta.',
          fields: [
            {
              name: 'introducao',
              label: 'Introdução',
              type: 'textarea',
              localized: true,
              admin: { components: { Field: '/components/admin/blog/TextFields#IntroField' } },
            },
            {
              name: 'secoes',
              label: 'Seções',
              type: 'array',
              localized: true,
              labels: { singular: 'Seção', plural: 'Seções' },
              admin: { components: { Field: '/components/admin/blog/TextFields#SectionsField' } },
              fields: [
                { name: 'titulo', label: 'Título da seção', type: 'text' },
                { name: 'paragrafos', label: 'Texto', type: 'textarea', required: true },
              ],
            },
            {
              name: 'citacao',
              label: 'Citação em destaque',
              type: 'textarea',
              localized: true,
              admin: { rows: 2, description: 'Opcional. Uma frase forte do próprio texto, que aparece em destaque na página.' },
            },
            step('passo2', { prev: 'Assunto', next: 'Capa' }),
          ],
        },
        {
          label: 'Capa',
          description: 'A foto que abre a matéria e aparece nos cards do site. Envie, escolha da biblioteca ou crie com IA a partir do texto.',
          fields: [
            {
              name: 'capa',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: { components: { Field: { path: '/components/admin/blog/CoverField#CoverField', clientProps: { site: 'br' } } } },
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
              type: 'text',
              required: true,
              unique: true,
              index: true,
              admin: {
                components: {
                  Field: {
                    path: '/components/admin/fields/SlugField#SlugField',
                    clientProps: { source: 'titulo', prefix: 'juma-agro.com.br/materias/' },
                  },
                },
              },
              validate: (value: unknown) =>
                typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
                  ? true
                  : 'Use só letras minúsculas, números e hífen (ex.: nutricao-fase-certa).',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'data',
                  type: 'date',
                  required: true,
                  defaultValue: () => new Date().toISOString(),
                  admin: { width: '50%', components: { Field: '/components/admin/fields/DateField#DateField' } },
                },
                {
                  name: 'destaque',
                  label: 'Destaque na página de matérias',
                  type: 'checkbox',
                  admin: { width: '50%', description: 'A mais recente marcada aparece no bloco grande do topo. A home mostra sempre as 3 mais recentes.' },
                },
              ],
            },
            {
              // Só a IA preenche (revisão final); sem ela, o hook conta pelas palavras.
              name: 'tempoLeitura',
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
