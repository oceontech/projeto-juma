'use client'

import { useAuth } from '@payloadcms/ui'
import Link from 'next/link'

const ROLE_LABEL: Record<string, string> = { admin: 'Admin', editor: 'Editor', comercial: 'Comercial' }

/** Conta do usuário no rodapé da sidebar (avatar com iniciais, nome e papel). */
export function NavAccount() {
  const { user } = useAuth<{ id: number | string; nome?: string | null; email: string; papel?: string }>()
  if (!user) return null
  const name = user.nome || user.email.split('@')[0]
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  return (
    <div className="juma-account">
      <p className="juma-nav-label">Sua conta</p>
      <Link href={`/admin/collections/users/${user.id}`} className="juma-account__card">
        <span className="juma-account__avatar">{initials}</span>
        <span className="juma-account__text">
          <b>{name}</b>
          <small>{ROLE_LABEL[user.papel ?? ''] ?? user.email}</small>
        </span>
      </Link>
    </div>
  )
}
