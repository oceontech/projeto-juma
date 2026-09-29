/**
 * Avisa o site americano (outro projeto na Vercel) para regerar páginas depois
 * de uma publicação no painel. Sem as variáveis, não faz nada: o site EUA
 * também se atualiza sozinho a cada 5 minutos.
 */
export async function revalidateUsSite(paths: string[]) {
  const url = process.env.US_SITE_URL
  const secret = process.env.US_REVALIDATE_SECRET
  if (!url || !secret) return
  try {
    await fetch(`${url.replace(/\/$/, '')}/api/revalidate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ paths }),
      signal: AbortSignal.timeout(5000),
    })
  } catch {
    // O site EUA pega a mudança no próximo ciclo de 5 minutos.
  }
}
