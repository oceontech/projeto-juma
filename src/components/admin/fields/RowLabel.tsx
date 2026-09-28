'use client'

import { useRowLabel } from '@payloadcms/ui'

/**
 * Rótulo das linhas de uma lista (array) no painel: mostra o conteúdo da linha
 * ("Tratamento de sementes") em vez de "Seção 01". Configurado por clientProps:
 *   RowLabel: { path: '/components/admin/fields/RowLabel#RowLabel', clientProps: { fields: ['titulo'], fallback: 'Seção' } }
 */
type Props = { fields: string[]; fallback: string; separator?: string }

export function RowLabel({ fields, fallback, separator = ' · ' }: Props) {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>()
  const text = fields
    .map((f) => data?.[f])
    .filter((v): v is string => typeof v === 'string' && v.trim() !== '')
    .join(separator)
    .replace(/\s+/g, ' ')
  const n = String((rowNumber ?? 0) + 1).padStart(2, '0')
  return (
    <span className="jf-rowlabel">
      <i>{n}</i>
      {text ? (text.length > 90 ? `${text.slice(0, 90)}…` : text) : `${fallback} sem título`}
    </span>
  )
}
