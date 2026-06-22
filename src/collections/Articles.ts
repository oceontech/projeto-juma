import type { CollectionConfig } from 'payload'

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Matéria', plural: 'Matérias' },
  admin: { useAsTitle: 'titulo', defaultColumns: ['titulo', 'autor', 'data'], group: 'Site' },
  access: { read: () => true },
  fields: [
    { name: 'titulo', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'capa', type: 'upload', relationTo: 'media' },
    {
      type: 'row',
      fields: [
        { name: 'autor', type: 'text', admin: { width: '50%' } },
        { name: 'data', type: 'date', admin: { width: '50%' } },
      ],
    },
    { name: 'conteudo', type: 'richText', localized: true },
    {
      name: 'tags',
      type: 'array',
      labels: { singular: 'Tag', plural: 'Tags' },
      fields: [{ name: 'tag', type: 'text' }],
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },
  ],
}
