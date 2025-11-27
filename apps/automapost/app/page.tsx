import HomePageWrapper from '@/components/landing/home-page-wrapper'
import { generatePageMetadata } from '@/lib/metadata'

export const generateMetadata = () => generatePageMetadata('en')

export default function RootPage() {
  return <HomePageWrapper />
}