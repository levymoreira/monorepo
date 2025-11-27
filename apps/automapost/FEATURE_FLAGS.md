# Feature Flags

This document describes the available feature flags in the AutomaPost landing page.

## Social Media Logos Feature Flag

**Flag Name:** `NEXT_PUBLIC_USE_SOCIAL_MEDIA_LOGOS`

**Description:** Switches between tech company logos and social media platform logos in the hero section floating logos animation.

### Logo Sets:

#### Tech Company Logos (Default - flag = `false`):
- Microsoft → Facebook
- Google (unchanged)
- Apple → Instagram  
- Amazon (unchanged)
- Netflix → TikTok
- Slack → Bluesky
- Spotify → X (Twitter)
- LinkedIn (unchanged)

#### Social Media Logos (flag = `true`):
- Facebook
- Google
- Instagram
- Amazon
- TikTok
- Bluesky
- X (Twitter)
- LinkedIn

### Usage:

1. **Environment Variable** (Recommended):
   Create a `.env.local` file in your project root:
   ```bash
   # Use social media logos
   NEXT_PUBLIC_USE_SOCIAL_MEDIA_LOGOS=true
   
   # Use tech company logos (default)
   NEXT_PUBLIC_USE_SOCIAL_MEDIA_LOGOS=false
   ```

2. **Manual Override** (Development):
   Edit `lib/feature-flags.ts` and uncomment the manual override section:
   ```typescript
   export const featureFlags = {
     useSocialMediaLogos: true, // Set to true to test social media logos
   }
   ```

### Implementation:

- **File:** `components/floating-logos.tsx`
- **Config:** `lib/feature-flags.ts` 
- **Logic:** Uses conditional rendering based on `featureFlags.useSocialMediaLogos`
- **Environment:** Only `NEXT_PUBLIC_*` variables are available in the browser

### Notes:

- Changes require a restart of the development server
- The flag only affects the desktop version of the floating logos (hidden on mobile)
- All logos maintain the same positions and animation behaviors
- SVG icons are optimized for consistent sizing and performance