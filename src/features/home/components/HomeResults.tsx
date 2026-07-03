'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { EASE } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'

const RESULTS = [
  {
    prefix: '',
    value: 40,
    suffix: 'anos+',
    decimals: 0,
    label: 'de história no campo, ao lado de grandes e pequenos produtores brasileiros.',
    source: '',
  },
  {
    prefix: '+',
    value: 14,
    suffix: 'sc/ha',
    decimals: 0,
    label: 'em soja com Aminosan, em ensaios de campo conduzidos por produtores parceiros.',
    source: 'Soja · Aminosan',
  },
  {
    prefix: '+',
    value: 13.4,
    suffix: 'sc/ha',
    decimals: 1,
    label: 'em milho com Acorda Ultra, em manejo nutricional completo de safra.',
    source: 'Milho · Acorda Ultra',
  },
  {
    prefix: '+',
    value: 6.87,
    suffix: 't/ha',
    decimals: 2,
    label: 'de colmos em cana com Acorda Cana, no acumulado da safra.',
    source: 'Cana · Acorda Cana',
  },
]

export function HomeResults() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (reduced || !ref.current) return

    const cells = gsap.utils.toArray<HTMLElement>('[data-result-cell]', ref.current)

    cells.forEach((cell, i) => {
      const numEl = cell.querySelector<HTMLElement>('[data-count]')
      const labelEl = cell.querySelector<HTMLElement>('[data-label]')

      gsap.set(cell, { opacity: 0, y: 20 })

      ScrollTrigger.create({
        trigger: cell,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          const delay = i * 0.12
          gsap.to(cell, { opacity: 1, y: 0, duration: 0.6, delay, ease: EASE.reveal })
          if (labelEl) gsap.to(labelEl, { opacity: 1, y: 0, duration: 0.5, delay: delay + 0.2, ease: EASE.reveal })

          if (numEl) {
            const target = parseFloat(numEl.dataset.count || '0')
            const decs = parseInt(numEl.dataset.decimals || '0')
            const pfx = numEl.dataset.prefix || ''
            const obj = { v: 0 }
            gsap.to(obj, {
              v: target,
              duration: 2,
              delay: delay + 0.1,
              ease: 'power2.out',
              onUpdate() {
                if (!numEl) return
                numEl.textContent = pfx + obj.v.toFixed(decs).replace('.', ',')
              },
            })
          }
        },
      })
    })
  }, { scope: ref })

  return (
    <section
      ref={ref}
      style={{ backgroundColor: '#004B26', paddingBlock: 'clamp(80px,8vw,120px)' }}
    >
      <Container>
        {/* Cabeçalho */}
        <div className="mb-14">
          <span
            className="inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] uppercase rounded-full px-4 py-2 mb-5 border"
            style={{ borderColor: 'rgba(255,255,255,.20)', color: 'rgba(255,255,255,.75)' }}
          >
            <span className="w-[6px] h-[6px] rounded-full bg-[#F0E27A] inline-block" />
            Resultados comprovados
          </span>
          <h2
            className="font-black text-[clamp(32px,4vw,52px)] leading-[1.05] tracking-[-0.02em] text-white max-w-[18ch]"
          >
            Números que vêm do campo.
          </h2>
        </div>

        {/* Grid de resultados */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {RESULTS.map((r, i) => (
            <div
              key={i}
              data-result-cell
              className="rounded-[20px] p-6 lg:p-8 flex flex-col gap-4"
              style={{ backgroundColor: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.10)' }}
            >
              <div
                className="flex flex-wrap items-baseline gap-x-1.5 font-black leading-none tracking-[-0.03em]"
                style={{ fontSize: 'clamp(42px,5vw,64px)', color: '#F0E27A' }}
              >
                <span
                  data-count={r.value}
                  data-decimals={r.decimals}
                  data-prefix={r.prefix}
                >
                  {r.prefix}{r.value.toFixed(r.decimals).replace('.', ',')}
                </span>
                <span
                  className="text-[0.38em] font-bold align-baseline"
                  style={{ color: 'rgba(240,226,122,.60)' }}
                >
                  {r.suffix}
                </span>
              </div>
              <p
                data-label
                className="text-[14px] leading-[1.55]"
                style={{ color: 'rgba(255,255,255,.65)', opacity: 0 }}
              >
                {r.label}
              </p>
              {r.source && (
                <span
                  className="text-[12px] font-semibold tracking-[0.06em] uppercase"
                  style={{ color: 'rgba(240,226,122,.50)' }}
                >
                  {r.source}
                </span>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
