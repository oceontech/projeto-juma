/**
 * De onde veio o lead, em palavras: "Google", "Instagram", "Google Ads",
 * "Direto"… a partir do utm_source, dos ids de anúncio e do site que mandou.
 */

const KNOWN: [RegExp, string][] = [
  [/(^|\.)google\./, 'Google'],
  [/instagram|^ig$/, 'Instagram'],
  [/facebook|^fb$|fb\.com/, 'Facebook'],
  [/whatsapp|wa\.me/, 'WhatsApp'],
  [/linkedin|lnkd/, 'LinkedIn'],
  [/youtube|youtu\.be/, 'YouTube'],
  [/bing\./, 'Bing'],
  [/chatgpt|openai/, 'ChatGPT'],
  [/tiktok/, 'TikTok'],
  [/juma-agro|localhost|vercel\.app/, 'Direto'],
]

export function leadChannel(t?: { utmSource?: string | null; referrer?: string | null; gclid?: string | null; fbclid?: string | null } | null) {
  if (t?.gclid) return 'Google Ads'
  if (t?.fbclid) return 'Anúncio Meta'
  const raw = (t?.utmSource || t?.referrer || '').trim().toLowerCase()
  if (!raw) return 'Direto'
  let host = raw
  try {
    host = raw.includes('://') ? new URL(raw).hostname : raw
  } catch {
    // utm_source solto ("newsletter", "email")
  }
  host = host.replace(/^www\./, '')
  for (const [re, name] of KNOWN) if (re.test(host)) return name
  if (/mail|newsletter/.test(host)) return 'E-mail'
  return host.charAt(0).toUpperCase() + host.slice(1)
}
