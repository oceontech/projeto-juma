import { setRequestLocale } from 'next-intl/server'

import { HeroJornada }      from '@/features/home/components/HeroJornada'
import { HomeMarquee }      from '@/features/home/components/HomeMarquee'
import { OurStory }         from '@/features/home/components/OurStory'
import { AminosanStory }         from '@/features/home/components/AminosanStory'
import { HomeProductShowcase }   from '@/features/home/components/HomeProductShowcase'
import { HomeCultures }          from '@/features/home/components/HomeCultures'
import { HomeResults }      from '@/features/home/components/HomeResults'
import { ProofStrip }       from '@/features/home/components/ProofStrip'
import { Problem }          from '@/features/home/components/Problem'
import { Solution }         from '@/features/home/components/Solution'
import { Lines }            from '@/features/home/components/Lines'
import { HomeCalculator }   from '@/features/home/components/HomeCalculator'
import { HomeExperience }   from '@/features/home/components/HomeExperience'
import { HomeTestimonials } from '@/features/home/components/HomeTestimonials'
import { HomeBlog }         from '@/features/home/components/HomeBlog'
import { HomeCtaFinal }     from '@/features/home/components/HomeCtaFinal'

export default async function HomePage(props: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params
  setRequestLocale(locale)

  return (
    <>
      <div className="relative">
        <HeroJornada />
        <OurStory />
      </div>
      <AminosanStory />
      <HomeProductShowcase />
      <HomeCultures />
      <HomeResults />
      <ProofStrip />
      <Problem />
      <Solution />
      <Lines />
      <HomeCalculator />
      <HomeExperience />
      <HomeTestimonials />
      <HomeBlog />
      <HomeCtaFinal />
    </>
  )
}
