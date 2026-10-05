// @vitest-environment node
import { createLocalReq, getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import config from '@/payload.config'
import { inviteHandler } from '@/features/email/inviteEndpoint'
import { ingestLead } from '@/features/leads/server/ingest'

/**
 * E-mails do painel: troca de senha, convite e aviso de lead novo. O envio é
 * interceptado (nada sai pelo Resend). APAGA usuários e leads: só roda contra
 * um Postgres local, como o leads.int.spec.ts, com as migrations já aplicadas:
 *   PAYLOAD_DATABASE_URL=postgres://postgres:juma@localhost:55432/juma PAYLOAD_SECRET=teste npm run migrate
 */
const dbHost = (() => {
  try {
    return new URL(process.env.PAYLOAD_DATABASE_URL ?? '').hostname
  } catch {
    return ''
  }
})()
const isLocalDb = ['localhost', '127.0.0.1'].includes(dbHost)

type Sent = { to: string | string[]; subject: string; html: string; replyTo?: string }

let payload: Payload
let sent: Sent[] = []
let admin: { id: number | string; email: string }

const linkIn = (html: string) => html.match(/href="([^"]*\/admin\/reset\/[a-f0-9]+)"/)?.[1]
const tokenOf = (url?: string) => url?.split('/').pop() ?? ''

async function invite(body: Record<string, unknown>) {
  const req = await createLocalReq({ user: { ...admin, collection: 'users', papel: 'admin' } as never, req: { headers: new Headers({ host: 'painel.teste', 'x-forwarded-proto': 'https' }) } as never }, payload)
  req.data = body
  const res = await inviteHandler(req)
  return { status: res.status, json: (await res.json()) as Record<string, any> }
}

describe.skipIf(!isLocalDb)('e-mails do painel', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const capture = async (msg: Sent) => {
      sent.push(msg)
      return { id: 'teste' }
    }
    vi.spyOn(payload.email, 'sendEmail').mockImplementation(capture as never)
    vi.spyOn(payload, 'sendEmail').mockImplementation(capture as never)

    await payload.delete({ collection: 'leads', where: { id: { exists: true } }, overrideAccess: true })
    await payload.delete({ collection: 'users', where: { id: { exists: true } }, overrideAccess: true })
    admin = (await payload.create({
      collection: 'users',
      data: { email: 'admin@teste.local', password: 'senha-teste-123', nome: 'Ana Admin' } as never,
      overrideAccess: true,
    })) as never
  })

  beforeEach(() => {
    sent = []
  })

  afterAll(async () => {
    vi.restoreAllMocks()
    await payload?.destroy?.()
  })

  it('o primeiro usuário (tela inicial) não recebe convite', () => {
    expect(sent).toHaveLength(0)
  })

  it('"esqueci a senha" manda o e-mail da Juma e o link troca a senha', async () => {
    await payload.forgotPassword({ collection: 'users', data: { email: admin.email }, overrideAccess: true })
    expect(sent).toHaveLength(1)
    expect(sent[0].to).toBe(admin.email)
    expect(sent[0].subject).toBe('Crie uma nova senha para o painel da Juma')
    expect(sent[0].html).toContain('Olá, Ana.')
    expect(sent[0].html).toContain('1 hora')

    const token = tokenOf(linkIn(sent[0].html))
    expect(token).toMatch(/^[a-f0-9]{40}$/)
    await payload.resetPassword({ collection: 'users', data: { token, password: 'nova-senha-456' }, overrideAccess: true })
    const login = await payload.login({ collection: 'users', data: { email: admin.email, password: 'nova-senha-456' } })
    expect(login.token).toBeTruthy()

    // O link é de uso único.
    await expect(
      payload.resetPassword({ collection: 'users', data: { token, password: 'outra-senha-789' }, overrideAccess: true }),
    ).rejects.toThrow()
  })

  it('convite cria a pessoa sem senha conhecida e o link vale 7 dias', async () => {
    const { status, json } = await invite({ nome: 'Carla Comercial', email: ' Carla@Teste.Local ', papel: 'comercial', sites: ['br'] })
    expect(status).toBe(201)
    expect(json.ok).toBe(true)

    expect(sent).toHaveLength(1)
    expect(sent[0].to).toBe('carla@teste.local')
    expect(sent[0].subject).toBe('Seu acesso ao painel da Juma Agro')
    expect(sent[0].html).toContain('Ana Admin criou seu acesso')
    expect(sent[0].html).toContain('Comercial (atende os leads)')
    const url = linkIn(sent[0].html)
    expect(url).toMatch(/^https:\/\/painel\.teste\/admin\/reset\//)

    const user = await payload.findByID({ collection: 'users', id: json.id, overrideAccess: true, showHiddenFields: true })
    expect(user).toMatchObject({ email: 'carla@teste.local', nome: 'Carla Comercial', papel: 'comercial', sites: ['br'] })
    const days = (new Date(user.resetPasswordExpiration!).getTime() - Date.now()) / 86_400_000
    expect(days).toBeGreaterThan(6.9)

    await payload.resetPassword({ collection: 'users', data: { token: tokenOf(url), password: 'senha-da-carla' }, overrideAccess: true })
    const login = await payload.login({ collection: 'users', data: { email: 'carla@teste.local', password: 'senha-da-carla' } })
    expect(login.user?.email).toBe('carla@teste.local')
  })

  it('convite repetido: reenvia para quem nunca entrou e recusa quem já entrou', async () => {
    const first = await invite({ email: 'dani@teste.local', papel: 'editor', sites: ['br', 'us'] })
    expect(first.status).toBe(201)
    const again = await invite({ email: 'dani@teste.local', papel: 'editor', sites: ['br'] })
    expect(again.json).toMatchObject({ ok: true, resent: true })
    expect(sent).toHaveLength(2)
    expect(tokenOf(linkIn(sent[1].html))).not.toBe(tokenOf(linkIn(sent[0].html)))

    // Carla já entrou no teste anterior.
    const carla = await invite({ email: 'carla@teste.local', papel: 'comercial', sites: ['br'] })
    expect(carla.status).toBe(409)
    expect(carla.json.errors.email).toBeTruthy()
  })

  it('convite valida os campos e só admin convida', async () => {
    const bad = await invite({ email: 'sem-arroba', papel: 'chefe', sites: [] })
    expect(bad.status).toBe(400)
    expect(Object.keys(bad.json.errors).sort()).toEqual(['email', 'papel', 'sites'])

    const req = await createLocalReq({ user: { id: 999, collection: 'users', papel: 'editor' } as never }, payload)
    req.data = { email: 'x@teste.local', papel: 'admin' }
    expect((await inviteHandler(req)).status).toBe(403)
    expect(sent).toHaveLength(0)
  })

  it('admin que cadastra pelo formulário padrão também dispara o convite', async () => {
    const req = await createLocalReq({ user: { ...admin, collection: 'users', papel: 'admin' } as never }, payload)
    await payload.create({
      collection: 'users',
      data: { email: 'edu@teste.local', password: 'qualquer-coisa-1', papel: 'editor', sites: ['br'] },
      req,
    })
    expect(sent).toHaveLength(1)
    expect(sent[0].to).toBe('edu@teste.local')
    expect(linkIn(sent[0].html)).toBeTruthy()
  })

  it('lead novo avisa o comercial do site; o repetido não', async () => {
    const lead = {
      formulario: 'whatsapp' as const,
      nome: 'João Produtor',
      email: 'joao@fazenda.com.br',
      telefone: '(19) 99999-1234',
      pagina: '/produtos/aminosan',
      contexto: { produto: 'Aminosan' },
      tempoMs: 5000,
    }
    const r1 = await ingestLead(payload, 'br', lead, { cidade: 'Campinas', regiao: 'SP', pais: 'BR' })
    expect(r1.ok).toBe(true)
    expect(sent).toHaveLength(1)
    expect(sent[0].to).toEqual(['carla@teste.local'])
    expect(sent[0].replyTo).toBe('joao@fazenda.com.br')
    expect(sent[0].subject).toBe('Novo contato no site do Brasil: João Produtor')
    expect(sent[0].html).toContain('(19) 99999-1234')
    expect(sent[0].html).toContain('Campinas, SP, BR')
    if (r1.ok) expect(sent[0].html).toContain(`/admin/collections/leads/${r1.id}`)

    await ingestLead(payload, 'br', lead)
    expect(sent).toHaveLength(1)
  })

  it('sem comercial no site, o aviso vai para os admins', async () => {
    await ingestLead(payload, 'us', { formulario: 'trial', nome: 'Mike <b>Farmer</b>', email: 'mike@farm.com', tempoMs: 5000 })
    expect(sent).toHaveLength(1)
    expect(sent[0].to).toEqual(['admin@teste.local'])
    expect(sent[0].subject).toBe('Novo contato no site dos EUA: Mike <b>Farmer</b>')
    // Nome vindo do formulário é escapado no HTML.
    expect(sent[0].html).toContain('Mike &lt;b&gt;Farmer&lt;/b&gt;')
    expect(sent[0].html).not.toContain('<b>Farmer</b>')
  })

  it('falha no envio não derruba a gravação do lead', async () => {
    vi.mocked(payload.sendEmail).mockRejectedValueOnce(new Error('Resend fora do ar'))
    const r = await ingestLead(payload, 'br', { formulario: 'whatsapp', nome: 'Lia', email: 'lia@x.com', telefone: '19988887777', tempoMs: 5000 })
    expect(r.ok).toBe(true)
  })
})
