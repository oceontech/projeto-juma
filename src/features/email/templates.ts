import { details, emailLayout, esc, paragraph } from './layout'

/** Textos dos e-mails do painel. Copy direta, sem vícios de IA (CLAUDE.md). */

type Person = { nome?: string | null; email?: string | null }

const firstName = (p: Person) => p.nome?.trim().split(/\s+/)[0] || ''
const hello = (p: Person) => (firstName(p) ? `Olá, ${esc(firstName(p))}.` : 'Olá.')

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin (tudo, inclusive a equipe)',
  editor: 'Editor (blog e conteúdo dos sites)',
  comercial: 'Comercial (atende os leads)',
}
const SITE_LABEL: Record<string, string> = { br: 'Brasil', us: 'Estados Unidos' }

export function resetPasswordEmail({ user, url }: { user: Person; url: string }) {
  return {
    subject: 'Crie uma nova senha para o painel da Juma',
    html: emailLayout({
      preheader: 'O link para trocar a senha vale por 1 hora.',
      title: 'Troca de senha',
      body:
        paragraph(hello(user)) +
        paragraph('Recebemos um pedido para trocar a senha da sua conta no painel da Juma Agro. Clique no botão para criar a nova senha.'),
      cta: { label: 'Criar nova senha', url },
      note: 'O link vale por 1 hora. Se você não pediu a troca, ignore este e-mail: a senha atual continua valendo.',
      footer: `Enviado para ${esc(user.email)} porque alguém pediu a troca de senha desta conta.`,
    }),
  }
}

export function inviteEmail({
  user,
  url,
  invitedBy,
  days,
}: {
  user: Person & { papel?: string | null; sites?: string[] | null }
  url: string
  invitedBy?: Person | null
  days: number
}) {
  const who = invitedBy ? esc(invitedBy.nome?.trim() || invitedBy.email) : 'A equipe da Juma'
  const sites = user.papel === 'admin' ? ['br', 'us'] : (user.sites ?? [])
  return {
    subject: 'Seu acesso ao painel da Juma Agro',
    html: emailLayout({
      preheader: 'Crie sua senha para entrar no painel dos sites da Juma.',
      title: 'Você tem acesso ao painel',
      body:
        paragraph(hello(user)) +
        paragraph(
          `${who} criou seu acesso ao painel da Juma Agro, onde a equipe cuida dos sites, do blog e dos contatos que chegam pelos sites.`,
        ) +
        details([
          ['Login', user.email],
          ['Perfil', ROLE_LABEL[user.papel ?? ''] ?? user.papel],
          ['Sites', sites.map((s) => SITE_LABEL[s] ?? s).join(' e ')],
        ]),
      cta: { label: 'Criar minha senha', url },
      note: `O link vale por ${days} dias. Depois de criar a senha, você entra no painel com o seu e-mail. Se o prazo passar, peça um novo convite a quem te cadastrou.`,
      footer: `Enviado para ${esc(user.email)} porque esta pessoa foi cadastrada no painel da Juma Agro.`,
    }),
  }
}

const TIPO_LABEL: Record<string, string> = {
  cliente: 'Cliente / produtor',
  revenda: 'Revenda / distribuidor',
  emprego: 'Vaga de emprego',
  fornecedor: 'Fornecedor / serviço',
  outro: 'Outro assunto',
}
const FORM_LABEL: Record<string, string> = {
  whatsapp: 'Botão do WhatsApp',
  contato: 'Página de contato',
  trial: 'Pedido de teste na lavoura',
  'trial-compact': 'Pedido de teste na lavoura',
}

export type LeadNotice = {
  id: number | string
  site: 'br' | 'us'
  nome: string
  email?: string | null
  telefone?: string | null
  empresa?: string | null
  mensagem?: string | null
  tipo?: string | null
  formulario?: string | null
  pagina?: string | null
  contexto?: { produto?: string | null; cultura?: string | null } | null
  geo?: { cidade?: string | null; regiao?: string | null; pais?: string | null } | null
}

const phone = (digits?: string | null) => {
  if (!digits) return null
  const d = digits.replace(/^55(?=\d{10,11}$)/, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `+${digits}`
}

export function newLeadEmail({ lead, url }: { lead: LeadNotice; url: string }) {
  const site = SITE_LABEL[lead.site]
  const local = [lead.geo?.cidade, lead.geo?.regiao, lead.geo?.pais].filter(Boolean).join(', ')
  return {
    subject: `Novo contato no site ${site === 'Brasil' ? 'do Brasil' : 'dos EUA'}: ${lead.nome}`,
    html: emailLayout({
      preheader: [lead.empresa, lead.contexto?.produto, lead.mensagem].filter(Boolean).join(' · ').slice(0, 140) || `Chegou pelo site ${site}.`,
      title: `${lead.nome} entrou em contato`,
      body:
        paragraph(`Chegou um contato novo pelo site ${site === 'Brasil' ? 'do Brasil' : 'dos Estados Unidos'}. Ele já está no painel, em Para responder.`) +
        details([
          ['Nome', lead.nome],
          ['E-mail', lead.email],
          ['Telefone', phone(lead.telefone)],
          ['Empresa', lead.empresa],
          ['Assunto', TIPO_LABEL[lead.tipo ?? ''] ?? null],
          ['Produto', lead.contexto?.produto],
          ['Cultura', lead.contexto?.cultura],
          ['Mensagem', lead.mensagem],
          ['Por onde veio', [FORM_LABEL[lead.formulario ?? ''], lead.pagina].filter(Boolean).join(' · ')],
          ['Local', local],
        ]),
      cta: { label: 'Abrir no painel', url },
      note: lead.email ? 'Responder este e-mail escreve direto para a pessoa.' : undefined,
      footer: `Você recebe este aviso porque atende os contatos do site ${site === 'Brasil' ? 'do Brasil' : 'dos EUA'} no painel.`,
    }),
  }
}
