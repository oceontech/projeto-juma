import { setRequestLocale } from 'next-intl/server'
import dynamic from 'next/dynamic'

import { HeroJornada }      from '@/features/home/components/HeroJornada'
import { SectionNav }       from '@/features/home/components/SectionNav'
import { GlobalPresence }   from '@/features/home/components/GlobalPresence'
// Seções abaixo da dobra do "filme contínuo": code-split em chunks separados
// (continuam com SSR normal — só tiram peso do bundle inicial de hidratação).
const OurStory            = dynamic(() => import('@/features/home/components/OurStory').then(m => m.OurStory))
const AminosanStory       = dynamic(() => import('@/features/home/components/AminosanStory').then(m => m.AminosanStory))
const HomeProductShowcase = dynamic(() => import('@/features/home/components/HomeProductShowcase').then(m => m.HomeProductShowcase))
const HomeCultures    = dynamic(() => import('@/features/home/components/HomeCultures').then(m => m.HomeCultures))
const ProofStrip      = dynamic(() => import('@/features/home/components/ProofStrip').then(m => m.ProofStrip))
const Problem         = dynamic(() => import('@/features/home/components/Problem').then(m => m.Problem))
const Solution        = dynamic(() => import('@/features/home/components/Solution').then(m => m.Solution))
const Lines           = dynamic(() => import('@/features/home/components/Lines').then(m => m.Lines))
// HomeCalculator removida temporariamente (dados de ganho/hectare ainda não confirmados) — componente preservado em @/features/home/components/HomeCalculator
const HomeExperience  = dynamic(() => import('@/features/home/components/HomeExperience').then(m => m.HomeExperience))
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
      <div id="sec-produtos" data-nav-theme="dark" className="bg-[#030817] scroll-mt-24">
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
