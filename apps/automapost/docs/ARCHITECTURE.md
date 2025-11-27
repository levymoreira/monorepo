# AutomaPost Project Architecture Proposal

## Executive Summary
This document outlines the proposed architecture for expanding AutomaPost to include:
- Blog functionality
- Authenticated app area
- Multi-language support (i18n)
- Improved project organization

## Current State Analysis
The project is built with:
- **Framework**: Next.js 15.2.4 with App Router
- **UI Components**: Radix UI + Tailwind CSS
- **Database**: Prisma ORM
- **Styling**: Tailwind CSS v4
- **Type Safety**: TypeScript

Current structure follows Next.js App Router conventions with:
- Landing pages in `app/`
- Shared components in `components/`
- Database models in `prisma/`
- Utilities in `lib/`

## Proposed Architecture

### 1. Folder Structure

```
automapost/
├── app/
│   ├── [locale]/                    # Internationalization root
│   │   ├── (landing)/              # Public pages group
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx             # Landing page
│   │   │   ├── about/
│   │   │   ├── careers/
│   │   │   ├── pricing/
│   │   │   ├── privacy/
│   │   │   ├── terms/
│   │   │   └── cookies/
│   │   │
│   │   ├── blog/                    # Blog section
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx             # Blog listing
│   │   │   ├── [slug]/              # Individual blog posts
│   │   │   │   └── page.tsx
│   │   │   ├── category/
│   │   │   │   └── [category]/
│   │   │   │       └── page.tsx
│   │   │   └── tag/
│   │   │       └── [tag]/
│   │   │           └── page.tsx
│   │   │
│   │   └── (app)/                   # Authenticated app area
│   │       ├── layout.tsx           # Auth wrapper layout
│   │       ├── publish/
│   │       │   └── page.tsx
│   │       ├── analytics/
│   │       │   ├── page.tsx
│   │       ├── analytics/
│   │       ├── settings/
│   │       └── profile/
│   │       └── onboarding/
│   │
│   ├── api/
│   │   ├── auth/                    # Authentication endpoints
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   ├── register/
│   │   │   └── [...nextauth]/       # If using NextAuth
│   │   ├── blog/                    # Blog API
│   │   │   ├── posts/
│   │   │   └── comments/
│   │   └── app/                     # App API endpoints
│   │       ├── posts/
│   │       └── analytics/
│   │
│   └── robots.ts
│
├── components/
│   ├── ui/                          # Keep existing UI components
│   ├── landing/                   # Landing page components
│   │   ├── navigation.tsx
│   │   ├── footer.tsx
│   │   └── cta-banner.tsx
│   ├── blog/                        # Blog-specific components
│   │   ├── post-card.tsx
│   │   ├── post-content.tsx
│   │   ├── author-bio.tsx
│   │   └── related-posts.tsx
│   ├── app/                         # App-specific components
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── post-editor.tsx
│   └── shared/                      # Shared across all sections
│       ├── theme-provider.tsx
│       └── language-switcher.tsx
│
├── lib/
│   ├── auth/                        # Authentication logic
│   │   ├── provider.tsx
│   │   ├── hooks.ts
│   │   └── middleware.ts
│   ├── i18n/                        # Internationalization
│   │   ├── config.ts
│   │   ├── middleware.ts
│   │   └── get-dictionary.ts
│   ├── blog/                        # Blog utilities
│   │   ├── mdx.ts
│   │   └── rss.ts
│   └── api/                         # API client utilities
│       └── client.ts
│
├── content/                         # Content management
│   └── blog/                        # Blog posts (if using MDX)
│       └── posts/
│           └── [post-slug].mdx
│
├── dictionaries/                    # Translation files
│   ├── en.json                      # English (US/International)
│   ├── es.json                      # Spanish (Spain)
│   ├── pt.json                      # Portuguese (Portugal)
│   ├── br.json                      # Portuguese (Brazil)
│   └── fr.json                      # French (France)
│
├── middleware.ts                    # Next.js middleware for auth & i18n
│
└── prisma/
    └── schema.prisma                # Extended with blog & user models
```

## Implementation Strategy

### Phase 1: Authentication System (Week 1-2)

#### 1.1 Choose Authentication Provider
**Recommendation**: 
 (Auth.js)
- **Pros**: 
  - Native Next.js integration
  - Multiple provider support (Google, GitHub, Email)
  - Built-in session management
  - TypeScript support

**Alternative**: Clerk
- **Pros**: Fully managed, faster setup
- **Cons**: Vendor lock-in, monthly costs

#### 1.2 Database Schema Updates
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  role          Role      @default(USER)
  posts         Post[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id])
}

enum Role {
  USER
  ADMIN
  EDITOR
}
```

#### 1.3 Protected Routes Implementation
- Middleware-based authentication checks
- Role-based access control (RBAC)
- Session management

### Phase 2: Internationalization (Week 2-3)

#### 2.1 i18n Strategy
**Approach**: URL path-based locale detection with regional variants

**Supported Locales**:
- `/en/*` - English (US/International)
- `/es/*` - Spanish (Spain)
- `/pt/*` - Portuguese (Portugal)
- `/br/*` - Portuguese (Brazil)
- `/fr/*` - French (France)

**URL Examples**:
- `https://automapost.com/en` - English landing page
- `https://automapost.com/br` - Brazilian Portuguese landing page
- `https://automapost.com/pt` - European Portuguese landing page
- `https://automapost.com/es/blog` - Spanish blog
- `https://automapost.com/br/app/dashboard` - Brazilian Portuguese dashboard

**Default Behavior**:
- Root URL (`/`) redirects based on:
  1. User's saved preference (cookie/localStorage)
  2. Browser Accept-Language header
  3. Geolocation (optional)
  4. Default to English if no preference detected

**Locale Configuration**:
```typescript
export const locales = [
  { code: 'en', name: 'English', region: 'US', flag: '🇺🇸' },
  { code: 'es', name: 'Español', region: 'ES', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', region: 'PT', flag: '🇵🇹' },
  { code: 'br', name: 'Português', region: 'BR', flag: '🇧🇷' },
  { code: 'fr', name: 'Français', region: 'FR', flag: '🇫🇷' }
] as const;

export const defaultLocale = 'en';
```

#### 2.2 Implementation Steps
1. Install `next-intl` or build custom solution
2. Create translation dictionaries
3. Implement locale detection middleware
4. Add language switcher component
5. Set up dynamic routing with `[locale]` parameter

#### 2.3 Content Translation Strategy
- **Static content**: JSON dictionaries with regional variations
- **Blog posts**: Separate posts per language or translation fields
- **Dynamic content**: Database fields with locale suffix
- **Regional differences**: 
  - Currency formatting (R$ for Brazil, € for Portugal)
  - Date formatting (DD/MM/YYYY for PT/BR, MM/DD/YYYY for EN)
  - Spelling variations (e.g., "otimização" in PT-BR vs "optimização" in PT-PT)
  - Cultural references and examples

#### 2.4 Language Switcher Implementation
```typescript
// Language switcher with regional variants
const LanguageSwitcher = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Globe className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => switchLocale('en')}>
          🇺🇸 English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLocale('es')}>
          🇪🇸 Español
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Português</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => switchLocale('br')}>
          🇧🇷 Brasil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLocale('pt')}>
          🇵🇹 Portugal
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => switchLocale('fr')}>
          🇫🇷 Français
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

### Phase 3: Blog System (Week 3-4)

#### 3.1 Content Management Options

**Option A: MDX-based (Recommended for developers)**
- Store posts as MDX files
- Version control friendly
- Easy to edit in code editor
- Great for technical blogs

**Option B: Database-based (Recommended for non-technical users)**
- Store in Prisma/PostgreSQL
- Build admin interface
- Rich text editor integration
- Better for multiple authors

#### 3.2 Blog Database Schema
```prisma
model Post {
  id          String    @id @default(cuid())
  slug        String    
  title       String
  excerpt     String?
  content     String    @db.Text
  coverImage  String?
  published   Boolean   @default(false)
  authorId    String
  author      User      @relation(fields: [authorId], references: [id])
  categories  Category[]
  tags        Tag[]
  locale      String    @default("en") // en, es, pt, br, fr
  views       Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  publishedAt DateTime?
  
  @@unique([slug, locale]) // Unique slug per locale
  @@index([locale, published])
}

model Category {
  id    String @id @default(cuid())
  name  String
  slug  String @unique
  posts Post[]
}

model Tag {
  id    String @id @default(cuid())
  name  String
  slug  String @unique
  posts Post[]
}
```

#### 3.3 Blog Features
- Post CRUD operations
- Categories and tags
- Search functionality
- RSS feed
- SEO optimization
- Social sharing
- Comments (optional)

### Phase 4: App Dashboard (Week 4-5)

#### 4.1 Core Features
- User dashboard
- Post scheduling interface
- Analytics dashboard
- Account settings
- Team management (if applicable)

#### 4.2 UI Components
- Reuse existing Radix UI components
- Create app-specific layout with sidebar
- Responsive design for mobile

## Technical Considerations

### 1. Performance Optimization
- **Static Generation**: Landing and blog pages
- **Dynamic Rendering**: App dashboard
- **ISR**: Blog posts with revalidation
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Dynamic imports for app area

### 2. SEO Strategy
- **Blog**: 
  - Dynamic meta tags with locale-specific content
  - Structured data (JSON-LD)
  - XML sitemap generation per locale
  - Open Graph tags
  - hreflang tags for language variants:
    ```html
    <link rel="alternate" hreflang="en" href="https://automapost.com/en/blog" />
    <link rel="alternate" hreflang="pt-PT" href="https://automapost.com/pt/blog" />
    <link rel="alternate" hreflang="pt-BR" href="https://automapost.com/br/blog" />
    <link rel="alternate" hreflang="es" href="https://automapost.com/es/blog" />
    <link rel="alternate" hreflang="fr" href="https://automapost.com/fr/blog" />
    <link rel="alternate" hreflang="x-default" href="https://automapost.com/en/blog" />
    ```
- **App Area**: noindex for authenticated pages

### 3. Security Measures
- CSRF protection
- Rate limiting on API routes
- Input validation with Zod
- SQL injection prevention (Prisma)
- XSS protection
- Secure session management

### 4. Development Workflow
- Feature flags for gradual rollout
- Environment-based configuration
- Automated testing strategy
- CI/CD pipeline updates

## Implementation Tasks

### Priority 1: Foundation (Must Have)
- [ ] Set up authentication system
- [ ] Implement middleware for auth checks
- [ ] Create protected route layouts
- [ ] Set up i18n infrastructure with locale detection
- [ ] Configure locale routing (en, es, pt, br, fr)
- [ ] Create language switcher with regional variants
- [ ] Set up dictionary structure for all locales
- [ ] Translate core UI elements
- [ ] Implement hreflang tags for SEO

### Priority 2: Blog (Should Have)
- [ ] Design blog database schema
- [ ] Create blog post CRUD API
- [ ] Build blog listing page
- [ ] Implement individual post pages
- [ ] Add category/tag filtering
- [ ] Set up RSS feed
- [ ] Implement blog search

### Priority 3: App Dashboard (Should Have)
- [ ] Create dashboard layout
- [ ] Build post scheduler interface
- [ ] Implement analytics views
- [ ] Add user settings page
- [ ] Create post management UI

### Priority 4: Enhancements (Nice to Have)
- [ ] Add blog comments
- [ ] Implement social sharing
- [ ] Create admin panel
- [ ] Add email notifications
- [ ] Build mobile app views
- [ ] Implement A/B testing

## Migration Strategy

### Step 1: Preparation
1. Create feature branch
2. Set up test environment
3. Backup current data

### Step 2: Incremental Migration
1. Add authentication without breaking existing pages
2. Wrap existing pages in locale route
3. Gradually translate content
4. Launch blog as separate section
5. Beta test app dashboard with select users

### Step 3: Launch
1. Gradual rollout with feature flags
2. Monitor performance metrics
3. Gather user feedback
4. Iterate based on usage data

## Technology Stack Recommendations

### Authentication
- **Primary**: NextAuth.js v5 with linkedin login

### Internationalization
- **Primary**: next-intl
- **Alternative**: next-i18next

### Blog Content
- **Primary**: MDX with next-mdx-remote
- **Alternative**: Contentful or Sanity CMS

### State Management (App Area)
- **Primary**: Zustand
- **Alternative**: TanStack Query for server state

### Form Handling
- **Existing**: React Hook Form + Zod

### Testing
- **Unit**: Vitest
- **E2E**: Playwright
- **Component**: React Testing Library

## Cost Implications

### Infrastructure
- Database: Minimal increase for blog/user data
- CDN: Increased usage for blog images
- Hosting: May need upgraded tier for app features

### Third-party Services
- Auth provider: $0-$25/month (NextAuth is free)
- Translation service: Optional ($50-200/month)
- Email service: For notifications ($10-50/month)

## Timeline

### Month 1
- Week 1-2: Authentication setup
- Week 3-4: i18n implementation

### Month 2
- Week 1-2: Blog development
- Week 3-4: App dashboard core

### Month 3
- Week 1-2: Testing and refinement
- Week 3-4: Launch preparation

## Success Metrics

### Technical
- Page load time < 2s
- Lighthouse score > 90
- Zero critical security vulnerabilities
- 99.9% uptime

### Business
- User registration rate
- Blog engagement metrics
- App usage statistics
- Multi-language adoption rates:
  - English (baseline)
  - Portuguese Brazil vs Portugal usage
  - Spanish engagement
  - French adoption

## Risks and Mitigation

### Risk 1: Complexity Overhead
**Mitigation**: Incremental implementation, feature flags

### Risk 2: Performance Degradation
**Mitigation**: Performance budget, monitoring

### Risk 3: SEO Impact
**Mitigation**: Proper redirects, maintain URL structure where possible

### Risk 4: User Confusion
**Mitigation**: Clear navigation, user onboarding

## Conclusion

This architecture provides a scalable foundation for AutomaPost's expansion into a full-featured platform with blog capabilities, authenticated app areas, and multi-language support. The modular approach allows for incremental implementation while maintaining system stability.

## Next Steps
1. Review and approve architecture
2. Finalize technology choices
3. Create detailed technical specifications
4. Begin Phase 1 implementation
5. Set up monitoring and analytics

---

*Document Version: 1.0*  
*Last Updated: 2025-08-19*  
*Author: System Architecture Team*