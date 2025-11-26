import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import "./globals.css";

const firaCode = Fira_Code({
  variable: "--font-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://levymoreira.com'),
  title: {
    default: "Levy Moreira - Software Engineer & Product Builder",
    template: "%s | Levy Moreira"
  },
  description: "Software Engineer at Microsoft. Building amazing products and sharing insights on software development, web technologies, and tech entrepreneurship.",
  keywords: ["Levy Moreira", "Software Engineer", "Microsoft", "Web Development", "Next.js", "React", "TypeScript", "Tech Blog", "Software Development", "Product Development"],
  authors: [{ name: "Levy Moreira", url: "https://levymoreira.com" }],
  creator: "Levy Moreira",
  publisher: "Levy Moreira",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://levymoreira.com",
    siteName: "Levy Moreira",
    title: "Levy Moreira - Software Engineer & Product Builder",
    description: "Software Engineer at Microsoft. Building amazing products and sharing insights on software development.",
    images: [
      {
        url: "/static/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Levy Moreira - Software Engineer",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Levy Moreira - Software Engineer & Product Builder",
    description: "Software Engineer at Microsoft. Building amazing products and sharing insights on software development.",
    images: ["/static/images/og-image.jpg"],
    creator: "@_levymoreira",
  },
  alternates: {
    canonical: "https://levymoreira.com",
    types: {
      'application/rss+xml': 'https://levymoreira.com/rss.xml',
    },
  },
  themeColor: "#08070b",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={firaCode.variable}>
        {children}
      </body>
    </html>
  );
}
