'use client'

import { useEffect } from 'react'

import { track } from './track'

/**
 * Tempo de permanência. O Umami só sabe quanto a pessoa ficou pela hora do
 * primeiro e do último sinal da visita; quem vê uma página só não manda um
 * segundo sinal e fica com tempo zero. Aqui vai o evento "tempo" quando a
 * pessoa sai ou troca de aba, e a cada minuto enquanto a página está aberta
 * (até 30 min). Só conta tempo com a aba visível. O Umami da Oceon
 * (../umami-juma) ignora esse evento na rejeição e o usa no tempo médio.
 */
const MIN_MS = 1_000
const BEAT_MS = 60_000
const MAX_MS = 30 * 60_000

export function Engagement() {
  // Link do painel ("Não contar minhas visitas"): marca este navegador para o Umami ignorar.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (!url.searchParams.has('nao-contar')) return
    try {
      window.localStorage.setItem('umami.disabled', '1')
    } catch {
      /* sem armazenamento: nada a fazer */
    }
    url.searchParams.delete('nao-contar')
    window.history.replaceState(null, '', url.toString())
  }, [])

  useEffect(() => {
    let visible = 0
    let since = document.visibilityState === 'visible' ? Date.now() : 0
    let sent = 0

    const elapsed = () => visible + (since ? Date.now() - since : 0)
    const send = () => {
      const ms = Math.min(elapsed(), MAX_MS)
      if (ms < MIN_MS || ms - sent < 1000) return
      sent = ms
      track('tempo', { segundos: Math.round(ms / 1000) })
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        if (since) visible += Date.now() - since
        since = 0
        send()
      } else if (!since) {
        since = Date.now()
      }
    }
    const beat = window.setInterval(() => {
      if (since && elapsed() < MAX_MS + BEAT_MS) send()
    }, BEAT_MS)

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', send)
    return () => {
      window.clearInterval(beat)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', send)
    }
  }, [])
  return null
}
