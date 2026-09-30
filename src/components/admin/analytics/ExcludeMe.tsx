'use client'

import { useEffect, useState } from 'react'

/**
 * "Não contar minhas visitas": marca este navegador para o Umami ignorar
 * (localStorage `umami.disabled`). O painel mora no mesmo domínio do site
 * Brasil, então vale direto para ele; o site EUA fica em outro domínio e é
 * marcado por um link que abre o site com `?nao-contar=1`.
 */
export function ExcludeMe({ usSite }: { usSite?: string | null }) {
  const [off, setOff] = useState<boolean | null>(null)
  useEffect(() => {
    try {
      setOff(window.localStorage.getItem('umami.disabled') === '1')
    } catch {
      setOff(false)
    }
  }, [])
  if (off === null) return null

  const toggle = () => {
    try {
      if (off) window.localStorage.removeItem('umami.disabled')
      else window.localStorage.setItem('umami.disabled', '1')
      setOff(!off)
    } catch {
      // navegador sem armazenamento: nada a fazer
    }
  }

  return (
    <div className={`ja-exclude${off ? ' is-off' : ''}`}>
      <button type="button" onClick={toggle} title="Suas visitas e as da equipe distorcem os números de um site novo">
        <i aria-hidden />
        {off ? 'Minhas visitas não contam neste navegador' : 'Não contar minhas visitas'}
      </button>
      {off && usSite && (
        <a href={`${usSite.replace(/\/$/, '')}/?nao-contar=1`} target="_blank" rel="noopener noreferrer" title="Abre o site EUA e marca este navegador lá também">
          fazer o mesmo no site EUA ↗
        </a>
      )}
    </div>
  )
}
