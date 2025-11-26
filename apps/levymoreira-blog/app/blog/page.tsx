import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./page.module.css";
import { posts } from "../data/posts";

export const metadata = {
  title: "Blog - Articles on Software Development & Tech",
  description: "My thoughts and insights on software development and product development.",
  keywords: ["software development blog", "web development", "founder", "tech blog"],
  openGraph: {
    title: "Blog - Levy Moreira",
    description: "My thoughts and insights on software development and product development.",
    type: "website",
    url: "https://levymoreira.com/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - Levy Moreira",
    description: "Thoughts and insights on software development and product development.",
  },
  alternates: {
    canonical: "https://levymoreira.com/blog",
    types: {
      'application/rss+xml': 'https://levymoreira.com/rss.xml',
    },
  },
};

export default function Blog() {
  // Sort posts by date descending
  const sortedPosts = [...posts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group posts by year
  const postsByYear = sortedPosts.reduce((acc, post) => {
    const year = new Date(post.date).getFullYear().toString();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(post);
    return acc;
  }, {} as Record<string, typeof posts>);

  // Get sorted years (descending)
  const sortedYears = Object.keys(postsByYear).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.content}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h1 className={styles.gradientHeading} style={{ margin: 0 }}>Blog</h1>
              <Link 
                href="/rss.xml" 
                target="_blank"
                style={{ 
                  color: '#888', 
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                title="Subscribe to RSS feed"
              >
                RSS Feed
              </Link>
            </div>
            <p className={styles.subtitle}>
              Thoughts on software engineering, product development, and the tech industry.
            </p>
            
            {sortedYears.map((year) => (
              <div key={year} className={styles.yearSection}>
                <h3>{year}</h3>
                <ul className={styles.postList}>
                  {postsByYear[year].map((post) => (
                    <li key={post.slug} className={styles.postItem}>
                      <Link href={`/blog/${post.slug}`} className={styles.postLink}>
                        {post.title}
                      </Link>
                      <p className={styles.postExcerpt}>{post.excerpt}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
