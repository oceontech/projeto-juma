'use client'

import { useEffect, useState } from 'react'

import { lexicalToBlocks } from '../../../features/ai/lexical'
import { blocksWords, readBlocks } from '../../../features/articles/blocks'
import { usePostForm } from './usePostForm'

/**
 * Progresso do post na faixa dos botões (mesma linha de "Salvar rascunho" e
 * "Publicar"): um anel com a porcentagem e as 4 etapas. As etapas são as abas
 * do Payload, que ficam escondidas; clicar aqui aciona a aba certa.
 */

type Site = 'br' | 'us'
type Check = { label: string; ok: boolean }
const STEPS = ['Assunto', 'Texto', 'Capa', 'Publicação'] as const

const hasText = (v: unknown) => typeof v === 'string' && v.trim().length > 0

function checksFor(site: Site, v: Record<string, any>): Check[][] {
  const us = site === 'us'
  const words = blocksWords(us ? lexicalToBlocks(v.body) : readBlocks(v.conteudo))
  return [
    [
      { label: 'título', ok: hasText(us ? v.title : v.titulo) },
      { label: us ? 'resumo' : 'subtítulo', ok: hasText(us ? v.excerpt : v.subtitulo) },
      { label: 'categoria', ok: Boolean(v.tema) },
    ],
    [{ label: 'texto', ok: words >= 20 }],
    [{ label: 'foto de capa', ok: Boolean(us ? v.cover : v.capa) }],
    [
      { label: 'endereço', ok: hasText(v.slug) },
      { label: 'data', ok: Boolean(us ? v.date : v.data) },
    ],
  ]
}

const tabButtons = () => [...document.querySelectorAll<HTMLButtonElement>('.tabs-field__tab-button')]

export function PostProgress(props: { site?: Site }) {
  const site: Site = props.site === 'us' ? 'us' : 'br'
  const { values } = usePostForm()
  const [active, setActive] = useState(0)

  // Acompanha a aba ativa (inclusive quando os botões "Próximo" trocam de etapa).
  useEffect(() => {
    const read = () => {
      const i = tabButtons().findIndex((b) => b.classList.contains('tabs-field__tab-button--active'))
      if (i >= 0) setActive(i)
    }
    read()
    const obs = new MutationObserver(read)
    obs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  // A barra do editor gruda logo abaixo da faixa dos botões; conta só a parte visível dela.
  useEffect(() => {
    const controls = document.querySelector<HTMLElement>('.doc-controls')
    const edit = document.querySelector<HTMLElement>('.collection-edit')
    if (!controls || !edit) return
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

  const steps = checksFor(site, values)
  const all = steps.flat()
  const pct = Math.round((all.filter((c) => c.ok).length / all.length) * 100)
  const R = 15
  const C = 2 * Math.PI * R

  const go = (i: number) => {
    tabButtons()[i]?.click()
    setActive(i)
    document.querySelector('.document-fields__edit')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="jpp" aria-label="Etapas do post">
      <span className={`jpp__ring${pct === 100 ? ' is-done' : ''}`} title={pct === 100 ? 'Pronto para publicar' : `${pct}% pronto`}>
        <svg viewBox="0 0 36 36" aria-hidden>
          <circle cx="18" cy="18" r={R} />
          <circle cx="18" cy="18" r={R} style={{ strokeDasharray: C, strokeDashoffset: C * (1 - pct / 100) }} />
        </svg>
        <b>{pct}%</b>
      </span>
      <ol className="jpp__steps">
        {STEPS.map((label, i) => {
          const checks = steps[i]
          const complete = checks.every((c) => c.ok)
          const missing = checks.filter((c) => !c.ok).map((c) => c.label)
          return (
            <li key={label}>
              <button
                type="button"
                className={`jpp__step${i === active ? ' is-active' : ''}${complete ? ' is-done' : ''}`}
                onClick={() => go(i)}
                aria-current={i === active ? 'step' : undefined}
                title={complete ? `${label}: completo` : `${label}: falta ${missing.join(', ')}`}
              >
                <span className="jpp__dot">{complete ? '✓' : i + 1}</span>
                <span className="jpp__label">{label}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
