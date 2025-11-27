import { redirect } from 'next/navigation'

// Force this to be a server component that redirects
export const dynamic = 'force-dynamic'

// Redirect root to default locale for proper i18n support
export default async function RootPage() {
  redirect('/en')
}