import ResetPasswordClient from './client'

interface ResetPasswordPageProps {
  params: Promise<{ locale: string }>
}

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { locale } = await params

  return <ResetPasswordClient />
}
