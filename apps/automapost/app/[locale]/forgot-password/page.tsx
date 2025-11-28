import ForgotPasswordClient from './client'

interface ForgotPasswordPageProps {
  params: Promise<{ locale: string }>
}

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { locale } = await params

  return <ForgotPasswordClient />
}
