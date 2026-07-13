'use client'

import { useCallback, useEffect, useRef } from 'react'
import createGlobe from 'cobe'

export type GlobeMarker = {
  location: [number, number]
  size?: number
  color?: [number, number, number]
}

interface GlobeProps {
  markers: GlobeMarker[]
  /** ponto [lat, lng] que fica de frente em repouso (composição fixa) */
  focus: [number, number]
  className?: string
  /** avisa o pai quando o usuário está arrastando (para esmaecer os cards) */
  onDragChange?: (dragging: boolean) => void
}

/** Converte lat/lng no par phi/theta que centraliza o ponto (convenção do cobe). */
function locationToAngles(lat: number, lng: number): [number, number] {
  return [Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180]
}

/**
 * Globo pontilhado claro (cobe/WebGL) com pins verdes. Sem rotação automática:
 * a composição fica fixa mostrando as Américas, para os cards e conectores da
 * seção apontarem sempre para os pins. O usuário pode girar arrastando; ao
 * soltar, o globo volta suavemente à orientação inicial (spring-back).
 */
export function Globe({ markers, focus, className = '', onDragChange }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const drag = useRef({ phi: 0, theta: 0 }) // delta do arrasto em curso
  const rest = useRef({ phi: 0, theta: 0 }) // offset acumulado que decai a zero
  const onDragChangeRef = useRef(onDragChange)
  useEffect(() => {
    onDragChangeRef.current = onDragChange
  }, [onDragChange])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing'
    onDragChangeRef.current?.(true)
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!pointerStart.current) return
      drag.current = {
        phi: (e.clientX - pointerStart.current.x) / 240,
        theta: -(e.clientY - pointerStart.current.y) / 900,
      }
    }
    const handlePointerUp = () => {
      if (!pointerStart.current) return
      // acumula o delta e deixa o loop de render decair de volta ao repouso
      rest.current.phi += drag.current.phi
      rest.current.theta += drag.current.theta
      drag.current = { phi: 0, theta: 0 }
      pointerStart.current = null
      if (canvasRef.current) canvasRef.current.style.cursor = 'grab'
      onDragChangeRef.current?.(false)
    }
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerup', handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const [homePhi, homeTheta] = locationToAngles(focus[0], focus[1])
    let globe: ReturnType<typeof createGlobe> | null = null
    let ro: ResizeObserver | null = null
    let rafId = 0

    const init = () => {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: width * dpr,
        height: width * dpr,
        phi: homePhi,
        theta: homeTheta,
        dark: 0,
        diffuse: 1.2,
        mapSamples: 22000,
        mapBrightness: 6,
        baseColor: [1, 1, 1], // esfera branca com pontos acinzentados (ref)
        markerColor: [0.0, 0.62, 0.3], // verde Juma nos pins
        glowColor: [0.94, 0.95, 0.93],
        opacity: 0.92,
        markers: markers.map((m) => ({ location: m.location, size: m.size ?? 0.05, color: m.color })),
      })

      const tick = () => {
        // sem interação, o offset decai (~1s) e o globo volta ao enquadramento
        if (!pointerStart.current) {
          rest.current.phi *= 0.94
          rest.current.theta *= 0.94
        }
        globe?.update({
          phi: homePhi + rest.current.phi + drag.current.phi,
          theta: homeTheta + rest.current.theta + drag.current.theta,
        })
        rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)
      requestAnimationFrame(() => {
        canvas.style.opacity = '1'
      })
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      ro = new ResizeObserver((entries) => {
        if ((entries[0]?.contentRect.width ?? 0) > 0) {
          ro?.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      ro?.disconnect()
      cancelAnimationFrame(rafId)
      globe?.destroy()
    }
  }, [markers, focus])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      onPointerDown={handlePointerDown}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        cursor: 'grab',
        opacity: 0,
        transition: 'opacity 1.2s ease',
        touchAction: 'pan-y',
        contain: 'layout paint size',
      }}
    />
  )
}
