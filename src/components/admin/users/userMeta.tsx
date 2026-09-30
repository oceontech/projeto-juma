/** Perfis da equipe e o avatar (foto ou iniciais), usados em todas as telas de usuário. */

export const USER_ROLES = [
  { value: 'admin', label: 'Admin', hint: 'Tudo, inclusive a equipe', tone: 'dark' },
  { value: 'editor', label: 'Editor', hint: 'Blog e conteúdo dos sites', tone: 'green' },
  { value: 'comercial', label: 'Comercial', hint: 'Atende os leads', tone: 'amber' },
] as const

export const roleMeta = (value: unknown) =>
  USER_ROLES.find((r) => r.value === value) ?? { value: '', label: 'Sem perfil', hint: 'Não entra no painel', tone: 'gray' }

export const displayName = (u: { nome?: string | null; email?: string | null } | null | undefined) =>
  u?.nome?.trim() || u?.email?.split('@')[0] || ''

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '•'

/** "hoje", "ontem", "há 5 dias", "nunca entrou". */
export function lastSeen(iso?: string | null, now = Date.now()) {
  if (!iso) return 'nunca entrou'
  const days = Math.floor((now - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return 'entrou hoje'
  if (days === 1) return 'entrou ontem'
  if (days < 30) return `entrou há ${days} dias`
  return `entrou em ${new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')}`
}

type AvatarProps = { name: string; photo?: string | null; size?: number; className?: string }

export function UserAvatar({ name, photo, size = 42, className = '' }: AvatarProps) {
  return (
    <span
      className={`ju-avatar ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.32) }}
      aria-hidden
    >
      {photo ? <img src={photo} alt="" /> : initialsOf(name)}
    </span>
  )
}
