// @vitest-environment node
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { ingestLead } from '@/features/leads/server/ingest'

/**
 * Leads e papéis do painel. Este teste APAGA usuários e leads: só roda contra
 * um Postgres local, com as migrations aplicadas no início. Exemplo:
 *   docker run -d --name juma-pg -e POSTGRES_PASSWORD=juma -e POSTGRES_DB=juma -p 55432:5432 postgres:16-alpine
 *   PAYLOAD_DATABASE_URL=postgres://postgres:juma@localhost:55432/juma PAYLOAD_SECRET=teste npm run test:int
 */
const dbHost = (() => {
  try {
    return new URL(process.env.PAYLOAD_DATABASE_URL ?? '').hostname
  } catch {
    return ''
  }
})()
const isLocalDb = ['localhost', '127.0.0.1'].includes(dbHost)

let payload: Payload
const users: Record<'admin' | 'editorBr' | 'comercialUs', { id: number | string }> = {} as never

const base = {
  formulario: 'whatsapp' as const,
  nome: '  Maria Teste  ',
  email: 'Maria@Exemplo.com.br',
  telefone: '(19) 99999-0000',
  tempoMs: 5000,
}

describe.skipIf(!isLocalDb)('leads', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    // O schema só existe por migrations (push desligado).
    await payload.db.migrate()
    await payload.delete({ collection: 'leads', where: { id: { exists: true } }, overrideAccess: true })
    await payload.delete({ collection: 'users', where: { id: { exists: true } }, overrideAccess: true })

    users.admin = await payload.create({
      collection: 'users',
      data: { email: 'admin@teste.local', password: 'senha-teste-123' } as never,
      overrideAccess: true,
    })
    users.editorBr = await payload.create({
      collection: 'users',
      data: { email: 'editor@teste.local', password: 'senha-teste-123', papel: 'editor', sites: ['br'] },
      overrideAccess: true,
    })
    users.comercialUs = await payload.create({
      collection: 'users',
      data: { email: 'comercial@teste.local', password: 'senha-teste-123', papel: 'comercial', sites: ['us'] },
      overrideAccess: true,
    })
  })

  afterAll(async () => {
    await payload?.destroy?.()
  })

  it('o primeiro usuário nasce admin dos dois sites', async () => {
    const admin = await payload.findByID({ collection: 'users', id: users.admin.id, overrideAccess: true })
    expect(admin.papel).toBe('admin')
    expect(admin.sites).toEqual(['br', 'us'])
  })

  it('grava lead válido com dados normalizados e origem', async () => {
    const result = await ingestLead(
      payload,
      'br',
      {
        ...base,
        pagina: '/pt-BR/produtos/aminosan',
        contexto: { produto: 'Aminosan®' },
        ultimoToque: { source: 'google', medium: 'cpc', campaign: 'safra', landing: '/pt-BR' },
        primeiroToque: { referrer: 'instagram.com', landing: '/pt-BR/culturas' },
      },
      { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile Safari/604.1', pais: 'BR', regiao: 'SP', cidade: 'Campinas' },
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.duplicado).toBe(false)

    const lead = await payload.findByID({ collection: 'leads', id: result.id, overrideAccess: true })
    expect(lead).toMatchObject({
      site: 'br',
      status: 'novo',
      nome: 'Maria Teste',
      email: 'maria@exemplo.com.br',
      telefone: '19999990000',
      contexto: { produto: 'Aminosan®' },
      rastreamento: { utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'safra' },
      dispositivo: { tipo: 'mobile', navegador: 'Safari' },
      geo: { pais: 'BR', regiao: 'SP', cidade: 'Campinas' },
    })
    expect(lead.rastreamento?.primeiroToque).toMatchObject({ referrer: 'instagram.com' })
  })

  it('marca repetição pelo mesmo telefone no mesmo site', async () => {
    const result = await ingestLead(payload, 'br', { ...base, email: 'outro@exemplo.com' })
    expect(result).toMatchObject({ ok: true, duplicado: true })
    if (!result.ok) return
    const lead = await payload.findByID({ collection: 'leads', id: result.id, depth: 0, overrideAccess: true })
    expect(lead.duplicadoDe).toBeTruthy()
  })

  it('recusa campos inválidos e descarta robôs sem gravar', async () => {
    expect(await ingestLead(payload, 'br', { ...base, email: '' })).toMatchObject({ ok: false, error: 'invalid', fields: ['email'] })
    expect(await ingestLead(payload, 'br', { ...base, telefone: '123' })).toMatchObject({ ok: false, fields: ['telefone'] })
    expect(await ingestLead(payload, 'br', { ...base, website: 'http://spam' })).toMatchObject({ ok: false, error: 'spam' })
    expect(await ingestLead(payload, 'br', { ...base, tempoMs: 300 })).toMatchObject({ ok: false, error: 'spam' })

    const { totalDocs } = await payload.count({ collection: 'leads', overrideAccess: true })
    expect(totalDocs).toBe(2)
  })

  it('trial americano exige só nome e e-mail', async () => {
    const result = await ingestLead(payload, 'us', {
      formulario: 'trial',
      nome: 'John Grower',
      email: 'john@farm.com',
      empresa: 'Grower Farms',
      dados: { state: 'FL', acres: '500–1,500', crops: ['citrus'] },
      variante: 'b',
      tempoMs: 8000,
    })
    expect(result).toMatchObject({ ok: true, duplicado: false })
  })

  it('cada papel vê só os leads dos seus sites', async () => {
    const asUser = async (key: keyof typeof users) => {
      const user = await payload.findByID({ collection: 'users', id: users[key].id, overrideAccess: true })
      return { ...user, collection: 'users' as const }
    }

    const us = await payload.find({ collection: 'leads', user: await asUser('comercialUs'), overrideAccess: false })
    expect(us.docs.map((d) => d.site)).toEqual(['us'])

    const br = await payload.find({ collection: 'leads', user: await asUser('editorBr'), overrideAccess: false })
    expect(br.docs.every((d) => d.site === 'br')).toBe(true)
    expect(br.totalDocs).toBe(2)

    const all = await payload.find({ collection: 'leads', user: await asUser('admin'), overrideAccess: false })
    expect(all.totalDocs).toBe(3)
  })

  it('editor não altera lead; comercial altera só os do seu site', async () => {
    const brLead = (await payload.find({ collection: 'leads', where: { site: { equals: 'br' } }, limit: 1, overrideAccess: true })).docs[0]
    const usLead = (await payload.find({ collection: 'leads', where: { site: { equals: 'us' } }, limit: 1, overrideAccess: true })).docs[0]
    const editor = { ...(await payload.findByID({ collection: 'users', id: users.editorBr.id, overrideAccess: true })), collection: 'users' as const }
    const comercial = { ...(await payload.findByID({ collection: 'users', id: users.comercialUs.id, overrideAccess: true })), collection: 'users' as const }

    await expect(
      payload.update({ collection: 'leads', id: brLead.id, data: { status: 'em-contato' }, user: editor, overrideAccess: false }),
    ).rejects.toThrow()
    await expect(
      payload.update({ collection: 'leads', id: brLead.id, data: { status: 'em-contato' }, user: comercial, overrideAccess: false }),
    ).rejects.toThrow()

    const updated = await payload.update({
      collection: 'leads',
      id: usLead.id,
      data: { status: 'qualificado', notas: [{ texto: 'Ligou pedindo amostra.' }] },
      user: comercial,
      overrideAccess: false,
    })
    expect(updated.status).toBe('qualificado')
    const nota = updated.notas?.[0]
    expect(nota?.data).toBeTruthy()
    expect(typeof nota?.autor === 'object' ? nota?.autor?.id : nota?.autor).toBe(users.comercialUs.id)
  })

  it('usuário comum não se promove a admin', async () => {
    const editor = { ...(await payload.findByID({ collection: 'users', id: users.editorBr.id, overrideAccess: true })), collection: 'users' as const }
    await payload.update({
      collection: 'users',
      id: users.editorBr.id,
      data: { papel: 'admin', sites: ['br', 'us'] },
      user: editor,
      overrideAccess: false,
    })
    const after = await payload.findByID({ collection: 'users', id: users.editorBr.id, overrideAccess: true })
    expect(after.papel).toBe('editor')
    expect(after.sites).toEqual(['br'])
  })
})
