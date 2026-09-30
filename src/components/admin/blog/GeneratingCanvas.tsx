'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Tela de "criando a imagem" da capa com IA: um campo de bolinhas coloridas
 * que respiram em ondas (como os geradores de imagem), o passo atual e uma
 * barra de progresso estimada. Cobre a área de mídia e o cartão da IA.
 */

type Mode = 'contexto' | 'prompt' | 'aprimorar'

const STEPS: Record<Mode, [number, string][]> = {
  contexto: [
    [0, 'Lendo o título e o texto'],
    [6, 'Escolhendo a cena'],
    [14, 'Fotografando no campo'],
    [26, 'Ajustando luz e cores'],
    [40, 'Revelando a foto'],
    [60, 'Quase lá'],
  ],
  prompt: [
    [0, 'Lendo o seu pedido'],
    [6, 'Montando a cena'],
    [14, 'Fotografando no campo'],
    [26, 'Ajustando luz e cores'],
    [40, 'Revelando a foto'],
    [60, 'Quase lá'],
  ],
  aprimorar: [
    [0, 'Analisando a imagem'],
    [6, 'Entendendo o pedido'],
    [14, 'Aplicando os ajustes'],
    [28, 'Refinando os detalhes'],
    [42, 'Revelando a foto'],
    [60, 'Quase lá'],
  ],
}

/** Verde Juma, lima, azul-céu, âmbar e lilás: colorido, mas da família da marca. */
const PALETTE = [
  [0, 76, 38],
  [34, 197, 94],
  [163, 230, 53],
  [56, 189, 248],
  [245, 158, 11],
  [167, 139, 250],
]

function color(t: number) {
  const x = ((t % 1) + 1) % 1
  const i = Math.floor(x * PALETTE.length)
  const f = x * PALETTE.length - i
  const a = PALETTE[i]
  const b = PALETTE[(i + 1) % PALETTE.length]
  return a.map((v, k) => Math.round(v + (b[k] - v) * f))
}

export function GeneratingCanvas({ mode, expected = 38 }: { mode: Mode; expected?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const t = window.setInterval(() => setElapsed((Date.now() - start) / 1000), 250)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    const el = canvas.current
    const ctx = el?.getContext('2d')
    if (!el || !ctx) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    const resize = () => {
      w = el.clientWidth
      h = el.clientHeight
      el.width = w * dpr
      el.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const gap = 22
    let frame = 0
    const draw = (now: number) => {
      const t = still ? 0 : now / 1000
      ctx.clearRect(0, 0, w, h)
      const cols = Math.ceil(w / gap) + 1
      const rows = Math.ceil(h / gap) + 1
      const ox = (w - (cols - 1) * gap) / 2
      const oy = (h - (rows - 1) * gap) / 2
      // Dois centros de onda que passeiam devagar pela área.
      const c1x = w * (0.5 + 0.32 * Math.sin(t * 0.35))
      const c1y = h * (0.5 + 0.3 * Math.cos(t * 0.27))
      const c2x = w * (0.5 + 0.35 * Math.cos(t * 0.22 + 2))
      const c2y = h * (0.5 + 0.28 * Math.sin(t * 0.31 + 1))
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = ox + i * gap
          const y = oy + j * gap
          const d1 = Math.hypot(x - c1x, y - c1y)
          const d2 = Math.hypot(x - c2x, y - c2y)
          const wave = (Math.sin(d1 / 34 - t * 2.4) + Math.sin(d2 / 46 - t * 1.7)) / 2 // -1..1
          const k = (wave + 1) / 2 // 0..1
          const r = 1.1 + k * k * 3.6
          const [cr, cg, cb] = color(x / w * 0.55 + y / h * 0.25 + t * 0.06)
          ctx.globalAlpha = 0.18 + k * 0.72
          ctx.fillStyle = `rgb(${cr},${cg},${cb})`
          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
      if (!still) frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
    }
  }, [])

  const steps = STEPS[mode]
  const step = [...steps].reverse().find(([at]) => elapsed >= at)?.[1] ?? steps[0][1]
  // Progresso estimado: anda rápido no começo e desacelera perto do fim, sem chegar a 100%.
  const progress = Math.min(96, 100 * (1 - Math.exp(-elapsed / (expected * 0.55))))

  return (
    <div className="jgen" role="status" aria-live="polite">
      <canvas ref={canvas} className="jgen__canvas" aria-hidden />
      <div className="jgen__card">
        <b>{mode === 'aprimorar' ? 'Aprimorando a imagem' : 'Criando a sua capa'}</b>
        <span key={step} className="jgen__step">
          {step}…
        </span>
        <span className="jgen__bar" aria-hidden>
          <i style={{ width: `${progress}%` }} />
        </span>
        <small>{Math.floor(elapsed)} s · costuma levar uns {expected} s</small>
      </div>
    </div>
  )
}
