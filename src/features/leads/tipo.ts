/**
 * Tipo de contato do lead: quem é e o que quer. Nem todo mundo que escreve é
 * produtor; muita gente procura vaga ou oferece serviço. A página de contato
 * pergunta o assunto; o resto é adivinhado pela mensagem e pelo formulário, e
 * o comercial corrige com um clique no painel.
 */

export const LEAD_TIPOS = ['cliente', 'revenda', 'emprego', 'fornecedor', 'outro'] as const
export type LeadTipo = (typeof LEAD_TIPOS)[number]

export const isLeadTipo = (v: unknown): v is LeadTipo => LEAD_TIPOS.includes(v as LeadTipo)

const has = (text: string, words: RegExp) => words.test(text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase())

/** Palpite pelo que a pessoa escreveu e por onde veio. `null` = a classificar. */
export function guessTipo(input: {
  formulario?: string | null
  mensagem?: string | null
  empresa?: string | null
  contexto?: { produto?: string | null } | null
}): LeadTipo | null {
  const text = `${input.mensagem ?? ''} ${input.empresa ?? ''}`
  if (has(text, /\b(vaga|vagas|emprego|curriculo|trabalhar (com|na|para)|trabalhe conosco|estagio|job|hiring|resume)\b/)) return 'emprego'
  if (has(text, /\b(fornecedor|fornecemos|oferecemos|nossos servicos|parceria comercial|representacao|proposta comercial|prestamos|supplier|we offer)\b/)) return 'fornecedor'
  if (has(text, /\b(revenda|revendedor|distribuidor|distribuidora|lojista|reseller|dealer|distributor)\b/)) return 'revenda'
  // Pediu teste na lavoura (EUA) ou clicou num produto: interesse de compra.
  if (input.formulario === 'trial' || input.formulario === 'trial-compact') return 'cliente'
  if (input.contexto?.produto) return 'cliente'
  return null
}
