/**
 * Cliente mínimo da OpenAI para o assistente de posts do painel.
 * Modelos baratos e bons para o caso (trocáveis por variável de ambiente):
 * - texto: gpt-5.4-mini (escrita e revisão em PT/EN, JSON estruturado)
 * - imagem: gpt-image-1-mini (capas fotográficas, 1536×1024, WebP)
 */

const API = 'https://api.openai.com/v1'
const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || 'gpt-5.4-mini'
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1-mini'

export class AiError extends Error {
  constructor(
    message: string,
    public status = 500,
  ) {
    super(message)
  }
}

function key() {
  const k = process.env.OPENAI_API_KEY
  if (!k) throw new AiError('A IA ainda não está configurada (falta OPENAI_API_KEY).', 503)
  return k
}

async function call<T>(path: string, body: unknown, timeoutMs: number): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${key()}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  }).catch((err) => {
    throw new AiError(err?.name === 'TimeoutError' ? 'A IA demorou demais. Tente de novo.' : 'Sem conexão com a IA.', 504)
  })
  const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } } & T
  if (!res.ok) {
    const msg = data.error?.message ?? `Erro ${res.status}`
    if (res.status === 429) throw new AiError('Limite de uso da IA atingido. Aguarde um pouco e tente de novo.', 429)
    if (/safety|moderation|rejected/i.test(msg)) throw new AiError('A IA recusou este pedido. Ajuste o texto e tente de novo.', 422)
    throw new AiError(`A IA respondeu com erro: ${msg}`, 502)
  }
  return data
}

/** Pergunta com resposta em JSON (o formato vai descrito no próprio prompt). */
export async function chatJSON<T>(system: string, user: string, { effort = 'low' as 'low' | 'medium' } = {}): Promise<T> {
  const data = await call<{ choices: { message: { content: string } }[] }>(
    '/chat/completions',
    {
      model: TEXT_MODEL,
      reasoning_effort: effort,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    },
    90_000,
  )
  try {
    return JSON.parse(data.choices[0].message.content) as T
  } catch {
    throw new AiError('A IA respondeu num formato inesperado. Tente de novo.', 502)
  }
}

/** Gera uma imagem horizontal e devolve os bytes em WebP. */
export async function generateImage(prompt: string): Promise<Buffer> {
  const data = await call<{ data: { b64_json: string }[] }>(
    '/images/generations',
    {
      model: IMAGE_MODEL,
      prompt,
      size: '1536x1024',
      quality: 'medium',
      output_format: 'webp',
      output_compression: 82,
      n: 1,
    },
    180_000,
  )
  const b64 = data.data?.[0]?.b64_json
  if (!b64) throw new AiError('A IA não devolveu a imagem. Tente de novo.', 502)
  return Buffer.from(b64, 'base64')
}

/**
 * Aprimora uma imagem existente seguindo o pedido (mesmo modelo de imagem).
 * Devolve os bytes em WebP, no formato horizontal da capa.
 */
export async function editImage(source: Buffer, mimetype: string, prompt: string): Promise<Buffer> {
  const form = new FormData()
  form.append('model', IMAGE_MODEL)
  form.append('prompt', prompt)
  form.append('size', '1536x1024')
  form.append('quality', 'medium')
  form.append('output_format', 'webp')
  form.append('output_compression', '82')
  form.append('image[]', new Blob([new Uint8Array(source)], { type: mimetype }), `origem.${mimetype.split('/')[1] || 'png'}`)
  const res = await fetch(`${API}/images/edits`, {
    method: 'POST',
    headers: { authorization: `Bearer ${key()}` },
    body: form,
    signal: AbortSignal.timeout(180_000),
  }).catch((err) => {
    throw new AiError(err?.name === 'TimeoutError' ? 'A IA demorou demais. Tente de novo.' : 'Sem conexão com a IA.', 504)
  })
  const data = (await res.json().catch(() => ({}))) as { data?: { b64_json?: string }[]; error?: { message?: string } }
  if (!res.ok) {
    if (res.status === 429) throw new AiError('Limite de uso da IA atingido. Aguarde um pouco e tente de novo.', 429)
    throw new AiError(`A IA respondeu com erro: ${data.error?.message ?? res.status}`, 502)
  }
  const b64 = data.data?.[0]?.b64_json
  if (!b64) throw new AiError('A IA não devolveu a imagem. Tente de novo.', 502)
  return Buffer.from(b64, 'base64')
}
