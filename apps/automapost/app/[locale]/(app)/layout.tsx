import { ReactNode } from 'react'
import { AuthProvider } from '@/hooks/useAuth'

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}