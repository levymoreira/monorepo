import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Levy Moreira - Software Engineer',
    short_name: 'Levy Moreira',
    description: 'Personal website and blog of Levy Moreira',
    start_url: '/',
    display: 'standalone',
    background_color: '#08070b',
    theme_color: '#08070b',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}

