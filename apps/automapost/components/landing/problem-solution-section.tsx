'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle } from 'lucide-react'

export default function ProblemSolutionSection() {
  const t = useTranslations()

  return (
    <section data-section="problem_solution" className="section-alt">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-dark">
              {t('problem.title')}
            </h2>
            <div className="space-y-4">
              <p className="text-lg text-neutral-dark">
                {t('problem.description')}
              </p>
              
              <div className="space-y-3">
                {t.raw('problem.problems').map((problem: string, index: number) => (
                  <div key={index} className="flex items-center text-neutral-dark">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    <span>{problem}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-dark">
              {t('solution.title')}
            </h2>
            <p className="text-lg text-neutral-dark">
              {t('solution.description')}
            </p>
            
            <div className="space-y-4">
              {t.raw('solution.benefits').map((benefit: any, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-neutral-dark">{benefit.title}</h3>
                    <p className="text-neutral-gray">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}