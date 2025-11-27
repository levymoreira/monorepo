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
    title: 'Privacy Policy - AutomaPost | Data Protection & User Rights',
    description: 'Read AutomaPost\'s Privacy Policy to understand how we collect, use, and protect your personal data. Transparent data practices for LinkedIn automation users.',
    keywords: 'automapost privacy policy, data protection, user rights, gdpr compliance, data security, linkedin automation privacy',
    ogTitle: 'Privacy Policy - AutomaPost',
    ogDescription: 'Read AutomaPost\'s Privacy Policy to understand how we collect, use, and protect your personal data.',
    ogImageAlt: 'AutomaPost - Privacy Policy',
    path: '/privacy',
  })
}

export default async function PrivacyPage({ params }: PageProps) {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container pt-24 pb-16 max-w-3xl prose prose-neutral dark:prose-invert">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: August 8, 2025</p>

        <p>
          This Privacy Policy explains how AutomaPost ("AutomaPost", "we", "us") collects, uses, and
          shares information about you when you use our websites, products, and services (collectively,
          the "Services"). We are committed to handling your information responsibly and transparently.
        </p>

        <h2 id="who-we-are" className="mt-10">Who we are and how to contact us</h2>
        <p>
          AutomaPost is a software service that helps professionals draft and schedule content.
          If you have questions or would like to exercise your privacy rights, contact us at
          <a className="underline ml-1" href="mailto:contact@automapost.com">contact@automapost.com</a>.
        </p>

        <h2 id="scope">Scope</h2>
        <p>
          This policy applies to our public website and to logged-in use of our Services. It does not
          apply to third‑party websites, services, or integrations that we do not control.
        </p>

        <h2 id="information-we-collect">Information we collect</h2>
        <ul>
          <li>
            Account information: name, email address, password or SSO identifiers, and organization
            details you provide when creating an account.
          </li>
          <li>
            Content you provide: posts, captions, media, schedules, and settings you create inside the
            product.
          </li>
          <li>
            Usage and device data: IP address, device and browser attributes, pages viewed, product
            interactions, referral URLs, and timestamps. We may collect this via log files and cookies.
          </li>
          <li>
            Cookies and similar technologies: see our <a className="underline" href="/cookies">Cookie Policy</a>.
          </li>
          <li>
            Third‑party data: if you connect third‑party accounts (for example, a social network), we
            may receive data from that provider according to their terms and your settings.
          </li>
        </ul>

        <h2 id="how-we-use-information">How we use information</h2>
        <ul>
          <li>Provide, operate, and secure the Services.</li>
          <li>Customize and improve features, including research and analytics.</li>
          <li>Communicate with you about updates, security alerts, and administrative messages.</li>
          <li>Provide customer support and respond to inquiries.</li>
          <li>Comply with legal obligations and enforce our Terms of Service.</li>
        </ul>

        <h2 id="legal-bases">Legal bases for processing (EEA/UK users)</h2>
        <p>
          Where applicable, we process personal data under these legal bases: (i) contract performance,
          (ii) legitimate interests (for example, product improvement and security), (iii) consent (for
          non‑essential cookies/marketing), and (iv) legal obligations.
        </p>

        <h2 id="sharing">How we share information</h2>
        <p>
          We do not sell personal information. We share data with trusted service providers who process
          it on our behalf and under appropriate safeguards, including:
        </p>
        <ul>
          <li>Hosting and infrastructure providers.</li>
          <li>Analytics providers (e.g., Google Analytics) to understand product usage.</li>
          <li>Email and communications tools to send service-related messages.</li>
          <li>Payment and billing providers if you purchase paid features.</li>
          <li>Professional advisors and legal authorities when required by law.</li>
        </ul>

        <h2 id="international-transfers">International data transfers</h2>
        <p>
          If we transfer personal data internationally, we rely on appropriate safeguards such as
          Standard Contractual Clauses where required.
        </p>

        <h2 id="retention">Data retention</h2>
        <p>
          We retain personal data for as long as necessary to provide the Services, comply with legal
          obligations, resolve disputes, and enforce agreements. Retention periods vary by data type and
          context.
        </p>

        <h2 id="security">Security</h2>
        <p>
          We use administrative, technical, and organizational measures designed to protect personal
          data, including encryption in transit and access controls. No method of transmission or storage
          is 100% secure, so we cannot guarantee absolute security.
        </p>

        <h2 id="your-rights">Your rights and choices</h2>
        <p>
          Depending on your location, you may have rights to access, correct, delete, or export your
          personal data, object to or restrict certain processing, and withdraw consent. To exercise
          these rights, email us at
          <a className="underline ml-1" href="mailto:contact@automapost.com">contact@automapost.com</a>.
        </p>

        <h2 id="cookies">Cookies</h2>
        <p>
          We use cookies for essential functionality, preferences, analytics, and performance.
          Non‑essential cookies are used only with your consent where required. You can manage
          preferences via the cookie banner when it appears, or through your browser settings. See the
          <a className="underline ml-1" href="/cookies">Cookie Policy</a> for details.
        </p>

        <h2 id="children">Children’s privacy</h2>
        <p>
          Our Services are not directed to children under 13 (or the age required by your jurisdiction).
          We do not knowingly collect personal information from children.
        </p>

        <h2 id="changes">Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. The “Last updated” date reflects the most
          recent changes. Material changes will be communicated where appropriate.
        </p>

        <h2 id="contact">Contact</h2>
        <p>
          For questions about this policy or our data practices, contact
          <a className="underline ml-1" href="mailto:contact@automapost.com">contact@automapost.com</a>.
        </p>
      </main>
      <Footer />
    </div>
  )
}


