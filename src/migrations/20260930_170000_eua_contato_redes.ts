import { type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

/**
 * Site EUA com o mesmo contato e as mesmas redes do site Brasil, só nos campos
 * vazios (o que já foi preenchido no painel fica como está). Depois a equipe
 * troca pelo que for próprio da LLC em Site EUA › Contato e Redes sociais.
 */

type BrSettings = { telefone?: string | null; whatsapp?: string | null; email?: string | null }
type BrSocial = Record<'instagram' | 'facebook' | 'linkedin' | 'youtube', string | null | undefined>

/** "(19) 3891-6415" → "+55 19 3891-6415": o visitante americano precisa do código do país. */
function intl(phone?: string | null) {
  if (!phone) return null
  const d = phone.replace(/\D/g, '')
  if (d.startsWith('55') && d.length >= 12) return `+55 ${d.slice(2, 4)} ${d.slice(4, -4)}-${d.slice(-4)}`
  if (d.length === 10 || d.length === 11) return `+55 ${d.slice(0, 2)} ${d.slice(2, -4)}-${d.slice(-4)}`
  return phone
}

const empty = (v: unknown) => v === null || v === undefined || String(v).trim() === ''

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const [br, brSocial, us, usSocial] = await Promise.all([
    payload.findGlobal({ slug: 'settings', depth: 0, req }) as Promise<BrSettings>,
    payload.findGlobal({ slug: 'redes', depth: 0, req }) as Promise<BrSocial>,
    payload.findGlobal({ slug: 'settings-us', depth: 0, req }) as unknown as Promise<Record<string, unknown>>,
    payload.findGlobal({ slug: 'redes-us', depth: 0, req }) as unknown as Promise<Record<string, unknown>>,
  ])

  const contact: Record<string, string> = {}
  if (empty(us.email) && br.email) contact.email = br.email
  const phone = intl(br.telefone || br.whatsapp)
  if (empty(us.phone) && phone) contact.phone = phone
  // Mesmo horário do site Brasil, em inglês (a equipe atende no horário de Brasília).
  if (empty(us.hours)) contact.hours = 'Mon to Thu 7:30 a.m. to 5:15 p.m., Fri 7:30 a.m. to 4 p.m. (Brasília time)'
  if (Object.keys(contact).length) await payload.updateGlobal({ slug: 'settings-us', data: contact, req })

  const social: Record<string, string> = {}
  for (const key of ['instagram', 'facebook', 'linkedin', 'youtube'] as const) {
    if (empty(usSocial[key]) && brSocial[key]) social[key] = String(brSocial[key])
  }
  if (Object.keys(social).length) await payload.updateGlobal({ slug: 'redes-us', data: social, req })

  payload.logger.info(`Site EUA: contato (${Object.keys(contact).join(', ') || 'nada vazio'}) e redes (${Object.keys(social).join(', ') || 'nada vazio'}) preenchidos com os do Brasil.`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Só preenche campos vazios: não há o que desfazer com segurança.
}
