import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/metadata'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  
  return generatePageMetadata(locale, {
    title: 'Cookie Policy - AutomaPost | Website Cookies & Tracking',
    description: 'Learn about AutomaPost\'s cookie usage, including essential cookies, analytics, and preferences. Manage your cookie settings for LinkedIn automation platform.',
    keywords: 'automapost cookie policy, website cookies, tracking cookies, gdpr cookies, cookie consent, privacy settings',
    ogTitle: 'Cookie Policy - AutomaPost',
    ogDescription: 'Learn about AutomaPost\'s cookie usage and manage your cookie preferences.',
    ogImageAlt: 'AutomaPost - Cookie Policy',
    path: '/cookies',
  })
}

export default async function CookiesPage({ params }: PageProps) {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container pt-24 pb-16 max-w-3xl prose prose-neutral dark:prose-invert">
        <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: August 8, 2025</p>

        <p>
          This Cookie Policy explains how AutomaPost uses cookies and similar technologies on our
          website and Services. For information about how we process personal data more broadly, see our
          <a className="underline ml-1" href="/privacy">Privacy Policy</a>.
        </p>

        <h2 id="what-are-cookies">What are cookies?</h2>
        <p>
          Cookies are small text files placed on your device by a website. They are widely used to make
          websites work, or work more efficiently, as well as to provide reporting information.
        </p>

        <h2 id="how-we-use-cookies">How we use cookies</h2>
        <ul>
          <li>
            Essential cookies: required to operate the site and Service (e.g., authentication, security,
            load balancing). These cannot be switched off in our systems.
          </li>
          <li>
            Functional cookies: remember preferences and enhance features.
          </li>
          <li>
            Analytics and performance cookies: help us understand how the site and product are used so we
            can improve them (e.g., Google Analytics). These are used only with your consent where
            required.
          </li>
          <li>
            Advertising cookies: used to deliver and measure ads where applicable; these are optional and
            used only with your consent where required.
          </li>
        </ul>

        <h2 id="consent">Your consent and how to manage cookies</h2>
        <p>
          When you first visit our site, you may see a banner requesting your consent to non‑essential
          cookies. You can manage your preferences using that banner, and you can update them at any time
          by clearing your browser cookies to trigger the banner again or adjusting browser settings to
          block or delete cookies.
        </p>
        <p>
          Our banner supports enabling or disabling categories such as Functional, Analytics,
          Performance, Advertising, and Others. Essential cookies remain active to ensure the site works
          properly.
        </p>

        <h2 id="ga">Google Analytics and similar technologies</h2>
        <p>
          Where enabled, we use analytics tools to understand aggregate usage. We configure consent
          signals to respect your choices. You can also opt out by using browser add‑ons provided by the
          analytics provider.
        </p>

        <h2 id="changes">Changes to this policy</h2>
        <p>
          We may update this Cookie Policy from time to time. The “Last updated” date reflects the most
          recent changes.
        </p>

        <h2 id="contact">Contact</h2>
        <p>
          If you have questions about our use of cookies, contact us at
          <a className="underline ml-1" href="mailto:contact@automapost.com">contact@automapost.com</a>.
        </p>
      </main>
      <Footer />
    </div>
  )
}


