import { setRequestLocale } from 'next-intl/server'

import { HeroJornada } from '@/features/home/components/HeroJornada'
import { OurStory } from '@/features/home/components/OurStory'
import { AminosanStory } from '@/features/home/components/AminosanStory'
import { ProofStrip } from '@/features/home/components/ProofStrip'
import { Problem } from '@/features/home/components/Problem'
import { Solution } from '@/features/home/components/Solution'
import { Lines } from '@/features/home/components/Lines'

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
      <ProofStrip />
      <Problem />
      <Solution />
      <Lines />
    </>
  )
}
