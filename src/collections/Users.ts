import type { CollectionConfig } from 'payload'

import { ROLES, SITES, hasRole, isAdmin, isAdminField } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuário', plural: 'Usuários' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['nome', 'email', 'papel', 'sites'],
    group: 'Administração',
  },
  auth: {
    // Bloqueia a conta por 10 minutos após 5 senhas erradas seguidas.
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    // Sessão de 7 dias; o painel renova enquanto estiver em uso.
    tokenExpiration: 60 * 60 * 24 * 7,
  },
  access: {
    // O primeiro usuário se cria pela tela inicial do Payload; depois, só admin.
    create: async ({ req }) => {
      if (hasRole(req, 'admin')) return true
      const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
      return totalDocs === 0
    },
    read: ({ req }) => {
      if (hasRole(req, 'admin')) return true
      return req.user ? { id: { equals: req.user.id } } : false
    },
    update: ({ req }) => {
      if (hasRole(req, 'admin')) return true
      return req.user ? { id: { equals: req.user.id } } : false
    },
    delete: isAdmin,
    // Só quem tem papel entra no painel.
    admin: ({ req }) => Boolean((req.user as { papel?: string } | null)?.papel),
  },
  hooks: {
    beforeChange: [
      // O primeiro usuário do sistema nasce admin dos dois sites.
      async ({ req, operation, data }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
        if (totalDocs === 0) return { ...data, papel: 'admin', sites: [...SITES] }
        return data
      },
    ],
  },
  fields: [
    { name: 'nome', type: 'text' },
    {
      name: 'papel',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      options: [
        { label: 'Admin', value: ROLES[0] },
        { label: 'Editor', value: ROLES[1] },
        { label: 'Comercial', value: ROLES[2] },
      ],
      access: { create: isAdminField, update: isAdminField },
      admin: { description: 'Admin: tudo. Editor: conteúdo do Brasil. Comercial: trabalha os leads.' },
    },
    {
      name: 'sites',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['br'],
      saveToJWT: true,
      options: [
        { label: 'Brasil', value: 'br' },
        { label: 'Estados Unidos', value: 'us' },
      ],
      access: { create: isAdminField, update: isAdminField },
      admin: { description: 'Sites cujos leads e conteúdos este usuário enxerga.' },
    },
  ],
}
