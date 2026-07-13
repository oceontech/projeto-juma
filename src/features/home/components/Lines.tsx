'use client'

import { Package } from 'lucide-react'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'

import { gsap, SplitText, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'

type LineKey = 'nutricao' | 'arranque' | 'protecao' | 'manejos' | 'aplicacao'

const LINE_COLORS: Record<LineKey, { accent: string; text: string; image: string }> = {
  nutricao: { accent: '#006838', text: '#fff', image: '/assets/linha-produtos/little-leaf.webp' },
  arranque: { accent: '#008dc2', text: '#fff', image: '/assets/linha-produtos/rabanete.webp' },
  protecao: { accent: '#ad1115', text: '#fff', image: '/assets/linha-produtos/bug-leaf.webp' },
  manejos:  { accent: '#312783', text: '#fff', image: '/assets/linha-produtos/big-leaf.webp' },
  aplicacao: { accent: '#79ab34', text: '#1f2e0a', image: '/assets/linha-produtos/water-leaf.webp' },
}

const LINES: LineKey[] = ['nutricao', 'arranque', 'protecao', 'manejos', 'aplicacao']

export function Lines() {
  const t       = useTranslations('lines')
  const reduced = useReducedMotion()
  const ref     = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useGSAP(
    () => {
      if (reduced || !ref.current) return

      // Título: SplitText caracteres
      const title = titleRef.current
      const split = title
        ? new SplitText(title, { type: 'chars,lines' })
        : null
      const chars = split?.chars ?? []

      if (title) gsap.set(title, { opacity: 0 })
      if (chars.length) gsap.set(chars, { x: 20, opacity: 0, filter: 'blur(10px)' })

      const tlHead = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'play reverse play reverse',
        },
      })
      
      const gline = ref.current.querySelector<HTMLElement>('[data-gline]')
      if (gline) gsap.set(gline, { scaleX: 0, opacity: 0, transformOrigin: 'left center' })

      if (title) tlHead.set(title, { opacity: 1 }, 0)
      if (chars.length)
        tlHead.to(chars, { x: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.char, ease: EASE.reveal }, 0)
        
      if (gline)
        tlHead.to(gline, { scaleX: 1, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.2)

      // Cards de linha: animações responsivas
      const cards = gsap.utils.toArray<HTMLElement>('[data-line-card]', ref.current)

      if (cards.length > 0) {
        const mm = gsap.matchMedia()

        // Desktop e Tablet (sm em diante) - Stagger no grupo
        mm.add('(min-width: 640px)', () => {
          gsap.set(cards, { opacity: 0, filter: 'blur(12px)' })

          const tlCards = gsap.timeline({
            scrollTrigger: {
              trigger: cards[0].parentElement || ref.current,
              start: 'top 85%',
              end: 'bottom 15%',
              toggleActions: 'play reverse play reverse',
            }
          })

          tlCards.to(cards, {
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.4,
            stagger: 0.3,
            ease: 'power3.out'
          })
        })

        // Mobile - ScrollTrigger individual para cada card
        mm.add('(max-width: 639px)', () => {
          cards.forEach((card) => {
            gsap.set(card, { opacity: 0, filter: 'blur(12px)' })

            gsap.to(card, {
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                end: 'bottom 15%',
                toggleActions: 'play reverse play reverse',
              },
              opacity: 1,
              filter: 'blur(0px)',
              duration: 1.4,
              ease: 'power3.out'
            })
          })
        })
      }

      return () => {
        split?.revert()
      }
    },
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <section ref={ref} className="bg-white py-4xl lg:py-5xl">
      <Container className="min-[1600px]:max-w-[100rem] min-[2000px]:max-w-[120rem]">

        {/* Cabeçalho */}
        <div className="mb-3xl max-w-[52rem]">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] uppercase rounded-full px-4 py-2 mb-6 border border-primary/20 bg-primary/5 text-primary">
              <Package className="w-3.5 h-3.5 flex-shrink-0" />
              {t('kicker')}
            </span>
          </div>

          <h2
            ref={titleRef}
            className="font-black uppercase leading-[1.05] tracking-tight text-foreground"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
          >
            {t('title')}
          </h2>
          <span data-gline aria-hidden className="mt-8 block h-[3px] w-12 rounded-full bg-primary" />
        </div>

        {/* Grid de linhas — 1 col mobile, 2 col tablet, 6 col desktop */}
        <div className="grid grid-cols-1 gap-xl sm:grid-cols-2 lg:grid-cols-6">
          {LINES.map((key, i) => {
            const { accent, text, image } = LINE_COLORS[key]
            
            // Layout: 3 cards (top), 2 cards (bottom) on desktop
            const spanClass = i < 3 
              ? 'lg:col-span-2' 
              : i === 4 
                ? 'sm:col-span-2 lg:col-span-3' 
                : 'lg:col-span-3'

            // Mobile intercalado (cima / baixo)
            const isMobileImageTop = i % 2 === 0

            const mobileMask = isMobileImageTop 
              ? 'max-sm:[mask-image:linear-gradient(to_bottom,black_40%,transparent)] max-sm:[-webkit-mask-image:linear-gradient(to_bottom,black_40%,transparent)]'
              : 'max-sm:[mask-image:linear-gradient(to_top,black_40%,transparent)] max-sm:[-webkit-mask-image:linear-gradient(to_top,black_40%,transparent)]'

            const desktopMask = 'sm:[mask-image:linear-gradient(to_right,transparent_0%,black_30%)] sm:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_30%)]'

            const mobileImagePos = isMobileImageTop ? 'top-0 h-[65%] w-full' : 'bottom-0 h-[65%] w-full'
            const desktopImagePos = 'sm:top-0 sm:right-0 sm:h-full sm:w-[55%] md:w-[50%]'
            
            const alignClass = isMobileImageTop ? 'mt-auto sm:mt-0' : 'mb-auto sm:mb-0'

            return (
              <Link
                key={key}
                href={`/produtos#${key}`}
                data-line-card
                className={`group relative flex flex-col min-h-[360px] sm:min-h-[240px] overflow-hidden rounded-xl border border-foreground/8 bg-white transition-shadow hover:shadow-lg cursor-pointer ${spanClass}`}
              >
                {/* Imagem de Fundo */}
                <div 
                  className={`absolute pointer-events-none z-0 overflow-hidden ${mobileImagePos} ${desktopImagePos} ${mobileMask} ${desktopMask}`}
                >
                  <div className="w-full h-full relative" data-line-image>
                    <Image 
                      src={image} 
                      alt="" 
                      fill 
                      className="object-cover object-center sm:object-right group-hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                </div>

                {/* Conteúdo */}
                <div
                  data-line-content
                  className={`relative z-10 flex flex-col gap-sm p-xl lg:p-2xl w-full sm:max-w-[80%] lg:max-w-[70%] ${alignClass}`}
                >
                  {/* Título da linha */}
                  <h3
                    data-line-title
                    className="font-black uppercase leading-[1.0] tracking-tight text-foreground"
                    style={{ fontSize: 'clamp(1.05rem, 2vw, 1.25rem)' }}
                  >
                    {t(`${key}.title` as any)}
                  </h3>

                  {/* Produtos */}
                  <p data-line-support className="text-subtitle m-0 text-sm leading-relaxed text-foreground/55 max-w-[90%]">
                    {t(`${key}.support` as any)}
                  </p>

                  {/* Link de linha */}
                  <span
                    data-line-link
                    className="mt-auto inline-flex items-center gap-xs pt-sm text-[11px] font-bold uppercase tracking-[0.14em] text-foreground transition-all group-hover:opacity-70"
                  >
                    {t('viewLine')}
                    {/* Seta simples */}
                    <span aria-hidden className="text-xs transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

      </Container>
    </section>
  )
}
