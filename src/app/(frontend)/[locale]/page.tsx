import { setRequestLocale } from 'next-intl/server'
import dynamic from 'next/dynamic'

import { HeroJornada }      from '@/features/home/components/HeroJornada'
import { HomeMarquee }      from '@/features/home/components/HomeMarquee'
import { OurStory }         from '@/features/home/components/OurStory'
import { AminosanStory }         from '@/features/home/components/AminosanStory'
import { HomeProductShowcase }   from '@/features/home/components/HomeProductShowcase'
import { SectionNav }        from '@/features/home/components/SectionNav'

// Seções abaixo da dobra do "filme contínuo": code-split em chunks separados
// (continuam com SSR normal — só tiram peso do bundle inicial de hidratação).
const HomeCultures    = dynamic(() => import('@/features/home/components/HomeCultures').then(m => m.HomeCultures))
const ProofStrip      = dynamic(() => import('@/features/home/components/ProofStrip').then(m => m.ProofStrip))
const Problem         = dynamic(() => import('@/features/home/components/Problem').then(m => m.Problem))
const Solution        = dynamic(() => import('@/features/home/components/Solution').then(m => m.Solution))
const Lines           = dynamic(() => import('@/features/home/components/Lines').then(m => m.Lines))
const HomeCalculator  = dynamic(() => import('@/features/home/components/HomeCalculator').then(m => m.HomeCalculator))
const HomeExperience  = dynamic(() => import('@/features/home/components/HomeExperience').then(m => m.HomeExperience))
const GlobalPresence  = dynamic(() => import('@/features/home/components/GlobalPresence').then(m => m.GlobalPresence))
const HomeTestimonials = dynamic(() => import('@/features/home/components/HomeTestimonials').then(m => m.HomeTestimonials))
const HomeBlog        = dynamic(() => import('@/features/home/components/HomeBlog').then(m => m.HomeBlog))
const HomeCtaFinal    = dynamic(() => import('@/features/home/components/HomeCtaFinal').then(m => m.HomeCtaFinal))

export default async function HomePage(props: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params
  setRequestLocale(locale)

  return (
    <>
      <SectionNav />

      <div id="sec-inicio" className="scroll-mt-24">
        <HeroJornada />
      </div>
      <div id="sec-historia" className="scroll-mt-24">
        <OurStory />
      </div>
      <div id="sec-origem" className="scroll-mt-24">
        <AminosanStory />
      </div>
      <div id="sec-produtos" data-nav-theme="dark" className="scroll-mt-24">
        <HomeProductShowcase />
      </div>
      <div id="sec-culturas" className="scroll-mt-24">
        <HomeCultures />
      </div>
      <div id="sec-numeros" data-nav-theme="dark" className="scroll-mt-24">
        <ProofStrip />
      </div>
      <div id="sec-desafio" className="scroll-mt-24">
        <Problem />
      </div>
      <div id="sec-programa" className="scroll-mt-24">
        <Solution />
      </div>
      <div id="sec-linhas" className="scroll-mt-24">
        <Lines />
      </div>
      <div id="sec-calculadora" className="scroll-mt-24">
        <HomeCalculator />
      </div>
      <div id="sec-experience" data-nav-theme="dark" className="scroll-mt-24">
        <HomeExperience />
      </div>
      <div id="sec-presenca" className="scroll-mt-24">
        <GlobalPresence />
      </div>
      <div id="sec-depoimentos" className="scroll-mt-24">
        <HomeTestimonials />
      </div>
      <div id="sec-materias" className="scroll-mt-24">
        <HomeBlog />
      </div>
      <div id="sec-contato" data-nav-theme="dark" className="scroll-mt-24">
        <HomeCtaFinal />
      </div>
    </>
  )
}
