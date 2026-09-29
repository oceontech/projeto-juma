import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Mídia', plural: 'Mídia' },
  admin: {
    group: 'Biblioteca',
    hideAPIURL: true,
    description: 'Imagens e arquivos usados pelos sites. O texto alternativo é obrigatório.',
    pagination: { defaultLimit: 30 },
    components: { views: { list: { Component: '/components/admin/media/MediaGrid#MediaGrid' } } },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      label: 'Texto alternativo',
      type: 'text',
      required: true,
      admin: {
        description: 'O que a imagem mostra, em uma frase. Lido por leitores de tela e pelo Google. Ex.: "Lavoura de soja no estádio R1".',
      },
    },
  ],
  upload: true,
}
