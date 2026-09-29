'use client'

import type { DefaultCellComponentProps } from 'payload'

/** Célula de lista para campos liga/desliga: etiqueta em vez de "verdadeiro". */
export function BoolCell({ cellData, on = 'Sim', off = 'Não' }: DefaultCellComponentProps & { on?: string; off?: string }) {
  const value = Boolean(cellData)
  return <span className={`jb-cell${value ? ' is-on' : ''}`}>{value ? on : off}</span>
}
