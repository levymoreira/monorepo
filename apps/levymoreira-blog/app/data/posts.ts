export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  content: string;
}

export const posts: BlogPost[] = [
  {
    slug: "hello-world",
    title: "Hello World",
    excerpt: "My first blog post on this new platform.",
    date: "2024-01-01",
    content: `
      <p>Welcome to my new blog! This is the first post.</p>
      <p>I built this site using Next.js and it's hosted on a custom infrastructure.</p>
      <h2>What to expect</h2>
      <p>I'll be writing about software development, tech trends, and my personal projects.</p>
    `
  },
  {
    slug: "building-this-blog",
    title: "Building this Blog",
    excerpt: "How I built this blog using Next.js and Docker.",
    date: "2024-01-15",
    content: `
      <p>Building a blog from scratch is a fun project.</p>
      <p>I used a monorepo structure with Docker for deployment.</p>
      <h2>Tech Stack</h2>
      <ul>
        <li>Next.js</li>
        <li>TypeScript</li>
        <li>Docker</li>
        <li>Traefik</li>
      </ul>
    `
  }
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}

