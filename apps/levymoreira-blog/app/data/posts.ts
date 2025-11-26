export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  content: string;
  author: string;
  tags: string[];
  readingTime: number; // in minutes
  lastModified?: string;
  ogImage?: string;
}

export const posts: BlogPost[] = [
  {
    slug: "hello-world",
    title: "Hello World - Welcome to My Blog",
    excerpt: "My first blog post on this new platform. Learn what to expect from this blog and the topics I'll be covering.",
    date: "2024-01-01",
    author: "Levy Moreira",
    tags: ["introduction", "blog", "welcome"],
    readingTime: 2,
    content: `
      <p>Welcome to my new blog! This is the first post.</p>
      <p>I built this site using Next.js and it's hosted on a custom infrastructure.</p>
      <h2>What to expect</h2>
      <p>I'll be writing about software development, tech trends, and my personal projects.</p>
      <p>Topics will include:</p>
      <ul>
        <li>Software engineering best practices</li>
        <li>Web development with Next.js and React</li>
        <li>DevOps and infrastructure</li>
        <li>Product development insights</li>
        <li>Side project journeys</li>
      </ul>
    `
  },
  {
    slug: "building-this-blog",
    title: "Building this Blog with Next.js and Docker",
    excerpt: "A comprehensive guide on how I built this blog using Next.js, Docker, and deployed it on a custom infrastructure with a monorepo architecture.",
    date: "2024-01-15",
    lastModified: "2024-01-20",
    author: "Levy Moreira",
    tags: ["nextjs", "docker", "devops", "tutorial", "monorepo"],
    readingTime: 5,
    content: `
      <p>Building a blog from scratch is a fun project that teaches you a lot about modern web development and deployment.</p>
      <p>I used a monorepo structure with Docker for deployment, which allows me to manage multiple applications in one repository.</p>
      <h2>Tech Stack</h2>
      <ul>
        <li><strong>Next.js 15</strong> - React framework with App Router</li>
        <li><strong>TypeScript</strong> - Type safety and better developer experience</li>
        <li><strong>Docker</strong> - Containerization for consistent deployments</li>
        <li><strong>Traefik</strong> - Reverse proxy and load balancer</li>
      </ul>
      <h2>Why a Monorepo?</h2>
      <p>A monorepo allows me to:</p>
      <ul>
        <li>Share code and configurations across projects</li>
        <li>Maintain multiple apps in one place</li>
        <li>Deploy with a single CI/CD pipeline</li>
        <li>Easier dependency management</li>
      </ul>
      <h2>Deployment Strategy</h2>
      <p>The blog is deployed using Docker Compose with Traefik handling SSL certificates via Let's Encrypt automatically.</p>
      <p>This setup gives me full control over the infrastructure while maintaining simplicity.</p>
    `
  }
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}

