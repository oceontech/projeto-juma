'use client'

import { Rocket } from 'lucide-react'

import { useRef } from 'react'
import Image from 'next/image'
import { Container } from '@/components/layout/Container'
import { useTranslations } from 'next-intl'
import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { createCharReveal } from '@/features/animation/charReveal'

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
    let reveal: ReturnType<typeof createCharReveal> = null
    let mm: gsap.MatchMedia | null = null

    if (container && globe) {
      const kicker = container.querySelector<HTMLElement>('[data-kicker]')
      const title  = container.querySelector<HTMLElement>('[data-title]')
      const line   = container.querySelector<HTMLElement>('[data-gline]')
      const desc   = container.querySelector<HTMLElement>('[data-desc]')

      /* Aqui o reveal está preso a um `scrub`: cada frame de rolagem reescreve
         o estado dos alvos. É o pior lugar possível para desfoque por letra —
         eram sessenta repinturas por frame de SCROLL, não por frame de
         animação. Com o desfoque no container sobra uma camada só, e ela
         termina cedo (ver `blurDuration` no helper). */
      reveal = createCharReveal(title, { duration: 0.3, ease: 'none', autoRevert: false })

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
      reveal?.hide()
      if (line) gsap.set(line, { scaleX: 0, opacity: 0, transformOrigin: 'left center' })
      if (desc) gsap.set(desc, { y: 20, opacity: 0 })

      /* A coreografia é a mesma nos dois tamanhos — o globo sobe do rodapé até
         o topo da seção arrastando o azul, e o texto entra atrás dele. O que
         muda é QUEM conduz o tempo. */
      const coreografia = (tl: gsap.core.Timeline, esc: number) => {
        tl.to(globe, { y: 0, duration: 1 * esc }, 0)
        if (bg) tl.to(bg, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 * esc }, 0)
        // O texto só entra depois que o globo desceu o bastante para sair de
        // cima da área dele.
        tl.to(container, { opacity: 1, filter: 'blur(0px)', duration: 0.35 * esc }, 0.55 * esc)
        if (kicker) tl.to(kicker, { y: 0, opacity: 1, duration: 0.3 * esc }, 0.55 * esc)
        reveal?.playIn(tl, 0.62 * esc)
        if (line) tl.to(line, { scaleX: 1, opacity: 1, duration: 0.15 * esc }, 0.78 * esc)
        if (desc) tl.to(desc, { y: 0, opacity: 1, duration: 0.2 * esc }, 0.85 * esc)
      }

      mm = gsap.matchMedia()

      /* ── Celular: a cena corre sozinha, uma vez ──────────────────────
         Presa ao scroll, a seção só se completava depois de uma tela inteira
         de rolagem: o globo subia devagar, o texto aparecia lá no fim, e para
         ver a cena inteira era preciso insistir no dedo. Num aparelho de toque
         isso não é controle, é trabalho.
         Aqui o scroll apenas DISPARA — a partir daí a animação corre no seu
         próprio tempo, contínua, e termina sozinha. Roda uma vez: quem volta
         encontra a seção montada, sem repetir a subida do globo. */
      mm.add('(max-width: 1023px)', () => {
        const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } })
        coreografia(tl, 1.35) // segundos, não fração de scroll

        const st = ScrollTrigger.create({
          trigger: section,
          start: 'top 80%',
          /* `end` explícito para que `progress` seja uma faixa, e não um ponto:
             sem ele o trigger tem começo e fim no mesmo lugar, `isActive` é
             falso quase sempre e a rede de segurança abaixo nunca pegava. */
          end: 'bottom top',
          once: true,
          onEnter: () => tl.play(),
          /* Se o start já ficou para trás quando os triggers foram remedidos —
             e nesta página isso acontece, porque os trechos pinados acima
             inserem espaçadores de milhares de pixels ao montar —, a cena não
             pode perder a única chance que tem. */
          onRefresh: (self) => {
            if (self.progress > 0) tl.play()
          },
        })
        return () => {
          st.kill()
          tl.kill()
        }
      })

      /* ── Desktop: segue preso ao scroll, com um acabamento ───────────
         O globo desce conforme o usuário rola — comportamento aprovado, sem
         mudança. A única adição é o `snap`: parou de rolar já perto do fim, a
         cena assenta sozinha no estado final em vez de ficar congelada no meio
         do caminho. Abaixo do limiar o snap devolve o próprio progresso, ou
         seja, não mexe em nada. */
      mm.add('(min-width: 1024px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'top top',
            scrub: 0.5,
            invalidateOnRefresh: true,
            snap: {
              snapTo: (valor) => (valor > 0.72 ? 1 : valor),
              duration: { min: 0.15, max: 0.4 },
              delay: 0.06,
              ease: 'power2.inOut',
            },
          },
          defaults: { ease: 'none' },
        })
        coreografia(tl, 1)
        return () => {
          tl.scrollTrigger?.kill()
          tl.kill()
        }
      })
    }

    return () => {
      mm?.revert()
      reveal?.revert()
    }
  }, { scope: ref })

  return (
    <section
      ref={ref}
      id="whatsapp"
      className="relative overflow-hidden"
      /* Sem backgroundColor aqui de propósito: o azul vive na camada
         [data-bg-reveal] (z-0) para o clip-path da entrada poder revelá-lo
         de trás do globo. Padding inferior grande reserva o espaço do globo. */
      /* O teto do padding inferior acompanha a altura que o globo passa a ter
         em tela larga (26,05vw — ver a caixa dele abaixo). Preso em 440px, num
         monitor de 1920 o globo media 500px e subia por cima do parágrafo. */
      style={{
        paddingTop: 'clamp(80px, 7.5vw, 120px)',
        paddingBottom: 'clamp(260px, 30vw, 560px)',
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
            style={{ fontSize: 'clamp(2.5rem, 4.5vw, 4.5rem)' }}
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
      {/* No desktop a altura é a PROPORÇÃO da arte (1920×500 → 26,05vw), não um
          valor fixo. Com 420px cravados, qualquer tela mais larga que ~1610px
          fazia o `object-cover` ampliar a imagem além da caixa; como a âncora é
          `object-bottom`, o excedente saía todo pelo topo — e o que se via era
          a atmosfera decepada numa linha reta. Casando altura e proporção, o
          cover não tem o que cortar em nenhuma largura.
          Abaixo de lg as alturas fixas continuam: em tela estreita o corte
          lateral é justamente o que mantém a curva da Terra em escala. */}
      <div
        data-globe
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[220px] sm:h-[280px] md:h-[360px] lg:h-[26.05vw]"
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
