import { posts } from '../data/posts';

function generateRSSItem(post: typeof posts[0], baseUrl: string): string {
  const postUrl = `${baseUrl}/blog/${post.slug}`;
  
  return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>Levy Moreira</author>
      ${post.tags.map(tag => `<category>${tag}</category>`).join('\n      ')}
    </item>
  `.trim();
}

function generateRSSFeed(baseUrl: string): string {
  const rssItems = posts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(post => generateRSSItem(post, baseUrl))
    .join('\n    ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Levy Moreira - Blog</title>
    <link>${baseUrl}</link>
    <description>Software Engineer at Microsoft. Thoughts, tutorials, and insights on software development, web technologies, and product development.</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <copyright>Copyright ${new Date().getFullYear()} Levy Moreira</copyright>
    <managingEditor>Levy Moreira</managingEditor>
    <webMaster>Levy Moreira</webMaster>
    <category>Technology</category>
    <category>Software Development</category>
    <category>Web Development</category>
    ${rssItems}
  </channel>
</rss>`;
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://levymoreira.com';
  const rss = generateRSSFeed(baseUrl);

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  });
}

