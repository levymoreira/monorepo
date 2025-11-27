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
    title: 'About AutomaPost - Small Team, Bold Mission | AI LinkedIn Automation',
    description: 'Learn about AutomaPost\'s mission to empower anyone to build a credible LinkedIn presence using simple, reliable AI. Customer-first, lean, and focused on results.',
    keywords: 'about automapost, team, mission, linkedin automation company, ai social media, independent startup',
    ogTitle: 'About AutomaPost - Small Team, Bold Mission',
    ogDescription: 'Learn about AutomaPost\'s mission to empower anyone to build a credible LinkedIn presence using simple, reliable AI.',
    ogImageAlt: 'AutomaPost - About Our Team and Mission',
    path: '/about',
  })
}

export default async function AboutPage({ params }: PageProps) {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container pt-24 pb-16 max-w-5xl">
        {/* Hero */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-3">Small team. Bold mission.</h1>
          <p className="text-neutral-gray text-lg max-w-3xl">
            We’re building practical AI to help individuals and small teams grow on LinkedIn, faster
            and with less effort. Think David vs. Goliath: we move quickly, listen closely, and ship
            what actually makes a difference.
          </p>
        </header>

        {/* Mission & Vision */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="rounded-xl border p-6 bg-white">
            <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
            <p className="text-neutral-gray">
              Empower anyone to build a credible presence on LinkedIn using simple, reliable AI,
              without the complexity or cost of legacy tools.
            </p>
          </div>
          <div className="rounded-xl border p-6 bg-white">
            <h2 className="text-2xl font-semibold mb-2">Our Approach</h2>
            <p className="text-neutral-gray">
              Pragmatic, not flashy. We obsess over product quality, speed, and clear results. If a
              feature doesn’t help users grow, we don’t build it.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="mb-12">
          <div className="rounded-2xl border p-8 bg-white">
            <h2 className="text-2xl font-bold mb-3">Our Story</h2>
            <p className="text-neutral-gray mb-4">
              AutomaPost started from a simple observation: most social tools are heavy, expensive, and
              optimized for agencies, not for everyday operators who just want to show up
              consistently with quality content.
            </p>
            <p className="text-neutral-gray mb-4">
              We built AutomaPost to be different: fast to learn, delightful to use, and focused on the
              outcomes that matter, posting consistently, sounding like yourself, and understanding what
              works.
            </p>
            <p className="text-neutral-gray">
              We’re proudly independent and customer‑funded. Your feedback shapes our roadmap.
            </p>
          </div>
        </section>

        {/* Principles */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Principles we work by</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border p-6 bg-white">
              <div className="font-semibold mb-1">Customer first</div>
              <div className="text-neutral-gray">Talk to users weekly. Measure impact. Iterate.</div>
            </div>
            <div className="rounded-xl border p-6 bg-white">
              <div className="font-semibold mb-1">Keep it simple</div>
              <div className="text-neutral-gray">Fewer steps, clearer outcomes, better defaults.</div>
            </div>
            <div className="rounded-xl border p-6 bg-white">
              <div className="font-semibold mb-1">Own the craft</div>
              <div className="text-neutral-gray">High standards in UX, performance, and reliability.</div>
            </div>
          </div>
        </section>

        {/* How we’re different */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">How we’re different</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border p-6 bg-white">
              <div className="font-semibold mb-2">Lean and focused</div>
              <div className="text-neutral-gray">No bloat. Every feature serves a clear purpose.</div>
            </div>
            <div className="rounded-xl border p-6 bg-white">
              <div className="font-semibold mb-2">Fast iteration</div>
              <div className="text-neutral-gray">We ship weekly and improve based on real usage.</div>
            </div>
            <div className="rounded-xl border p-6 bg-white">
              <div className="font-semibold mb-2">Fair pricing</div>
              <div className="text-neutral-gray">Transparent plans optimized for solo creators and teams.</div>
            </div>
            <div className="rounded-xl border p-6 bg-white">
              <div className="font-semibold mb-2">You own your voice</div>
              <div className="text-neutral-gray">AI assists, you stay in control. Your data stays yours.</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="flex flex-wrap items-center gap-3">
          <a href="/careers" className="btn btn-outline">See open roles</a>
          <a href="/#features" className="btn btn-primary">Get started free</a>
        </section>
      </main>
      <Footer />
    </div>
  )
}


