import type { CollectionConfig } from 'payload'

export const Cultures: CollectionConfig = {
  slug: 'cultures',
  labels: { singular: 'Cultura', plural: 'Culturas' },
  admin: { useAsTitle: 'nome', defaultColumns: ['nome', 'slug'], group: 'Catálogo' },
  access: { read: () => true },
  fields: [
    { name: 'nome', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'nomeCientifico', type: 'text' },
    { name: 'foto', type: 'upload', relationTo: 'media' },
    { name: 'introducao', type: 'richText', localized: true },
    { name: 'comoAtua', type: 'richText', localized: true },
    {
      name: 'desafios',
      type: 'array',
      localized: true,
      labels: { singular: 'Desafio', plural: 'Desafios' },
      fields: [
        { name: 'titulo', type: 'text' },
        { name: 'descricao', type: 'text' },
      ],
    },
    {
      name: 'manejoPorFase',
      type: 'array',
      localized: true,
      labels: { singular: 'Fase', plural: 'Manejo por fase' },
      fields: [
        { name: 'fase', type: 'text' },
        { name: 'produtos', type: 'text', admin: { description: 'Produtos recomendados na fase' } },
      ],
    },
    { name: 'produtosRelacionados', type: 'relationship', relationTo: 'products', hasMany: true },
  ],
}
