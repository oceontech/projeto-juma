import type { CollectionConfig } from 'payload'

export const CalculatorData: CollectionConfig = {
  slug: 'calculator-data',
  labels: { singular: 'Dado da calculadora', plural: 'Calculadora' },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['produto', 'cultura', 'ganhoMedio', 'fonteDado'],
    group: 'Catálogo',
  },
  access: { read: () => true },
  fields: [
    { name: 'produto', type: 'relationship', relationTo: 'products', required: true },
    { name: 'cultura', type: 'relationship', relationTo: 'cultures', required: true },
    { name: 'dosagem', type: 'text', admin: { description: 'Ex: 0,5 L/ha' } },
    {
      name: 'ganhoMedio',
      type: 'number',
      required: true,
      admin: { description: 'Ganho médio do ensaio (na unidade abaixo)' },
    },
    { name: 'unidade', type: 'text', defaultValue: 'sc/ha' },
    { name: 'fonteDado', type: 'text', admin: { description: 'Ex: ensaio DETEC 2023' } },
  ],
}
