import type { CollectionConfig } from 'payload'

export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Lead', plural: 'Leads' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'telefone', 'email', 'contexto', 'createdAt'],
    group: 'Site',
  },
  access: {
    // Qualquer visitante pode criar um lead (pop-up do WhatsApp);
    // só usuários do painel leem/editam.
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'nome', type: 'text', required: true },
    { name: 'email', type: 'email' },
    { name: 'telefone', type: 'text', required: true },
    { name: 'origem', type: 'text', admin: { description: 'Página de onde o lead clicou' } },
    {
      name: 'contexto',
      type: 'text',
      admin: { description: 'Produto ou cultura associado ao clique' },
    },
  ],
  timestamps: true,
}
