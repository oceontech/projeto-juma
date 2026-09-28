'use client'

import type { DefaultCellComponentProps } from 'payload'

/** Pílulas coloridas da lista de leads (mesmas cores da Visão geral). */
const STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  novo: { label: 'Novo', bg: '#dcfce7', fg: '#166534' },
  'em-contato': { label: 'Em contato', bg: '#fef3c7', fg: '#92400e' },
  qualificado: { label: 'Qualificado', bg: '#dbeafe', fg: '#1e40af' },
  convertido: { label: 'Convertido', bg: '#004c26', fg: '#ffffff' },
  descartado: { label: 'Descartado', bg: '#f4f4f5', fg: '#71717a' },
}

const pill = (bg: string, fg: string) =>
  ({ display: 'inline-flex', padding: '4px 10px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, background: bg, color: fg, whiteSpace: 'nowrap' }) as const

export function StatusCell({ cellData }: DefaultCellComponentProps) {
  const s = STATUS[String(cellData)] ?? STATUS.novo
  return <span style={pill(s.bg, s.fg)}>{s.label}</span>
}

export function SiteCell({ cellData }: DefaultCellComponentProps) {
  const us = cellData === 'us'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          display: 'grid',
          placeItems: 'center',
          width: 26,
          height: 26,
          borderRadius: 999,
          fontSize: 10,
          fontWeight: 700,
          color: '#fff',
          background: us ? 'linear-gradient(145deg,#60a5fa,#1d4ed8)' : 'linear-gradient(145deg,#22c55e,#15803d)',
        }}
      >
        {us ? 'US' : 'BR'}
      </span>
      {us ? 'Estados Unidos' : 'Brasil'}
    </span>
  )
}
