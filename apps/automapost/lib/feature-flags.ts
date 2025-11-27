// Feature flags configuration
// You can set these environment variables in your .env.local file:
// NEXT_PUBLIC_USE_SOCIAL_MEDIA_LOGOS=true

export const featureFlags = {
  // Use social media logos instead of tech company logos
  useSocialMediaLogos: process.env.NEXT_PUBLIC_USE_SOCIAL_MEDIA_LOGOS === 'true',
}

// For development: You can manually override here if needed
// export const featureFlags = {
//   useSocialMediaLogos: true, // Set to true to test social media logos
// }