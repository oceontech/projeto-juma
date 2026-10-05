import { EMAIL_ASSET_URL } from './config'

/**
 * Moldura dos e-mails: tabela simples com estilo inline, que é o que Gmail,
 * Outlook e Apple Mail entendem. Logo PNG (leitor de e-mail não mostra SVG nem WebP).
 */

export const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const GREEN = '#004C26'
const INK = '#0c140f'
const MUTED = '#71717a'
const LINE = '#e7e8e4'
const FONT = "Montserrat, 'Segoe UI', Helvetica, Arial, sans-serif"

type Layout = {
  /** Linha que aparece ao lado do assunto na caixa de entrada. */
  preheader: string
  title: string
  /** HTML já escapado. */
  body: string
  cta?: { label: string; url: string }
  /** HTML já escapado, em letra menor abaixo do botão. */
  note?: string
  /** Rodapé: por que a pessoa recebeu. */
  footer: string
}

export const paragraph = (html: string) =>
  `<p style="margin:0 0 16px;font:300 15px/1.6 ${FONT};color:${INK}">${html}</p>`

/** Linhas rótulo/valor (dados do lead, perfil do convite). */
export function details(rows: [label: string, value: string | null | undefined][]) {
  const filled = rows.filter(([, v]) => v && String(v).trim())
  if (!filled.length) return ''
  const tr = filled
    .map(
      ([label, value]) =>
        `<tr><td style="padding:10px 0;border-top:1px solid ${LINE};font:500 13px/1.5 ${FONT};color:${MUTED};width:120px;vertical-align:top">${esc(label)}</td>` +
        `<td style="padding:10px 0;border-top:1px solid ${LINE};font:400 14px/1.5 ${FONT};color:${INK};white-space:pre-line">${esc(value)}</td></tr>`,
    )
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 24px;border-collapse:collapse">${tr}</table>`
}

export function emailLayout({ preheader, title, body, cta, note, footer }: Layout) {
  const button = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr><td style="border-radius:999px;background:${GREEN}">` +
      `<a href="${esc(cta.url)}" style="display:inline-block;padding:14px 28px;font:600 15px/1 ${FONT};color:#ffffff;text-decoration:none;border-radius:999px">${esc(cta.label)}</a>` +
      `</td></tr></table>` +
      `<p style="margin:0 0 20px;font:300 12.5px/1.6 ${FONT};color:${MUTED}">Se o botão não abrir, copie este endereço no navegador:<br><a href="${esc(cta.url)}" style="color:${GREEN};word-break:break-all">${esc(cta.url)}</a></p>`
    : ''

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f3">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f3">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:0 4px 20px"><img src="${EMAIL_ASSET_URL}/brand/logo-juma-email.png" width="112" height="57" alt="Juma Agro" style="display:block;border:0"></td></tr>
<tr><td style="background:#ffffff;border-radius:16px;padding:36px 32px;border:1px solid ${LINE}">
<h1 style="margin:0 0 20px;font:800 22px/1.3 ${FONT};color:${INK}">${esc(title)}</h1>
${body}
${button}
${note ? `<p style="margin:0;font:300 13px/1.6 ${FONT};color:${MUTED}">${note}</p>` : ''}
</td></tr>
<tr><td style="padding:20px 4px 0;font:300 12px/1.6 ${FONT};color:${MUTED}">${footer}<br>Juma Agro · Painel de gestão dos sites</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}
