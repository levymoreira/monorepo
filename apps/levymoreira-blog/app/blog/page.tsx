import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./page.module.css";
import { posts } from "../data/posts";

export const metadata = {
  title: "Blog - Levy Moreira",
  description: "Thoughts, tutorials, and insights on software development.",
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
            <h1 className={styles.gradientHeading}>Blog</h1>
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
