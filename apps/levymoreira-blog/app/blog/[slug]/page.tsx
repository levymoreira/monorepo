import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "./page.module.css";
import { getPostBySlug, posts } from "../../data/posts";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found - Levy Moreira",
    };
  }

  return {
    title: `${post.title} - Levy Moreira`,
    description: post.excerpt,
  };
}

export async function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <Link href="/blog" className={styles.backLink}>
          ← Back to Blog
        </Link>
        <article className={styles.article}>
          <h1 className={styles.title}>{post.title}</h1>
          <time className={styles.date}>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <div 
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
      <Footer />
    </div>
  );
}

