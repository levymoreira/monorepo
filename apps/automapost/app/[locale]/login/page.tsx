import { LoginWrapper } from './login-wrapper'
import LoginPageClient from './client'

interface LoginPageProps {
  params: Promise<{ locale: string }>
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params

  return (
    <LoginWrapper locale={locale}>
      <LoginPageClient />
    </LoginWrapper>
  )
}
