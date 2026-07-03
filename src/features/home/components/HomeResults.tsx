'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, SplitText } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
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

      cells.forEach((cell) => {
        gsap.set(cell, { opacity: 0, y: 20, filter: 'blur(8px)' })
      })

      // Animação do cabeçalho
      const header = ref.current.querySelector<HTMLElement>('[data-header]')
      let split: SplitText | null = null;
      if (header) {
        const kicker = header.querySelector<HTMLElement>('[data-kicker]')
        const title = header.querySelector<HTMLElement>('[data-title]')
        const line = header.querySelector<HTMLElement>('[data-gline]')

        split = title ? new SplitText(title, { type: 'chars,words' }) : null

        if (kicker) gsap.set(kicker, { y: 14, opacity: 0 })
        if (split) gsap.set(split.chars, { x: 20, opacity: 0, filter: 'blur(10px)' })
        if (line) gsap.set(line, { scaleX: 0, opacity: 0, transformOrigin: 'left center' })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: header,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'play reverse play reverse',
          },
          defaults: { ease: EASE.reveal }
        })
        if (kicker) tl.to(kicker, { y: 0, opacity: 1, duration: DUR.sub })
        if (split) tl.to(split.chars, { x: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.char }, '-=0.4')
        if (line) tl.to(line, { scaleX: 1, opacity: 1, duration: DUR.sub }, '-=0.4')
      }

      cells.forEach((cell, i) => {
        const numEl = cell.querySelector<HTMLElement>('[data-count]')
        const labelEl = cell.querySelector<HTMLElement>('[data-label]')
  
        ScrollTrigger.create({
          trigger: cell,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'play reverse play reverse',
          onEnter: () => {
            const delay = i * 0.12
            gsap.to(cell, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, delay, ease: EASE.reveal })
            if (labelEl) gsap.to(labelEl, { opacity: 1, y: 0, duration: 0.5, delay: delay + 0.2, ease: EASE.reveal })

            if (numEl) {
              const target = parseFloat(numEl.dataset.count || '0')
              const decs = parseInt(numEl.dataset.decimals || '0')
              const pfx = numEl.dataset.prefix || ''
              const obj = { v: 0 }
              gsap.to(obj, {
                v: target,
                duration: 2.2,
                delay: delay + 0.15,
                ease: 'power2.out',
                onUpdate: () => {
                  const n = obj.v
                  numEl.textContent = pfx + (decs > 0 ? n.toFixed(decs).replace('.', ',') : Math.round(n).toString())
                },
              })
            }
          },
          onLeave: () => {
            gsap.to(cell, { opacity: 0, y: -20, filter: 'blur(8px)', duration: 0.5 })
          },
          onEnterBack: () => {
            gsap.to(cell, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5 })
          },
          onLeaveBack: () => {
            gsap.to(cell, { opacity: 0, y: 20, filter: 'blur(8px)', duration: 0.5 })
          }
        })
      })

    return () => split?.revert()
  }, { scope: ref })

  return (
    <section
      ref={ref}
      style={{ backgroundColor: '#004B26', paddingBlock: 'clamp(80px,8vw,120px)' }}
    >
      <Container>
        {/* Cabeçalho */}
        <div className="mb-14" data-header>
          <span
            data-kicker
            className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] uppercase rounded-full px-4 py-2 mb-6 border"
            style={{ borderColor: 'rgba(255,255,255,.20)', color: 'rgba(255,255,255,.80)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#F0E27A] inline-block" />
            Resultados comprovados
          </span>
          <h2
            data-title
            className="font-black text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-tight text-white uppercase max-w-[18ch]"
          >
            Números que vêm do <span className="text-[#F0E27A] text-highlight inline-block">campo.</span>
          </h2>
          <span data-gline aria-hidden className="mt-8 block h-[3px] w-12 rounded-full bg-[#F0E27A]" />
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
