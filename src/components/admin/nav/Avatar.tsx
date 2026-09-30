'use client'

import { useAuth } from '@payloadcms/ui'

/** Avatar do canto do cabeçalho (admin.avatar): foto ou iniciais, como na sidebar. */
export function Avatar() {
  const { user } = useAuth<{ nome?: string | null; email: string; fotoUrl?: string | null }>()
  const name = user?.nome || user?.email?.split('@')[0] || ''
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  return (
    <span className="jhead-avatar" title={`${name} · minha conta`}>
      {user?.fotoUrl ? <img src={user.fotoUrl} alt="" /> : initials || '•'}
    </span>
  )
}
