// Environment utilities
export const isProduction = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    return host === 'automapost.com' || host.endsWith('.automapost.com')
  }
  
  return process.env.NODE_ENV === 'production' || 
         process.env.NEXT_PUBLIC_APP_ENV === 'production'
}

export const isDevelopment = () => {
  return !isProduction()
}

export const getEnvironment = () => {
  return isProduction() ? 'production' : 'development'
}