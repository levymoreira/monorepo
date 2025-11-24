import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import "./globals.css";

const firaCode = Fira_Code({
  variable: "--font-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Levy Moreira",
  description: "Obsessed with software development and user experience",
  authors: [{ name: "Levy Moreira" }],
  openGraph: {
    title: "Levy Moreira",
    description: "Obsessed with software development and user experience",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  themeColor: "#08070b",
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
