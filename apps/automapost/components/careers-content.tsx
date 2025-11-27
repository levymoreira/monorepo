"use client"

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function CareersContent() {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <main className="container pt-24 pb-16 max-w-5xl">
      {/* Hero */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-3">Come build the future of AI‑powered social</h1>
        <p className="text-neutral-gray text-lg max-w-3xl">
          We are a small, fast team competing with giants — David vs. Goliath style. We ship quickly,
          talk to customers weekly, and obsess over practical impact. If you like autonomy,
          craftsmanship, and real outcomes, you’ll like it here.
        </p>
      </header>

      {/* Values */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="rounded-xl border p-6 bg-white">
          <h3 className="font-semibold text-neutral-dark mb-2">Customer First</h3>
          <p className="text-neutral-gray">We listen closely, measure impact, and ship what matters.</p>
        </div>
        <div className="rounded-xl border p-6 bg-white">
          <h3 className="font-semibold text-neutral-dark mb-2">Simple > Complex</h3>
          <p className="text-neutral-gray">We prefer pragmatic solutions over over‑engineered systems.</p>
        </div>
        <div className="rounded-xl border p-6 bg-white">
          <h3 className="font-semibold text-neutral-dark mb-2">Ownership</h3>
          <p className="text-neutral-gray">End‑to‑end responsibility and high trust by default.</p>
        </div>
      </section>

      {/* Benefits */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border p-6 bg-white">
            <div className="font-semibold mb-1">Remote‑first</div>
            <div className="text-neutral-gray">Work from anywhere with flexible hours.</div>
          </div>
          <div className="rounded-xl border p-6 bg-white">
            <div className="font-semibold mb-1">Meaningful equity</div>
            <div className="text-neutral-gray">Own a real piece of what you build.</div>
          </div>
          <div className="rounded-xl border p-6 bg-white">
            <div className="font-semibold mb-1">Learning budget</div>
            <div className="text-neutral-gray">Books, courses, conferences — we invest in growth.</div>
          </div>
          <div className="rounded-xl border p-6 bg-white">
            <div className="font-semibold mb-1">Tools of your choice</div>
            <div className="text-neutral-gray">Pick your stack and hardware to do your best work.</div>
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Open roles</h2>
        <div className="rounded-xl border bg-white overflow-hidden">
          <button
            className="w-full text-left p-6 flex items-start justify-between hover:bg-gray-50 transition-colors"
            onClick={() => setIsOpen((v) => !v)}
            aria-expanded={isOpen}
            aria-controls="ml-role-details"
          >
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold">Machine Learning Engineer</h3>
                <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-800">Full‑time</span>
                <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800">Remote</span>
              </div>
              <p className="text-neutral-gray">
                Ship practical LLM features for content generation, scheduling, and analytics in production.
              </p>
            </div>
            <span className="ml-6 mt-1 text-neutral-dark">
              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </span>
          </button>

          {isOpen && (
            <div id="ml-role-details" className="border-t p-6 space-y-6">
              <div>
                <h4 className="font-semibold mb-2">What you’ll do</h4>
                <ul className="list-disc list-inside text-neutral-gray space-y-1">
                  <li>Design, build, and ship LLM‑powered features used daily by customers.</li>
                  <li>Own the full lifecycle: data pipelines, evaluation, guardrails, and product UX.</li>
                  <li>Productionize prompts, small fine‑tunes, and retrieval for reliability and cost.</li>
                  <li>Measure outcomes with clear offline/online metrics and iterate quickly.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What we’re looking for</h4>
                <ul className="list-disc list-inside text-neutral-gray space-y-1">
                  <li>Strong software fundamentals in TypeScript/Python and production systems.</li>
                  <li>Hands‑on experience with LLMs (prompting, evals, small finetunes, RAG).</li>
                  <li>Ability to turn ambiguous problems into shipped product quickly.</li>
                  <li>Bias for simplicity, ownership, and high‑quality user experiences.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Nice to have</h4>
                <ul className="list-disc list-inside text-neutral-gray space-y-1">
                  <li>Experience with vector databases and lightweight orchestration.</li>
                  <li>Background in information retrieval, NLP, or evaluation frameworks.</li>
                  <li>Prior startup experience or small team ownership.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Compensation & benefits</h4>
                <ul className="list-disc list-inside text-neutral-gray space-y-1">
                  <li>Competitive salary with meaningful equity.</li>
                  <li>Remote‑first, flexible hours, 25+ days paid time off.</li>
                  <li>Learning budget and hardware of your choice.</li>
                </ul>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="mailto:contact@automapost.com?subject=Application%20-%20Machine%20Learning%20Engineer"
                  className="btn btn-primary"
                >
                  Apply via email
                </a>
                <span className="text-neutral-gray">Or send your CV to contact@automapost.com</span>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}


