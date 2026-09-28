import { addDataAndFileToRequest, type CollectionConfig, type PayloadRequest } from 'payload'

import { bySite, hasRole, isAdmin } from '../access/roles'
import {
  LEAD_FORMS,
  ingestLead,
  type LeadInput,
  type LeadMeta,
} from '../features/leads/server/ingest'

/**
 * Comparação em tempo constante. Sem `crypto` de propósito: o CLI do Payload
 * (tsx) não resolve `node:crypto` ao carregar a config no Windows.
 */
function sameSecret(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** Chave do site americano para `POST /api/leads/intake` (server-to-server). */
function intakeSite(req: PayloadRequest): 'us' | null {
  const sent = req.headers.get('x-leads-key') ?? ''
  const expected = process.env.LEADS_INTAKE_KEY_US ?? ''
  if (!expected) return null
  return sameSecret(sent, expected) ? 'us' : null
}

export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Lead', plural: 'Leads' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'site', 'status', 'formulario', 'contexto.produto', 'createdAt'],
    listSearchableFields: ['nome', 'email', 'telefone', 'empresa'],
    group: 'Operação',
    description: 'Contatos que chegaram pelos sites. Mude o status conforme o atendimento avança.',
    hideAPIURL: true,
    pagination: { defaultLimit: 20 },
    components: { views: { list: { Component: '/components/admin/leads/LeadsInbox#LeadsInbox' } } },
  },
  defaultSort: '-createdAt',
  access: {
    // O site grava pela Local API (server action) e o EUA pelo endpoint com chave.
    // Pelo painel, admin e comercial podem registrar um contato feito por telefone.
    create: ({ req }) => hasRole(req, 'admin', 'comercial'),
    read: ({ req }) => bySite(req, 'admin', 'editor', 'comercial'),
    update: ({ req }) => bySite(req, 'admin', 'comercial'),
    delete: isAdmin,
  },
  endpoints: [
    {
      path: '/intake',
      method: 'post',
      handler: async (req) => {
        const site = intakeSite(req)
        if (!site) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })

        await addDataAndFileToRequest(req)
        const body = (req.data ?? {}) as { lead?: LeadInput; meta?: LeadMeta }
        if (!body.lead) return Response.json({ ok: false, error: 'invalid' }, { status: 400 })

        const result = await ingestLead(req.payload, site, body.lead, body.meta ?? {})
        const status = result.ok ? 201 : result.error === 'server' ? 500 : 400
        return Response.json(result, { status })
      },
    },
  ],
  fields: [
    // --- barra lateral: o que o comercial mexe no dia a dia
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'novo',
      options: [
        { label: 'Novo', value: 'novo' },
        { label: 'Em contato', value: 'em-contato' },
        { label: 'Qualificado', value: 'qualificado' },
        { label: 'Convertido', value: 'convertido' },
        { label: 'Descartado', value: 'descartado' },
      ],
      admin: {
        position: 'sidebar',
        components: { Field: '/components/admin/fields/LeadFields#LeadStatusField' },
      },
    },
    {
      name: 'responsavel',
      label: 'Responsável',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', allowCreate: false },
    },
    {
      name: 'site',
      type: 'select',
      required: true,
      options: [
        { label: 'Brasil', value: 'br' },
        { label: 'Estados Unidos', value: 'us' },
      ],
      access: { update: () => false },
      admin: {
        position: 'sidebar',
        components: { Field: '/components/admin/fields/LeadFields#LeadSiteField' },
      },
    },
    {
      name: 'formulario',
      label: 'Formulário',
      type: 'select',
      options: [
        { label: 'Pop-up do WhatsApp', value: LEAD_FORMS[0] },
        { label: 'Página de contato', value: LEAD_FORMS[1] },
        { label: 'Trial (completo)', value: LEAD_FORMS[2] },
        { label: 'Trial (compacto)', value: LEAD_FORMS[3] },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
        components: { Field: '/components/admin/fields/LeadFields#LeadFormField' },
      },
    },
    {
      name: 'duplicadoDe',
      label: 'Repetição de',
      type: 'relationship',
      relationTo: 'leads',
      admin: {
        position: 'sidebar',
        readOnly: true,
        components: { Field: '/components/admin/fields/ReadOnlyFields#DuplicateOfField' },
      },
    },

    // --- contato
    {
      type: 'row',
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'empresa', label: 'Empresa / fazenda', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', index: true },
        {
          name: 'telefone',
          type: 'text',
          index: true,
          admin: { description: 'Só dígitos, com DDI/DDD quando informado.' },
        },
      ],
    },
    { name: 'mensagem', type: 'textarea' },
    {
      name: 'contexto',
      type: 'group',
      admin: { description: 'De onde veio o interesse: a página em que o contato clicou.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'produto', type: 'text' },
            { name: 'cultura', type: 'text' },
            { name: 'detalhe', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'dados',
      label: 'Campos do formulário',
      type: 'json',
      admin: {
        readOnly: true,
        components: { Field: '/components/admin/fields/ReadOnlyFields#FormAnswersField' },
      },
    },

    // --- notas internas
    {
      name: 'notas',
      label: 'Notas internas',
      type: 'array',
      labels: { singular: 'Nota', plural: 'Notas' },
      admin: {
        components: {
          RowLabel: {
            path: '/components/admin/fields/RowLabel#RowLabel',
            clientProps: { fields: ['texto'], fallback: 'Nota' },
          },
        },
      },
      fields: [
        { name: 'texto', type: 'textarea', required: true },
        {
          type: 'row',
          fields: [
            {
              name: 'autor',
              type: 'relationship',
              relationTo: 'users',
              admin: { readOnly: true },
              hooks: { beforeChange: [({ value, req }) => value ?? req.user?.id] },
            },
            {
              name: 'data',
              type: 'date',
              admin: {
                readOnly: true,
                components: { Field: '/components/admin/fields/DateField#DateField' },
              },
              hooks: { beforeChange: [({ value }) => value ?? new Date().toISOString()] },
            },
          ],
        },
      ],
    },

    // --- origem e rastreamento (somente leitura)
    {
      type: 'collapsible',
      label: 'Origem e rastreamento',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'pagina', label: 'Página', type: 'text', admin: { readOnly: true } },
            { name: 'locale', label: 'Idioma', type: 'text', admin: { readOnly: true } },
            { name: 'variante', label: 'Variante A/B', type: 'text', admin: { readOnly: true } },
          ],
        },
        {
          name: 'rastreamento',
          type: 'group',
          admin: {
            readOnly: true,
            description: 'Último toque antes do contato. O primeiro toque fica no JSON abaixo.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'utmSource', label: 'utm_source', type: 'text' },
                { name: 'utmMedium', label: 'utm_medium', type: 'text' },
                { name: 'utmCampaign', label: 'utm_campaign', type: 'text' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'utmTerm', label: 'utm_term', type: 'text' },
                { name: 'utmContent', label: 'utm_content', type: 'text' },
                { name: 'gclid', type: 'text' },
                { name: 'fbclid', type: 'text' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'referrer', type: 'text' },
                { name: 'landing', label: 'Página de entrada', type: 'text' },
              ],
            },
            { name: 'primeiroToque', label: 'Primeiro toque', type: 'json' },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'dispositivo',
              type: 'group',
              admin: { readOnly: true },
              fields: [
                { name: 'tipo', type: 'text' },
                { name: 'navegador', type: 'text' },
              ],
            },
            {
              name: 'geo',
              label: 'Localização aproximada',
              type: 'group',
              admin: { readOnly: true },
              fields: [
                { name: 'pais', label: 'País', type: 'text' },
                { name: 'regiao', label: 'Estado / região', type: 'text' },
                { name: 'cidade', type: 'text' },
              ],
            },
          ],
        },
        {
          name: 'consentimento',
          type: 'group',
          admin: { readOnly: true },
          fields: [
            { name: 'texto', type: 'textarea' },
            {
              name: 'data',
              type: 'date',
              admin: { components: { Field: '/components/admin/fields/DateField#DateField' } },
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
