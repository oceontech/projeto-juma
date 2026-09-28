import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Mídia', plural: 'Mídia' },
  admin: {
    group: 'Biblioteca',
    hideAPIURL: true,
    description: 'Imagens e arquivos usados pelos sites. O texto alternativo é obrigatório.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
