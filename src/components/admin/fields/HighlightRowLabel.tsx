'use client'

import { useRowLabel } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

/** Linha dos Destaques da home: "2º · Acorda Ultra" (o Aminosan é o 1º). */
export function HighlightRowLabel() {
  const { data, rowNumber } = useRowLabel<{ produto?: number | { id: number; nome?: string } | null }>()
  const ref = data?.produto
  const id = typeof ref === 'object' && ref ? ref.id : ref
  const [name, setName] = useState<string | null>(typeof ref === 'object' && ref?.nome ? ref.nome : null)

  useEffect(() => {
    if (!id || (typeof ref === 'object' && ref?.nome)) return
    let alive = true
    fetch(`/api/products/${id}?depth=0&select[nome]=true`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((doc) => alive && setName(doc?.nome ?? null))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [id, ref])

  const position = (rowNumber ?? 0) + 2
  return (
    <span className="jf-rowlabel">
      <i>{position}º</i>
      {name ?? (id ? 'carregando…' : 'Escolha o produto')}
    </span>
  )
}
