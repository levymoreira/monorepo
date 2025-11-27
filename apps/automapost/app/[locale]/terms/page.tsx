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
    title: 'Terms of Service - AutomaPost | User Agreement & Policies',
    description: 'Read AutomaPost\'s Terms of Service to understand our user agreement, acceptable use policy, and service terms for LinkedIn automation platform.',
    keywords: 'automapost terms of service, user agreement, terms and conditions, acceptable use policy, linkedin automation terms',
    ogTitle: 'Terms of Service - AutomaPost',
    ogDescription: 'Read AutomaPost\'s Terms of Service to understand our user agreement and service policies.',
    ogImageAlt: 'AutomaPost - Terms of Service',
    path: '/terms',
  })
}

export default async function TermsPage({ params }: PageProps) {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container pt-24 pb-16 max-w-3xl prose prose-neutral dark:prose-invert">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: August 8, 2025</p>

        <h2 id="acceptance">Acceptance of terms</h2>
        <p>
          By accessing or using AutomaPost (the "Service"), you agree to be bound by these Terms of
          Service (the "Terms"). If you are using the Service on behalf of an organization, you represent
          that you have authority to bind that organization to these Terms.
        </p>

        <h2 id="eligibility">Eligibility</h2>
        <p>
          You must be at least 13 years old to use the Service, and of legal age to form a binding
          contract in your jurisdiction.
        </p>

        <h2 id="account">Account registration and security</h2>
        <ul>
          <li>You must provide accurate and complete information when creating an account.</li>
          <li>You are responsible for safeguarding your password and for all activity under your account.</li>
          <li>Notify us immediately of any unauthorized use of your account.</li>
        </ul>

        <h2 id="permitted-use">Permitted use and platform policies</h2>
        <p>
          You agree to use the Service in compliance with all applicable laws and third‑party platform
          policies (e.g., social network terms). You will not:
        </p>
        <ul>
          <li>Interfere with or disrupt the Service or its infrastructure.</li>
          <li>Probe, scan, or test the vulnerability of any system or network without authorization.</li>
          <li>Use the Service to send spam, unlawful, infringing, or harmful content.</li>
          <li>Misrepresent your identity or affiliation, or attempt to circumvent rate limits.</li>
        </ul>

        <h2 id="content">Your content</h2>
        <p>
          You retain ownership of content you submit to the Service. By submitting content, you grant
          AutomaPost a worldwide, non‑exclusive, royalty‑free license to host, store, reproduce, and
          display that content solely to provide and operate the Service.
        </p>

        <h2 id="intellectual-property">Our intellectual property</h2>
        <p>
          The Service and its original content, features, and functionality are and will remain the
          exclusive property of AutomaPost and its licensors. These Terms do not grant you any right to
          use our trademarks, brand elements, or domain names.
        </p>

        <h2 id="third-party">Third‑party services and links</h2>
        <p>
          The Service may integrate with or link to third‑party services. Your use of those services is
          subject to their terms, not ours. We are not responsible for third‑party services.
        </p>

        <h2 id="billing">Billing, subscriptions, and refunds</h2>
        <p>
          If you purchase a paid plan, you agree to pay applicable fees, taxes, and charges. Unless
          stated otherwise, subscriptions renew automatically until canceled. You can cancel at any time,
          with access continuing through the end of the current billing period. Refunds, if any, are
          evaluated according to our refund policy and applicable law.
        </p>

        <h2 id="privacy">Privacy</h2>
        <p>
          Please review our <a className="underline" href="/privacy">Privacy Policy</a> to understand
          how we collect and use personal information.
        </p>

        <h2 id="termination">Termination</h2>
        <p>
          We may suspend or terminate your access to the Service if you violate these Terms or if we are
          investigating suspected misconduct. You may stop using the Service at any time.
        </p>

        <h2 id="disclaimer">Disclaimers</h2>
        <p>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER
          EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, AND NON‑INFRINGEMENT. We do not warrant that the Service will
          be uninterrupted, secure, or error‑free.
        </p>

        <h2 id="limitation">Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, AutomaPost and its affiliates will not be liable for
          any indirect, incidental, special, consequential, exemplary, or punitive damages, or for any
          loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use,
          goodwill, or other intangible losses, resulting from your access to or use of the Service.
        </p>

        <h2 id="indemnity">Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold harmless AutomaPost and its affiliates from and
          against any claims, liabilities, damages, losses, and expenses arising out of or in any way
          connected with your use of the Service or violation of these Terms.
        </p>

        <h2 id="governing-law">Governing law; disputes</h2>
        <p>
          These Terms are governed by the laws of your place of residence unless otherwise required by
          law. Where permitted, disputes will be resolved in the courts located in our principal place of
          business. You and AutomaPost each waive any right to a jury trial to the extent permitted by
          law.
        </p>

        <h2 id="changes">Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. If we make material changes, we will provide
          notice as appropriate. Your continued use of the Service after changes become effective
          constitutes acceptance of the revised Terms.
        </p>

        <h2 id="contact">Contact</h2>
        <p>
          If you have questions about these Terms, contact us at
          <a className="underline ml-1" href="mailto:contact@automapost.com">contact@automapost.com</a>.
        </p>
      </main>
      <Footer />
    </div>
  )
}


