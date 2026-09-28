'use client'

import { useAuth, useConfig } from '@payloadcms/ui'
import Link from 'next/link'

const ROLE_LABEL: Record<string, string> = { admin: 'Admin', editor: 'Editor', comercial: 'Comercial' }

/**
 * Rodapé da sidebar: conta do usuário (avatar, nome e papel) e o botão de sair
 * na mesma linha. Substitui o botão de sair padrão (`admin.components.logout`),
 * por isso fica sempre fixo embaixo, fora da rolagem dos links.
 */
export function NavAccount() {
  const { user } = useAuth<{ id: number | string; nome?: string | null; email: string; papel?: string }>()
  const { config } = useConfig()
  const logoutHref = `${config.routes.admin}${config.admin.routes.logout}`

  const name = user ? user.nome || user.email.split('@')[0] : ''
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  return (
    <div className="juma-account">
      {user && (
        <Link href={`/admin/collections/users/${user.id}`} className="juma-account__card" title="Minha conta">
          <span className="juma-account__avatar">{initials}</span>
          <span className="juma-account__text">
            <b>{name}</b>
            <small>{ROLE_LABEL[user.papel ?? ''] ?? user.email}</small>
          </span>
        </Link>
      )}
      <Link href={logoutHref} prefetch={false} className="juma-account__logout" aria-label="Sair" title="Sair">
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="m16 17 5-5-5-5M21 12H9" />
        </svg>
      </Link>
    </div>
  )
}
