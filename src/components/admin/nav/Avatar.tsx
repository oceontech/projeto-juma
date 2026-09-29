'use client'

import { useAuth } from '@payloadcms/ui'

/** Avatar do canto do cabeçalho (admin.avatar): iniciais, como na sidebar. */
export function Avatar() {
  const { user } = useAuth<{ nome?: string | null; email: string }>()
  const name = user?.nome || user?.email?.split('@')[0] || ''
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  return (
    <span className="jhead-avatar" title={`${name} · minha conta`}>
      {initials || '•'}
    </span>
  )
}
