import SignupPageClient from './client'

interface SignupPageProps {
  params: Promise<{ locale: string }>
}

export default async function SignupPage({ params }: SignupPageProps) {
  const { locale } = await params

  return <SignupPageClient />
}
