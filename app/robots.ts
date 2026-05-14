import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://grunt.sh'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/upgrade', '/api/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
