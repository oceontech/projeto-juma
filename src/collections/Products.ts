import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Produto', plural: 'Produtos' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'linha', 'ordemCatalogo'],
    group: 'Catálogo',
  },
  access: { read: () => true },
  fields: [
    { name: 'nome', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'linha',
      type: 'select',
      required: true,
      options: [
        { label: 'Arranque inicial', value: 'arranque-inicial' },
        { label: 'Nutrição e fisiologia', value: 'nutricao-fisiologia' },
        { label: 'Proteção de cultivos', value: 'protecao-cultivos' },
        { label: 'Tecnologia de aplicação', value: 'tecnologia-aplicacao' },
        { label: 'Manejos integrados', value: 'manejos-integrados' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'corFundo',
          type: 'text',
          admin: { description: 'Cor de fundo do produto em hex, ex: #006838', width: '50%' },
        },
        {
          name: 'textoClaro',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'Texto branco sobre a cor de fundo', width: '50%' },
        },
      ],
    },
    {
      name: 'tamanhos',
      type: 'select',
      hasMany: true,
      options: [
        { label: '1L', value: '1l' },
        { label: '10L', value: '10l' },
        { label: '20L', value: '20l' },
      ],
    },
    { name: 'culturas', type: 'relationship', relationTo: 'cultures', hasMany: true },
    { name: 'descricaoCurta', type: 'textarea', localized: true },
    { name: 'descricaoCompleta', type: 'richText', localized: true },
    {
      name: 'beneficios',
      type: 'array',
      localized: true,
      labels: { singular: 'Benefício', plural: 'Benefícios' },
      fields: [{ name: 'texto', type: 'text' }],
    },
    { name: 'modoUso', type: 'richText', localized: true },
    {
      name: 'resultados',
      type: 'array',
      labels: { singular: 'Resultado', plural: 'Resultados' },
      fields: [
        { name: 'valor', type: 'text', admin: { description: 'Ex: +13,4 sc/ha' } },
        { name: 'fonte', type: 'text', admin: { description: 'Ex: ensaio DETEC' } },
        { name: 'cultura', type: 'text' },
      ],
    },
    { name: 'galeria', type: 'upload', relationTo: 'media', hasMany: true },
    {
      name: 'ordemCatalogo',
      type: 'number',
      admin: { description: 'Posição no scroll horizontal do catálogo' },
    },
    { name: 'destaqueHome', type: 'checkbox' },
  ],
}
