import Link from "next/link";
import styles from "./page.module.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://levymoreira.com';

  // Structured Data for Person (SEO)
  const personStructuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Levy Moreira",
    url: baseUrl,
    image: `${baseUrl}/static/images/avatar.jpg`,
    jobTitle: "Software Engineer",
    worksFor: {
      "@type": "Organization",
      name: "Microsoft",
      url: "https://www.microsoft.com"
    },
    sameAs: [
      "https://github.com/levymoreira",
      "https://linkedin.com/in/levymoreira",
      "https://twitter.com/levymoreira"
    ],
    knowsAbout: [
      "Software Engineering",
      "Web Development",
      "Next.js",
      "React",
      "TypeScript",
      "Node.js",
      "DevOps",
      "Product Development"
    ],
    description: "Software Engineer at Microsoft. Obsessed with software development and developing amazing products.",
    alumniOf: "University",
    nationality: "Brazilian",
    homeLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dublin",
        addressCountry: "Ireland"
      }
    }
  };

  // WebSite structured data for search box
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Levy Moreira",
    url: baseUrl,
    description: "Personal website and blog of Levy Moreira",
    author: {
      "@type": "Person",
      name: "Levy Moreira"
    },
    inLanguage: "en-US"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
      />
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.content}>
            <div>
              <h1>Levy Moreira</h1>
              <p>
                <strong>
                  Software Engineer at{" "}
                  <a href="https://microsoft.com/" target="_blank" rel="noopener noreferrer">
                    Microsoft
                  </a>{" "}
                  and founder of many{" "}
                  <Link href="/projects">
                    side projects
                  </Link>
                </strong>
                <br />
                Obsessed with software development and developing amazing products
              </p>
              <div></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
