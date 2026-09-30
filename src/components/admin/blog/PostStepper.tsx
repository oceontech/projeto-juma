'use client'

import type { UIFieldClientComponent } from 'payload'
import { useEffect, useState } from 'react'

import { usePostForm } from './usePostForm'

/**
 * Progresso do post no alto do formulário: quanto já está pronto e as 4
 * etapas (Assunto, Capa, Texto, Publicação), cada uma dizendo o que falta.
 * As etapas continuam sendo as abas do Payload, que ficam escondidas: clicar
 * aqui aciona a aba certa.
 */

type Site = 'br' | 'us'
type Check = { label: string; ok: boolean }
const STEPS = ['Assunto', 'Texto', 'Capa', 'Publicação'] as const

const hasText = (v: unknown) => typeof v === 'string' && v.trim().length > 0
const richTextHasContent = (v: unknown) =>
  JSON.stringify(v ?? '')
    .match(/"text":"([^"]*)"/g)
    ?.some((m) => m.length > 9) ?? false

function checksFor(site: Site, v: Record<string, any>, sections: { paragrafos?: string }[]): Check[][] {
  if (site === 'us') {
    return [
      [
        { label: 'título', ok: hasText(v.title) },
        { label: 'resumo', ok: hasText(v.excerpt) },
        { label: 'categoria', ok: Boolean(v.tema) },
      ],
      [{ label: 'texto', ok: richTextHasContent(v.body) }],
      [{ label: 'foto de capa', ok: Boolean(v.cover) }],
      [
        { label: 'endereço', ok: hasText(v.slug) },
        { label: 'data', ok: Boolean(v.date) },
      ],
    ]
  }
  return [
    [
      { label: 'título', ok: hasText(v.titulo) },
      { label: 'subtítulo', ok: hasText(v.subtitulo) },
      { label: 'categoria', ok: Boolean(v.tema) },
    ],
    [{ label: 'texto', ok: hasText(v.introducao) || sections.some((s) => hasText(s.paragrafos)) }],
    [{ label: 'foto de capa', ok: Boolean(v.capa) }],
    [
      { label: 'endereço', ok: hasText(v.slug) },
      { label: 'data', ok: Boolean(v.data) },
    ],
  ]
}

function tabButtons() {
  return [...document.querySelectorAll<HTMLButtonElement>('.tabs-field__tab-button')]
}

export const PostStepper: UIFieldClientComponent = (props) => {
  const { site } = props as unknown as { site: Site }
  const { values, sections } = usePostForm()
  const [active, setActive] = useState(0)

  // Acompanha a aba ativa (inclusive quando os botões "Próximo" trocam de etapa).
  useEffect(() => {
    const read = () => {
      const i = tabButtons().findIndex((b) => b.classList.contains('tabs-field__tab-button--active'))
      if (i >= 0) setActive(i)
    }
    read()
    const wrap = document.querySelector('.tabs-field__tabs')
    if (!wrap) return
    const obs = new MutationObserver(read)
    obs.observe(wrap, { subtree: true, attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  // A barra de etapas gruda logo abaixo da faixa dos botões; a altura dela muda no celular.
  useEffect(() => {
    const controls = document.querySelector<HTMLElement>('.doc-controls')
    const edit = document.querySelector<HTMLElement>('.collection-edit')
    if (!controls || !edit) return
    // Conta só a parte que fica visível grudada (no celular a faixa gruda deslocada para cima).
    const sync = () => {
      const cs = getComputedStyle(controls)
      const visible = cs.position === 'sticky' ? controls.offsetHeight + (parseFloat(cs.top) || 0) : 0
      edit.style.setProperty('--jdoc-controls-h', `${Math.max(0, visible)}px`)
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(controls)
    return () => ro.disconnect()
  }, [])

  const steps = checksFor(site, values, sections)
  const all = steps.flat()
  const done = all.filter((c) => c.ok).length
  const pct = Math.round((done / all.length) * 100)

  const go = (i: number) => {
    tabButtons()[i]?.click()
    setActive(i)
  }

  return (
    <nav className="jps2" aria-label="Etapas do post">
      <div className="jps2__top">
        <span className="jps2__title">
          {pct === 100 ? 'Pronto para publicar' : 'Progresso do post'}
        </span>
        <span className="jps2__pct">{pct}%</span>
      </div>
      <div className="jps2__bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <ol className="jps2__steps">
        {STEPS.map((label, i) => {
          const checks = steps[i]
          const complete = checks.every((c) => c.ok)
          const missing = checks.filter((c) => !c.ok).map((c) => c.label)
          const state = i === active ? 'is-active' : complete ? 'is-done' : ''
          return (
            <li key={label}>
              <button type="button" className={`jps2__step ${state}`} onClick={() => go(i)} aria-current={i === active ? 'step' : undefined}>
                <span className="jps2__dot">{complete && i !== active ? '✓' : i + 1}</span>
                <span className="jps2__text">
                  <b>{label}</b>
                  <small>{complete ? 'Completo' : `Falta ${missing.join(', ')}`}</small>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
