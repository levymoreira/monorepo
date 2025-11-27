import { redirect } from 'next/navigation'

// Redirect root to default locale for proper i18n support
export default function RootPage() {
  redirect('/en')
}