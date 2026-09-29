/** Nomes em português para os códigos que o Umami guarda. */

const BR_STATES: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal',
  ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima',
  SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
}

const US_STATES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
  CT: 'Connecticut', DE: 'Delaware', DC: 'Washington D.C.', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii',
  ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota',
  TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
}

let countryNames: Intl.DisplayNames | null = null

export function countryName(code?: string | null) {
  if (!code) return 'Desconhecido'
  try {
    countryNames ??= new Intl.DisplayNames(['pt-BR'], { type: 'region' })
    return countryNames.of(code.toUpperCase()) ?? code
  } catch {
    return code
  }
}

/** "BR-SP" → { name: "São Paulo", uf: "SP", country: "BR" } */
export function regionName(code?: string | null) {
  if (!code) return { name: 'Desconhecido', uf: '', country: '' }
  const [country, uf = ''] = code.split('-')
  const table = country === 'BR' ? BR_STATES : country === 'US' ? US_STATES : null
  return { name: table?.[uf] ?? (uf || code), uf, country }
}

const CHANNELS: Record<string, string> = {
  direct: 'Acesso direto',
  organicSearch: 'Busca (Google e outros)',
  paidSearch: 'Busca paga',
  organicSocial: 'Redes sociais',
  paidSocial: 'Anúncio em rede social',
  paidAds: 'Anúncios',
  referral: 'Links de outros sites',
  email: 'E-mail',
  sms: 'SMS',
  llm: 'Assistentes de IA (ChatGPT etc.)',
  affiliate: 'Afiliados',
  organicVideo: 'Vídeo (YouTube etc.)',
  paidVideo: 'Anúncio em vídeo',
  organicShopping: 'Compras',
  paidShopping: 'Compras (pago)',
  '': 'Outros',
}
export const channelName = (c: string) => CHANNELS[c] ?? c

const DEVICES: Record<string, string> = {
  desktop: 'Computador',
  laptop: 'Notebook',
  mobile: 'Celular',
  tablet: 'Tablet',
}
export const deviceName = (d?: string | null) => (d ? (DEVICES[d] ?? d) : 'Desconhecido')

const BROWSERS: Record<string, string> = {
  chrome: 'Chrome',
  'crios': 'Chrome (iPhone)',
  safari: 'Safari',
  ios: 'Safari (iPhone)',
  'ios-webview': 'App no iPhone',
  firefox: 'Firefox',
  edge: 'Edge',
  'edge-chromium': 'Edge',
  opera: 'Opera',
  samsung: 'Samsung Internet',
  'chromium-webview': 'App no Android',
  facebook: 'App do Facebook',
  instagram: 'App do Instagram',
}
export const browserName = (b?: string | null) => (b ? (BROWSERS[b] ?? b) : 'Desconhecido')

export const osName = (o?: string | null) => o || 'Desconhecido'

const EVENTS: Record<string, string> = {
  lead: 'Enviou o formulário (lead)',
  whatsapp: 'Voltou direto ao WhatsApp',
}
export const eventName = (e: string) => EVENTS[e] ?? e

/** "3 min 20 s", "45 s", "1 h 5 min" */
export function duration(seconds: number) {
  const s = Math.max(0, Math.round(seconds))
  if (s < 60) return `${s} s`
  if (s < 3600) return `${Math.floor(s / 60)} min${s % 60 ? ` ${s % 60} s` : ''}`
  return `${Math.floor(s / 3600)} h ${Math.floor((s % 3600) / 60)} min`
}
