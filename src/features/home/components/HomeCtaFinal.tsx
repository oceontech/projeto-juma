'use client'

import { Rocket } from 'lucide-react'

import { useRef } from 'react'
import Image from 'next/image'
import { Container } from '@/components/layout/Container'
import { useTranslations } from 'next-intl'
import { gsap, ScrollTrigger, useGSAP, SplitText } from '@/features/animation/gsap'
import { STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'

export function HomeCtaFinal() {
  const t = useTranslations('homeCtaFinal');
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (reduced || !ref.current) return
    const section = ref.current

    const bg        = section.querySelector<HTMLElement>('[data-bg-reveal]')
    const globe     = section.querySelector<HTMLElement>('[data-globe]')
    const container = section.querySelector<HTMLElement>('[data-cta-container]')
    let split: SplitText | null = null;

    if (container && globe) {
      const kicker = container.querySelector<HTMLElement>('[data-kicker]')
      const title  = container.querySelector<HTMLElement>('[data-title]')
      const line   = container.querySelector<HTMLElement>('[data-gline]')
      const desc   = container.querySelector<HTMLElement>('[data-desc]')

      split = title ? new SplitText(title, { type: 'chars,words' }) : null

      // Quanto o globo precisa subir pra sair do seu repouso (encostado no
      // rodapé da seção) e ficar encostado no TOPO da seção — função (não
      // valor fixo) porque roda nos dois lugares: no set() inicial e de novo
      // a cada refresh do ScrollTrigger (invalidateOnRefresh), reagindo a
      // resize sem ficar com a distância errada depois de uma mudança de
      // layout.
      const travel = () => {
        const sectionH = section.getBoundingClientRect().height
        const globeH   = globe.getBoundingClientRect().height
        return -(sectionH - globeH)
      }

      gsap.set(globe, { y: travel })
      if (bg) gsap.set(bg, { clipPath: 'inset(100% 0% 0% 0%)' })
      gsap.set(container, { opacity: 0, filter: 'blur(6px)' })
      if (kicker) gsap.set(kicker, { y: 14, opacity: 0 })
      if (split) gsap.set(split.chars, { x: 20, opacity: 0, filter: 'blur(10px)' })
      if (line) gsap.set(line, { scaleX: 0, opacity: 0, transformOrigin: 'left center' })
      if (desc) gsap.set(desc, { y: 20, opacity: 0 })

      // Tudo preso ao scroll (scrub), não a um play-once — é o pedido: o
      // globo já entra visível junto com a seção (start: 'top bottom', ou
      // seja, o gatilho começa no instante em que o topo da seção toca a
      // base da tela — mal a seção das matérias termina) e desce conforme
      // o usuário rola, arrastando o azul e o texto atrás dele. `end: 'top
      // top'` fecha o trajeto em 1 altura de tela — rolagem previsível, sem
      // exigir dezenas de vh vazios. Sem toggleActions: scrub já cobre os
      // dois sentidos sozinho, e diferente do play-once, NÃO reverte sozinho
      // ao passar do fim — fica parado no estado final até vir scroll de volta.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'top top',
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
        defaults: { ease: 'none' },
      })

      tl.to(globe, { y: 0, duration: 1 }, 0)
      if (bg) tl.to(bg, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }, 0)

      // Texto só aparece perto do fim do trajeto do globo — quando ele já
      // desceu o bastante pra ter saído de cima da área do texto.
      tl.to(container, { opacity: 1, filter: 'blur(0px)', duration: 0.35 }, 0.55)
      if (kicker) tl.to(kicker, { y: 0, opacity: 1, duration: 0.3 }, 0.55)
      if (split) tl.to(split.chars, { x: 0, opacity: 1, filter: 'blur(0px)', duration: 0.3, stagger: STAGGER.char }, 0.62)
      if (line) tl.to(line, { scaleX: 1, opacity: 1, duration: 0.15 }, 0.78)
      if (desc) tl.to(desc, { y: 0, opacity: 1, duration: 0.2 }, 0.85)
    }

    return () => split?.revert()
  }, { scope: ref })

  return (
    <section
      ref={ref}
      id="whatsapp"
      className="relative overflow-hidden"
      style={{
        paddingTop: 'clamp(80px,8vw,120px)',
        paddingBottom: 'clamp(260px,30vw,440px)',
      }}
    >
      {/* z-0 — fundo azul: plano isolado só pra poder animar o clip-path
          sem mexer no resto (ver useGSAP acima). */}
      <div data-bg-reveal aria-hidden className="absolute inset-0 z-0" style={{ backgroundColor: '#0f2a50' }} />

      <Container className="relative z-10">
        <div data-cta-container className="flex flex-col items-center text-center gap-8">
          <div className="mb-4" data-kicker>
            <span className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] uppercase rounded-full px-4 py-2 border border-white/20 text-white/80">
              <Rocket className="w-3.5 h-3.5 flex-shrink-0 text-[#64A142]" />
              {t('kicker')}
            </span>
          </div>

          <h2
            data-title
            className="font-black uppercase leading-[1.05] tracking-tight text-white max-w-[14ch]"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
          >
            {t('titlePart1')} <span className="text-[#64A142] text-highlight inline-block">{t('titleHighlight')}</span>
          </h2>
          <span data-gline aria-hidden className="mb-4 block h-[3px] w-12 rounded-full bg-[#64A142]" />

          <p data-desc className="text-[18px] leading-[1.6] max-w-[44ch]" style={{ color: 'rgba(255,255,255,.65)' }}>
            {t('desc')}
          </p>
        </div>
      </Container>

      {/* Globo: repousa encostado no rodapé da seção (h-[…] responsivo).
          A `travel()` do useGSAP começa ele encostado no TOPO da seção —
          logo, cobrindo a área onde o texto mora — e ele desce até aqui
          conforme o usuário rola. object-bottom porque o PNG já vem com o
          topo transparente e a curva da Terra colada na base.
          z-20 (à frente do fundo E do texto): no repouso não faz diferença,
          eles não se tocam mais — mas durante o trajeto é o que deixa o
          azul e o texto "nascendo atrás dele" de verdade. */}
      <div
        data-globe
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[220px] sm:h-[280px] md:h-[360px] lg:h-[420px]"
      >
        <Image
          src="/cta-final/globo-terra.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-bottom"
        />
      </div>
    </section>
  )
}
