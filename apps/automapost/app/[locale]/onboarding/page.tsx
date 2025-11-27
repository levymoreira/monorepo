import { OnboardingWrapper } from './onboarding-wrapper'
import OnboardingPageClient from './client'

interface OnboardingPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ step?: string; force?: string; [key: string]: string | string[] | undefined }>
}

export default async function OnboardingPage({ params, searchParams }: OnboardingPageProps) {
  const { locale } = await params
  const searchParamsResolved = await searchParams
  const { step = '1' } = searchParamsResolved

  return (
    <OnboardingWrapper step={step} locale={locale} searchParams={searchParamsResolved}>
      <OnboardingPageClient />
    </OnboardingWrapper>
  )
}