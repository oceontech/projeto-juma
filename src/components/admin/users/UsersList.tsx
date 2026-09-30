import Link from 'next/link'
import type { ListViewServerProps } from 'payload'

import { TeamList } from './TeamList'

/** Equipe do painel em cartões: quem é, o que pode fazer e em quais sites. */
type Doc = Record<string, any>

export function UsersList({ data, hasCreatePermission, user }: ListViewServerProps) {
  const docs = data.docs as Doc[]
  const me = (user as Doc | null)?.id

  return (
    <div className="jl">
      <header className="jl-head">
        <div>
          <h1>Usuários</h1>
          <p>
            {data.totalDocs} pessoa{data.totalDocs === 1 ? '' : 's'} com acesso ao painel
          </p>
        </div>
        {hasCreatePermission && (
          <Link className="jd-btn" href="/admin/collections/users/create">
            + Adicionar pessoa
          </Link>
        )}
      </header>

      <TeamList docs={docs} me={me} />
    </div>
  )
}
