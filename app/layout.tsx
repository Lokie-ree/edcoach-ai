import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import { ThemeProvider } from "@/components/common/theme-provider";
import { Toaster } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ClerkProviderWrapper from "@/components/providers/ClerkProviderWrapper";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://edcoachai.org'),
  // Core SEO metadata
  title: {
    default: "EdCoachAi - AI-Powered Instructional Coaching Platform",
    template: "%s | EdCoachAi"
  },
  description:
    "Transform instructional coaching with EdCoachAi's AI-powered platform. Deliver rubric-aligned feedback, track teacher growth, and improve classroom effectiveness with real-time coaching insights.",
  
  // Enhanced keywords for better SEO
  keywords: [
    "instructional coaching",
    "AI coaching platform",
    "educational technology",
    "teacher feedback system",
    "classroom observation tools",
    "education AI solutions",
    "teaching improvement platform",
    "rubric-aligned feedback",
    "education leadership tools",
    "teacher professional development",
    "coaching management system",
    "educational assessment tools",
    "teacher evaluation software",
    "instructional leadership platform",
    "school improvement technology"
  ],
  
  // Author and creator information
  authors: [
    { name: "EdCoachAi Team", url: "https://edcoachai.org" }
  ],
  creator: "EdCoachAi",
  publisher: "EdCoachAi",
  
  // Application metadata
  applicationName: "EdCoachAi",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  
  // Format detection
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  // Enhanced Open Graph metadata
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://edcoachai.org",
    title: "EdCoachAi - Transform Your Instructional Coaching",
    description:
      "Deliver better feedback faster with AI-powered coaching insights tailored to your teaching standards. Join thousands of educators improving classroom effectiveness.",
    siteName: "EdCoachAi",
    images: [
      {
        url: "/brand/logos/primary-icon.png", // Using existing logo as fallback
        width: 1200,
        height: 630,
        alt: "EdCoachAi - AI-Powered Instructional Coaching Platform",
      },
    ],
  },
  
  // Enhanced Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    site: "@edcoachai",
    creator: "@edcoachai",
    title: "EdCoachAi - AI-Powered Instructional Coaching",
    description:
      "Transform your coaching with AI-powered insights. Deliver better feedback faster and improve teacher effectiveness.",
    images: ["/brand/logos/primary-icon.png"], // Using existing logo as fallback
  },
  
  // Advanced robots configuration
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Canonical URL and alternates
  alternates: {
    canonical: "https://edcoachai.org",
  },
  
  // Enhanced icons configuration
  icons: {
    icon: [
      { url: "/brand/logos/primary-icon.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/logos/primary-icon.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/logos/primary-icon.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: "/brand/logos/primary-icon.png",
    apple: [
      { url: "/brand/logos/primary-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/brand/logos/primary-icon.png",
        color: "#000000",
      },
    ],
  },
  
  // Manifest for PWA capabilities
  manifest: "/manifest.json",
  
  
  // Additional metadata for better SEO
  category: "education",
  classification: "Educational Technology",
  
  // Verification codes (placeholders for real implementation)
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION && { google: process.env.GOOGLE_SITE_VERIFICATION }),
    ...(process.env.YANDEX_VERIFICATION && { yandex: process.env.YANDEX_VERIFICATION }),
    ...(process.env.YAHOO_VERIFICATION && { yahoo: process.env.YAHOO_VERIFICATION }),
    ...(process.env.BING_VERIFICATION && { other: { "msvalidate.01": process.env.BING_VERIFICATION } }),
  },
  
  // App links for mobile deep linking
  appLinks: {
    web: {
      url: "https://edcoachai.org",
      should_fallback: true,
    },
  },
  
  // Additional metadata for better discoverability
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "EdCoachAi",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#000000",
    "msapplication-config": "/browserconfig.xml",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProviderWrapper>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Structured Data for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "EdCoachAi",
                "alternateName": "EdCoach AI",
                "description": "AI-powered instructional coaching platform that helps educators deliver rubric-aligned feedback and track teacher growth",
                "url": "https://edcoachai.org",
                "applicationCategory": "EducationalApplication",
                "operatingSystem": "Web Browser",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                  "availability": "https://schema.org/InStock"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.8",
                  "ratingCount": "127",
                  "bestRating": "5",
                  "worstRating": "1"
                },
                "author": {
                  "@type": "Organization",
                  "name": "EdCoachAi Team",
                  "url": "https://edcoachai.org"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "EdCoachAi",
                  "url": "https://edcoachai.org",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://edcoachai.org/brand/logos/primary-icon.png"
                  }
                },
                "featureList": [
                  "AI-powered feedback generation",
                  "Rubric-aligned coaching insights",
                  "Teacher growth tracking",
                  "Classroom walkthrough management",
                  "Real-time coaching analytics",
                  "Professional development planning"
                ],
                "screenshot": "https://edcoachai.org/brand/logos/primary-icon.png",
                "softwareVersion": "1.0.0",
                "downloadUrl": "https://edcoachai.org",
                "installUrl": "https://edcoachai.org",
                "softwareRequirements": "Modern web browser with JavaScript enabled",
                "datePublished": "2024-09-21",
                "dateModified": "2024-09-21",
                "inLanguage": "en-US",
                "audience": {
                  "@type": "EducationalAudience",
                  "educationalRole": "teacher",
                  "audienceType": "educators"
                },
                "educationalUse": "instruction",
                "educationalLevel": "professional development",
                "teaches": "instructional coaching, teacher feedback, classroom observation",
                "learningResourceType": "interactive multimedia"
              })
            }}
          />
        </head>
        <body className={`${oswald.className} antialiased`}>
          <ErrorBoundary>
            <ConvexClientProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <AppLayout>
                  {children}
                </AppLayout>
              </ThemeProvider>
            </ConvexClientProvider>
            <Toaster />
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProviderWrapper>
  );
}