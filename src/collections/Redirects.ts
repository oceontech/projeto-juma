import type { CollectionAfterChangeHook, CollectionConfig, CollectionSlug, Payload } from 'payload'

import { hasRole } from '../access/roles'

/**
 * Redirecionamentos do site Brasil: link antigo → página atual. O middleware
 * lê a lista (`GET /api/redirects/mapa`) e guarda por 1 minuto.
 * Trocar o endereço de matéria, produto ou cultura publicados cria um aqui.
 */

/**
 * "/Produtos/Velho/?x=1" → "/produtos/velho". O "de" é comparado em
 * minúsculas; o "para" mantém maiúsculas (o idioma é "/pt-BR").
 */
export function normalizePath(input: string, lower = true) {
  let p = input.trim()
  try {
    if (/^https?:\/\//i.test(p)) p = new URL(p).pathname
  } catch {
    // mantém como veio
  }
  p = p.split(/[?#]/)[0]
  if (!p.startsWith('/')) p = `/${p}`
  p = p.replace(/\/{2,}/g, '/')
  if (p.length > 1) p = p.replace(/\/$/, '')
  try {
    p = decodeURI(p)
  } catch {
    // mantém
  }
  return lower ? p.toLowerCase() : p
}

/** Cria (ou atualiza) o redirecionamento de um endereço que mudou. */
export async function redirectMovedPath(payload: Payload, from: string, to: string) {
  const de = normalizePath(from)
  const para = normalizePath(to, false)
  if (de === para) return
  try {
    // Quem apontava para o endereço antigo passa a apontar direto para o novo.
    await payload.update({ collection: 'redirects', where: { para: { equals: de } }, data: { para }, overrideAccess: true })
    const existing = await payload.find({ collection: 'redirects', where: { de: { equals: de } }, limit: 1, overrideAccess: true })
    if (existing.docs[0]) {
      await payload.update({ collection: 'redirects', id: existing.docs[0].id, data: { para, ativo: true }, overrideAccess: true })
    } else {
      await payload.create({
        collection: 'redirects',
        data: { de, para, permanente: true, ativo: true, observacao: 'Criado automaticamente: o endereço da página mudou.' },
        overrideAccess: true,
      })
    }
    // Um redirecionamento do endereço novo para ele mesmo viraria laço.
    await payload.delete({ collection: 'redirects', where: { de: { equals: para } }, overrideAccess: true })
  } catch (err) {
    payload.logger.error({ err }, 'Falha ao criar redirecionamento automático')
  }
}

/**
 * Ao publicar, todo endereço antigo que esta página já teve publicado passa a
 * levar ao atual. Olha o histórico porque a troca pode ter sido salva como
 * rascunho antes de publicar.
 */
export function redirectOldSlugs(collection: CollectionSlug, prefix: string): CollectionAfterChangeHook {
  return async ({ doc, req }) => {
    if (doc._status !== 'published' || !doc.slug) return doc
    try {
      const { docs } = await req.payload.findVersions({
        collection,
        where: {
          and: [
            { parent: { equals: doc.id } },
            { 'version._status': { equals: 'published' } },
            { 'version.slug': { not_equals: doc.slug } },
          ],
        },
        limit: 30,
        depth: 0,
        overrideAccess: true,
      })
      const old = new Set(docs.map((v) => (v.version as { slug?: string }).slug).filter(Boolean) as string[])
      for (const slug of old) await redirectMovedPath(req.payload, `${prefix}/${slug}`, `${prefix}/${doc.slug}`)
    } catch (err) {
      req.payload.logger.error({ err }, 'Falha ao verificar endereços antigos')
    }
    return doc
  }
}

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  labels: { singular: 'Redirecionamento', plural: 'Redirecionamentos' },
  admin: {
    useAsTitle: 'de',
    defaultColumns: ['de', 'para', 'permanente', 'ativo', 'updatedAt'],
    listSearchableFields: ['de', 'para'],
    group: 'Site',
    description:
      'Quem abrir o endereço antigo vai direto para o novo. Use para links do site antigo, materiais impressos e páginas que mudaram de nome. Vale em até 1 minuto.',
    hideAPIURL: true,
    pagination: { defaultLimit: 50 },
  },
  access: {
    read: ({ req }) => hasRole(req, 'admin', 'editor'),
    create: ({ req }) => hasRole(req, 'admin', 'editor'),
    update: ({ req }) => hasRole(req, 'admin', 'editor'),
    delete: ({ req }) => hasRole(req, 'admin', 'editor'),
  },
  endpoints: [
    {
      // Público de propósito: é o que o middleware do site consulta.
      path: '/mapa',
      method: 'get',
      handler: async (req) => {
        const { docs } = await req.payload.find({
          collection: 'redirects',
          where: { ativo: { equals: true } },
          limit: 5000,
          pagination: false,
          depth: 0,
          overrideAccess: true,
        })
        const map = Object.fromEntries(docs.map((d) => [d.de, [d.para, d.permanente ? 308 : 307]]))
        return Response.json(map, { headers: { 'cache-control': 'public, s-maxage=60, stale-while-revalidate=300' } })
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.de) data.de = normalizePath(data.de)
        if (data?.para && !/^https?:\/\//i.test(data.para)) data.para = normalizePath(data.para, false)
        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'de',
          label: 'De (endereço antigo)',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          admin: { width: '50%', description: 'Ex.: /produtos/aminosan-antigo ou o link completo do site antigo.' },
          validate: (value: unknown) => {
            const v = normalizePath(String(value ?? ''))
            if (v === '/') return 'A página inicial não pode ser redirecionada.'
            if (/^\/(admin|api|_next)(\/|$)/.test(v)) return 'Esse endereço é do sistema e não pode ser redirecionado.'
            return true
          },
        },
        {
          name: 'para',
          label: 'Para (endereço novo)',
          type: 'text',
          required: true,
          admin: { width: '50%', description: 'Ex.: /pt-BR/produtos/aminosan. Pode ser um link de outro site (https://…).' },
          validate: (value: unknown, { siblingData }: { siblingData: { de?: string } }) => {
            const v = String(value ?? '').trim()
            if (!v) return 'Informe o endereço novo.'
            if (!/^https?:\/\//i.test(v) && normalizePath(v) === normalizePath(siblingData?.de ?? ''))
              return 'O endereço novo é igual ao antigo.'
            return true
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'permanente',
          label: 'Mudança definitiva',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            width: '50%',
            components: { Cell: { path: '/components/admin/fields/BoolCell#BoolCell', clientProps: { on: 'Definitiva', off: 'Temporária' } } },
            description: 'Ligado: o Google troca o link antigo pelo novo (use quase sempre). Desligado: desvio temporário.',
          },
        },
        {
          name: 'ativo',
          label: 'Ativo',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            width: '50%',
            description: 'Desligue para pausar sem apagar.',
            components: { Cell: { path: '/components/admin/fields/BoolCell#BoolCell', clientProps: { on: 'Ativo', off: 'Pausado' } } },
          },
        },
      ],
    },
    { name: 'observacao', label: 'Observação', type: 'text', admin: { description: 'Por que existe (opcional).' } },
  ],
}
