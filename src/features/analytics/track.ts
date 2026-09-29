type Umami = { track: (event: string, data?: Record<string, string | number>) => void }

/** Evento no Umami; não faz nada se o script não carregou (bloqueador, dev). */
export function track(event: string, data?: Record<string, string | number | undefined>) {
  const umami = (window as unknown as { umami?: Umami }).umami
  if (!umami) return
  const clean = Object.fromEntries(Object.entries(data ?? {}).filter(([, v]) => v !== undefined && v !== '')) as Record<
    string,
    string | number
  >
  try {
    umami.track(event, clean)
  } catch {
    // Métrica nunca derruba a página.
  }
}
