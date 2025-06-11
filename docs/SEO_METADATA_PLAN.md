# SEO & Metadata Enhancement Plan (MVP)

## Overview
This document outlines a phased approach to implementing SEO and metadata improvements for EdCoach AI, focusing on essential features for MVP launch with room for future enhancements.

## Phase 1: Essential Metadata (MVP Launch)

### 1. Core Metadata Files
- [x] `app/layout.tsx` - Basic metadata implementation
- [ ] `app/favicon.ico` - Site favicon
- [ ] `app/robots.txt` - Basic search engine crawling rules
- [ ] `app/sitemap.xml` - Initial site structure

### 2. Static OG Images
- [ ] Create and add essential OG images:
  - `/public/og-image.jpg` (1200x630px)
  - `/public/twitter-image.jpg` (1200x600px)
  - `/public/apple-icon.png` (180x180px)

### 3. JSON-LD Implementation
- [x] Organization schema
- [x] Product schema
- [ ] Add FAQ schema for FAQ section
- [ ] Add BreadcrumbList schema for navigation

## Phase 2: Dynamic Metadata (Post-MVP)

### 1. Dynamic OG Images
- [ ] Implement `app/opengraph-image.tsx` for dynamic image generation
- [ ] Add page-specific OG images for key sections:
  - Dashboard
  - Teacher profiles
  - Walkthrough results

### 2. Page-Specific Metadata
- [ ] Add `generateMetadata` to key pages:
  - Dashboard
  - Teacher profiles
  - Walkthrough forms
  - Analytics pages

### 3. Enhanced Schema Markup
- [ ] Add Person schema for team members
- [ ] Add WebSite schema
- [ ] Add BreadcrumbList schema for all pages
- [ ] Add FAQ schema for help center

## Implementation Priority

### MVP Launch (Phase 1)
1. Complete core metadata in `app/layout.tsx`
2. Add essential static images
3. Implement basic JSON-LD schemas
4. Add robots.txt and sitemap.xml

### Post-MVP (Phase 2)
1. Implement dynamic OG images
2. Add page-specific metadata
3. Enhance schema markup
4. Add advanced SEO features

## Technical Implementation

### 1. Core Metadata (`app/layout.tsx`)
```typescript
export const metadata: Metadata = {
  title: "EdCoach AI - AI-Powered Instructional Coaching Platform",
  description: "EdCoach AI empowers school leaders and coaches with real-time, rubric-aligned feedback suggestions to improve teacher effectiveness.",
  keywords: [
    "instructional coaching",
    "AI coaching",
    "educational technology",
    "teacher feedback",
    "coaching platform",
    "education AI",
    "teaching improvement",
    "classroom observation",
    "education leadership",
    "rubric-aligned feedback",
  ],
  authors: [{ name: "EdCoach AI Team" }],
  openGraph: {
    title: "EdCoach AI - Transform Your Instructional Coaching",
    description: "Deliver better feedback faster with AI-powered coaching insights tailored to your teaching standards.",
    url: "https://edcoachai.org",
    siteName: "EdCoach AI",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "EdCoach AI Platform Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EdCoach AI - AI-Powered Instructional Coaching",
    description: "Deliver better feedback faster with AI-powered coaching insights.",
    images: ["/twitter-image.jpg"],
    creator: "@edcoachai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://edcoachai.com",
  },
  icons: {
    icon: "/logo.png",
    apple: "/apple-icon.png",
  },
}
```

### 2. Page-Specific Metadata Example
```typescript
// app/dashboard/page.tsx
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Dashboard | EdCoach AI',
    description: 'View your coaching analytics, teacher progress, and recent feedback.',
    openGraph: {
      title: 'Dashboard | EdCoach AI',
      description: 'View your coaching analytics, teacher progress, and recent feedback.',
      images: [
        {
          url: '/dashboard-og.jpg',
          width: 1200,
          height: 630,
          alt: 'EdCoach AI Dashboard Preview',
        },
      ],
    },
  }
}
```

### 3. Dynamic OG Image Implementation
```typescript
// app/opengraph-image.tsx
import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const alt = 'EdCoach AI - AI-Powered Instructional Coaching Platform'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <div style={{ fontSize: '80px', fontWeight: 'bold', marginBottom: '20px' }}>
          EdCoach AI
        </div>
        <div style={{ fontSize: '40px', textAlign: 'center', opacity: 0.9 }}>
          AI-Powered Instructional Coaching Platform
        </div>
      </div>
    ),
    { ...size }
  )
}
```

### 4. Robots.txt (`app/robots.txt`)
```
User-agent: *
Allow: /

# Disallow authenticated routes
Disallow: /dashboard
Disallow: /onboarding
Disallow: /api/

# Sitemap
Sitemap: https://edcoachai.com/sitemap.xml
```

### 5. Sitemap Implementation (`app/sitemap.ts`)
```typescript
import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://edcoachai.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://edcoachai.com/pricing',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://edcoachai.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}
```

### 6. Enhanced JSON-LD Schemas
```typescript
// FAQ Schema for FAQ section
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does EdCoach AI work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "EdCoach AI uses artificial intelligence to analyze classroom observations and generate rubric-aligned feedback for teachers."
      }
    }
    // Add more FAQ items
  ]
}

// WebSite Schema
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "EdCoach AI",
  "url": "https://edcoachai.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://edcoachai.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

## Success Metrics
- Search engine indexing status
- Social media preview appearance
- Page load performance (Core Web Vitals)
- Mobile responsiveness
- Schema validation (Google Rich Results Test)
- Open Graph validation (Facebook Sharing Debugger)

## Tools & Validation
- [Google Search Console](https://search.google.com/search-console)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Schema.org Validator](https://validator.schema.org/)

## Future Considerations
- Implement dynamic OG images for personalized content
- Add structured data for analytics and coaching insights
- Enhance mobile-specific metadata
- Implement internationalization metadata
- Add advanced schema markup for educational content
- Consider AMP implementation for mobile performance

## References
- [Next.js Metadata Documentation](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [Schema.org Documentation](https://schema.org/docs/documents.html)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards) 