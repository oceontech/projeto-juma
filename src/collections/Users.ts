import type { CollectionConfig } from 'payload'

import { ROLES, SITES, hasRole, isAdmin, isAdminField } from '../access/roles'
import { forgotPasswordContent, sendInvite } from '../features/email/send'
import { inviteHandler } from '../features/email/inviteEndpoint'

const idOf = (v: unknown) => (typeof v === 'object' && v ? ((v as { id?: number | string }).id ?? null) : ((v as number | string | null | undefined) ?? null))

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuário', plural: 'Usuários' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'email', 'papel', 'sites'],
    group: 'Biblioteca',
    hideAPIURL: true,
    components: { views: { list: { Component: '/components/admin/users/UsersList#UsersList' } } },
  },
  auth: {
    // Bloqueia a conta por 10 minutos após 5 senhas erradas seguidas.
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    // Sessão de 7 dias; o painel renova enquanto estiver em uso.
    tokenExpiration: 60 * 60 * 24 * 7,
    // "Esqueci a senha" pelo Resend. O link vale 1 hora (padrão do Payload);
    // não fixar `expiration` aqui, senão o convite (7 dias) herda esse prazo.
    forgotPassword: {
      generateEmailSubject: (args) => forgotPasswordContent(args ?? {}).subject,
      generateEmailHTML: (args) => forgotPasswordContent(args ?? {}).html,
    },
  },
  // Convite pelo painel: cria a pessoa sem senha e manda o link para ela criar a dela.
  endpoints: [{ path: '/invite', method: 'post', handler: inviteHandler }],
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
    afterLogin: [
      // "Entrou há 2 dias" na lista da equipe.
      async ({ req, user }) => {
        await req.payload.update({
          collection: 'users',
          id: user.id,
          data: { ultimoAcesso: new Date().toISOString() },
          overrideAccess: true,
          req,
          context: { ultimoAcesso: true },
        })
      },
    ],
    afterChange: [
      // Admin cadastrou alguém pelo formulário padrão: a pessoa recebe o convite
      // para criar a própria senha. O endpoint /invite manda o dele (context.invite).
      async ({ req, doc, operation }) => {
        if (operation !== 'create' || req.context?.invite === false || !hasRole(req, 'admin')) return doc
        await sendInvite({ payload: req.payload, req, user: doc, invitedBy: req.user }).catch((err) =>
          req.payload.logger.error({ err, msg: `Falha ao enviar convite para ${doc.email}` }),
        )
        return doc
      },
      // Trocou ou tirou a foto: a antiga sai do armazenamento.
      async ({ req, doc, previousDoc }) => {
        const before = idOf(previousDoc?.foto)
        if (before && before !== idOf(doc.foto)) {
          await req.payload.delete({ collection: 'avatars', id: before, overrideAccess: true, req }).catch(() => null)
        }
        return doc
      },
    ],
    beforeChange: [
      // Guarda o endereço da foto no usuário: a sidebar e o cabeçalho leem
      // o usuário logado sem buscar a foto de novo.
      async ({ req, data, originalDoc }) => {
        if (!data || !('foto' in data) || idOf(data.foto) === idOf(originalDoc?.foto)) return data
        const id = idOf(data.foto)
        if (!id) return { ...data, fotoUrl: null }
        const photo = await req.payload.findByID({ collection: 'avatars', id, depth: 0, overrideAccess: true, req }).catch(() => null)
        return { ...data, fotoUrl: photo ? (photo.sizes?.thumb?.url ?? photo.url ?? null) : null }
      },
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
    // Foto, nome e cargo são editados juntos no cartão de perfil.
    {
      name: 'foto',
      label: 'Foto',
      type: 'upload',
      relationTo: 'avatars',
      admin: { components: { Field: '/components/admin/users/ProfileCard#ProfileCard' } },
    },
    { name: 'nome', label: 'Nome', type: 'text', admin: { hidden: true } },
    { name: 'cargo', label: 'Cargo ou área', type: 'text', admin: { hidden: true } },
    { name: 'fotoUrl', type: 'text', admin: { hidden: true, readOnly: true } },
    { name: 'ultimoAcesso', label: 'Último acesso', type: 'date', admin: { hidden: true, readOnly: true } },
    {
      name: 'papel',
      label: 'Perfil',
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
      // Perfil e sites num cartão só (quem faz o quê e onde).
      admin: { components: { Field: '/components/admin/users/AccessCard#AccessCard' } },
    },
    {
      name: 'sites',
      label: 'Sites',
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
      admin: { hidden: true },
    },
  ],
}
