'use server'

import config from '@payload-config'
import { cookies, headers } from 'next/headers'
import { getPayload } from 'payload'

import { ingestLead, type LeadInput } from './server/ingest'
import { FIRST_TOUCH_COOKIE, LAST_TOUCH_COOKIE, parseTouch } from './touch'

export type SubmitLeadResult = { ok: true } | { ok: false; error: 'invalid' | 'server'; fields?: string[] }

const decode = (v: string | null) => {
  if (!v) return null
  try {
    return decodeURIComponent(v)
  } catch {
    return v
  }
}

/** Grava um lead do site BR. A origem vem dos cookies de toque e dos headers da Vercel. */
export async function submitLead(
  input: Omit<LeadInput, 'primeiroToque' | 'ultimoToque'>,
): Promise<SubmitLeadResult> {
  const [h, c] = await Promise.all([headers(), cookies()])
  const payload = await getPayload({ config })

  const result = await ingestLead(
    payload,
    'br',
    {
      ...input,
      primeiroToque: parseTouch(c.get(FIRST_TOUCH_COOKIE)?.value),
      ultimoToque: parseTouch(c.get(LAST_TOUCH_COOKIE)?.value),
    },
    {
      userAgent: h.get('user-agent'),
      pais: h.get('x-vercel-ip-country'),
      regiao: h.get('x-vercel-ip-country-region'),
      cidade: decode(h.get('x-vercel-ip-city')),
    },
  )

  if (result.ok) return { ok: true }
  // Para o robô, finge sucesso: não há o que ele aprender com a resposta.
  if (result.error === 'spam') return { ok: true }
  return { ok: false, error: result.error, fields: result.fields }
}
