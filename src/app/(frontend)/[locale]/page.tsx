import { setRequestLocale } from 'next-intl/server'

import { HeroJornada }      from '@/features/home/components/HeroJornada'
import { HomeMarquee }      from '@/features/home/components/HomeMarquee'
import { OurStory }         from '@/features/home/components/OurStory'
import { AminosanStory }         from '@/features/home/components/AminosanStory'
import { HomeProductShowcase }   from '@/features/home/components/HomeProductShowcase'
import { HomeCultures }          from '@/features/home/components/HomeCultures'
import { ProofStrip }       from '@/features/home/components/ProofStrip'
import { Problem }          from '@/features/home/components/Problem'
import { Solution }         from '@/features/home/components/Solution'
import { Lines }            from '@/features/home/components/Lines'
import { HomeCalculator }   from '@/features/home/components/HomeCalculator'
import { HomeExperience }   from '@/features/home/components/HomeExperience'
import { HomeTestimonials } from '@/features/home/components/HomeTestimonials'
import { HomeBlog }         from '@/features/home/components/HomeBlog'
import { HomeCtaFinal }     from '@/features/home/components/HomeCtaFinal'
import { SectionNav }        from '@/features/home/components/SectionNav'

export default async function HomePage(props: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params
  setRequestLocale(locale)

  return (
    <>
      <SectionNav />

      <div id="sec-inicio" className="relative">
        <HeroJornada />
        <div id="sec-historia" className="scroll-mt-24">
          <OurStory />
        </div>
      </div>
      <div id="sec-origem" className="scroll-mt-24">
        <AminosanStory />
      </div>
      <div id="sec-produtos" className="scroll-mt-24">
        <HomeProductShowcase />
      </div>
      <div id="sec-culturas" className="scroll-mt-24">
        <HomeCultures />
      </div>
      <div id="sec-numeros" className="scroll-mt-24">
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
      <div id="sec-experience" className="scroll-mt-24">
        <HomeExperience />
      </div>
      <div id="sec-depoimentos" className="scroll-mt-24">
        <HomeTestimonials />
      </div>
      <div id="sec-materias" className="scroll-mt-24">
        <HomeBlog />
      </div>
      <div id="sec-contato" className="scroll-mt-24">
        <HomeCtaFinal />
      </div>
    </>
  )
}
