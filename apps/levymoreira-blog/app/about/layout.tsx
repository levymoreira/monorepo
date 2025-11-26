import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - Levy Moreira",
  description: "Learn more about Levy Moreira, a Software Engineer at Microsoft based in Dublin, Ireland. Passionate about software development, product building, and side projects.",
  keywords: ["Levy Moreira", "Software Engineer", "Microsoft", "Dublin", "Ireland", "About", "Biography"],
  openGraph: {
    title: "About Levy Moreira",
    description: "Software Engineer at Microsoft based in Dublin, Ireland. Passionate about software development and building products.",
    type: "profile",
    url: "https://levymoreira.com/about",
    images: [
      {
        url: "/static/images/avatar.jpg",
        width: 400,
        height: 400,
        alt: "Levy Moreira",
      }
    ],
  },
  twitter: {
    card: "summary",
    title: "About Levy Moreira",
    description: "Software Engineer at Microsoft based in Dublin, Ireland.",
    images: ["/static/images/avatar.jpg"],
  },
  alternates: {
    canonical: "https://levymoreira.com/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

