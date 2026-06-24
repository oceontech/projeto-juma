'use client'

import { useEffect, useState } from 'react'

/**
 * Retorna `true` quando o usuário pede menos movimento.
 * Começa em `false` no SSR/primeiro paint; ajusta no cliente e ouve mudanças.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
