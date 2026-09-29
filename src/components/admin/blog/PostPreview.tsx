'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * Prévia ao lado do formulário do post:
 * - Matéria: a página de verdade do site, num iframe que recebe o rascunho
 *   por postMessage (atualiza enquanto a pessoa digita);
 * - Card: como aparece na lista do blog;
 * - Google: como aparece na busca.
 * "Tela cheia" abre a página em tamanho real, no computador ou no celular.
 */

export type Frame = { src: string; origin: string; message: unknown }

const DEVICES = { desktop: { width: 1280, label: 'Computador' }, mobile: { width: 390, label: 'Celular' } } as const

/** Iframe da página do site, escalado para caber na largura disponível. */
function SiteFrame({ frame, width: base, height, className = '', fill }: { frame: Frame; width: number; height?: number; className?: string; fill?: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const iframe = useRef<HTMLIFrameElement>(null)
  const ready = useRef(false)
  const [scale, setScale] = useState(0.3)
  const [boxHeight, setBoxHeight] = useState(0)
  const [boxWidth, setBoxWidth] = useState(0)
  // Em tela cheia no computador, a página usa a largura toda (sem faixa sobrando).
  const width = fill ? Math.max(base, boxWidth) : base

  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      // Escondido (outra aba), a largura é zero: mantém a última medida.
      if (!el.clientWidth) return
      setBoxWidth(el.clientWidth)
      setScale(Math.min(1, el.clientWidth / (fill ? Math.max(base, el.clientWidth) : base)))
      setBoxHeight(el.clientHeight)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [base, fill])

  const latest = useRef(frame.message)
  latest.current = frame.message
  // O aviso de "pronta" pode chegar antes do onLoad do iframe: por isso não se zera no onLoad.
  const send = () => iframe.current?.contentWindow?.postMessage(latest.current, frame.origin)

  // A página avisa quando está pronta; a partir daí, cada mudança vai com uma pequena espera.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== iframe.current?.contentWindow || e.data?.type !== 'juma:preview-ready') return
      ready.current = true
      send()
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame.origin])

  useEffect(() => {
    if (!ready.current) return
    const t = window.setTimeout(send, 450)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(frame.message)])

  return (
    <div ref={box} className={`jpv-frame ${className}`} style={height ? { height } : undefined}>
      <iframe
        ref={iframe}
        src={frame.src}
        title="Prévia da página"
        style={{ width, height: boxHeight / scale || 2000, transform: `scale(${scale})` }}
      />
    </div>
  )
}

function Fullscreen({ frame, onClose }: { frame: Frame; onClose: () => void }) {
  const [device, setDevice] = useState<keyof typeof DEVICES>('desktop')
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return createPortal(
    <div className="jpv-full" role="dialog" aria-modal="true" aria-label="Prévia em tela cheia">
      <header className="jpv-full__bar">
        <b>Prévia da matéria</b>
        <div className="jsp" role="radiogroup" aria-label="Aparelho">
          {(Object.keys(DEVICES) as (keyof typeof DEVICES)[]).map((d) => (
            <button key={d} type="button" role="radio" aria-checked={device === d} className={`jsp__opt${device === d ? ' is-active' : ''}`} onClick={() => setDevice(d)}>
              {DEVICES[d].label}
            </button>
          ))}
        </div>
        <button type="button" className="jd-btn jd-btn--ghost" onClick={onClose}>
          Fechar
        </button>
      </header>
      <div className={`jpv-full__stage jpv-full__stage--${device}`}>
        <SiteFrame key={device} frame={frame} width={DEVICES[device].width} fill={device === 'desktop'} className="jpv-frame--full" />
      </div>
    </div>,
    document.body,
  )
}

export function PostPreview({
  frame,
  card,
  google,
}: {
  frame: Frame
  card: ReactNode
  google: { url: string; title: string; description: string }
}) {
  const [tab, setTab] = useState<'page' | 'card' | 'google'>('page')
  const [full, setFull] = useState(false)

  return (
    <aside className="jpv" aria-label="Prévia do post">
      <header className="jpv__head">
        <div className="jsp" role="tablist">
          {(
            [
              ['page', 'Matéria'],
              ['card', 'Card'],
              ['google', 'Google'],
            ] as const
          ).map(([value, label]) => (
            <button key={value} type="button" role="tab" aria-selected={tab === value} className={`jsp__opt${tab === value ? ' is-active' : ''}`} onClick={() => setTab(value)}>
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="jpv__full-btn" onClick={() => setFull(true)} title="Abrir a prévia em tela cheia">
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
          Tela cheia
        </button>
      </header>

      {/* A página fica montada mesmo nas outras abas, para não recarregar ao voltar. */}
      <div hidden={tab !== 'page'}>
        <SiteFrame frame={frame} width={DEVICES.desktop.width} height={560} />
        <p className="jpv__note">Atualiza enquanto você escreve. Nada vai ao ar antes de publicar.</p>
      </div>
      {tab === 'card' && <div className="jpv__card">{card}</div>}
      {tab === 'google' && (
        <div className="jpv__google">
          <small>{google.url}</small>
          <b>{google.title || 'Título do post'}</b>
          <p>{google.description || 'O resumo aparece aqui. Sem ele, o Google escolhe um trecho do texto.'}</p>
        </div>
      )}

      {full && <Fullscreen frame={frame} onClose={() => setFull(false)} />}
    </aside>
  )
}

export const paragraphs = (text?: string | null) =>
  (text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
