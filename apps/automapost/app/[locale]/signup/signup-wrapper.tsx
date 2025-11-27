import VisualPanel from './visual-panel'

interface SignupWrapperProps {
  locale: string
  children: React.ReactNode
}

export function SignupWrapper({ locale, children }: SignupWrapperProps) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <VisualPanel />
      <div className="w-full lg:w-[30%] lg:shadow-xl min-h-screen lg:h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
