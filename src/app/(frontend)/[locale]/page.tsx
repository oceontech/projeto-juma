import { setRequestLocale } from 'next-intl/server'

import { HeroJornada } from '@/features/home/components/HeroJornada'
import { OurStory } from '@/features/home/components/OurStory'
import { AminosanStory } from '@/features/home/components/AminosanStory'

export default async function HomePage(props: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params
  setRequestLocale(locale)

  return (
    <>
      <HeroJornada />
      <OurStory />
      <AminosanStory />
    </>
  )
}
