import { ReactNode } from 'react'
import Script from 'next/script'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Figtree } from 'next/font/google'
import { locales } from '@/lib/i18n/config'
import type { Locale } from '@/lib/i18n/config'
import { ThemeProvider } from '@/components/shared/theme-provider'
import WhatsAppWidget from '@/components/whatsapp-widget'
import { ErrorBoundary } from '@/components/error-tracking/error-boundary'
import GlobalErrorHandler from '@/components/error-tracking/global-error-handler'

const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  variable: '--font-figtree',
})

interface LocaleLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale: locale.code }))
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params
  
  // Validate locale
  const isValidLocale = locales.some((l) => l.code === locale)
  
  if (!isValidLocale) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} className={figtree.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        <>
            <Script id="tag-manager-1" strategy="afterInteractive">
              {`
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-TS5G4XFP');
              `}
            </Script>
        </>

      </head>
      <body className={figtree.className} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="light" 
            enableSystem={false}
            storageKey="automapost-theme"
          >
            <ErrorBoundary>
              <GlobalErrorHandler />
              {children}
              <WhatsAppWidget />
            </ErrorBoundary>
          </ThemeProvider>
        </NextIntlClientProvider>
        
        {/* Google Analytics - Only in production */}
        {process.env.NODE_ENV === 'production' && (
          <>
          
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-E2KN6NY0ST"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-E2KN6NY0ST');
              `}
            </Script>
            {/* Hotjar Tracking Code */}
            <Script id="hotjar-tracking" strategy="afterInteractive">
              {`
                (function(h,o,t,j,a,r){
                  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                  h._hjSettings={hjid:6487994,hjsv:6};
                  a=o.getElementsByTagName('head')[0];
                  r=o.createElement('script');r.async=1;
                  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                  a.appendChild(r);
                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
              `}
            </Script>
            {/* <Script id="tag-manager" strategy="afterInteractive">
              {`
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-TS5G4XFP');
              `}
            </Script> */}
          </>
        )}
      </body>
    </html>
  )
}