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
      title: "Post Not Found",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://levymoreira.com';
  const postUrl = `${baseUrl}/blog/${post.slug}`;
  const ogImage = post.ogImage || `${baseUrl}/static/images/og-image.jpg`;

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author }],
    openGraph: {
      type: "article",
      url: postUrl,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      modifiedTime: post.lastModified || post.date,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
      creator: "@_levymoreira",
    },
    alternates: {
      canonical: postUrl,
    },
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://levymoreira.com';
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  // Structured Data for SEO (JSON-LD)
  const blogPostingData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Person",
      name: post.author,
      url: baseUrl,
      jobTitle: "Software Engineer",
      worksFor: {
        "@type": "Organization",
        name: "Microsoft"
      }
    },
    datePublished: post.date,
    dateModified: post.lastModified || post.date,
    publisher: {
      "@type": "Person",
      name: post.author,
      url: baseUrl
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl
    },
    keywords: post.tags.join(", "),
    articleSection: post.tags[0] || "Technology",
    wordCount: post.content.split(/\s+/).length,
    timeRequired: `PT${post.readingTime}M`,
    url: postUrl,
    image: post.ogImage || `${baseUrl}/static/images/og-image.jpg`,
    inLanguage: "en-US"
  };

  // Breadcrumb structured data for navigation
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${baseUrl}/blog`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: postUrl
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <Link href="/blog" className={styles.backLink}>
            ← Back to Blog
          </Link>
          <article className={styles.article}>
            <header>
              <h1 className={styles.title}>{post.title}</h1>
              <div className={styles.meta}>
                <time className={styles.date} dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <span className={styles.separator}>•</span>
                <span className={styles.readingTime}>{post.readingTime} min read</span>
                {post.tags && post.tags.length > 0 && (
                  <>
                    <span className={styles.separator}>•</span>
                    <div className={styles.tags}>
                      {post.tags.map((tag) => (
                        <span key={tag} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </header>
            <div 
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
}

