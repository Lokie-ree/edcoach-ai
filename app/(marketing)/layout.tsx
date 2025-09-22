import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EdCoachAi - AI-Powered Instructional Coaching Platform",
  description:
    "Transform instructional coaching with EdCoachAi's AI-powered platform. Deliver rubric-aligned feedback, track teacher growth, and improve classroom effectiveness with real-time coaching insights. Join thousands of educators improving teaching quality.",
  
  // Enhanced Open Graph for landing page
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://edcoachai.org",
    title: "EdCoachAi - Transform Your Instructional Coaching",
    description:
      "Stop spending more time on paperwork than actual coaching. Deliver better feedback faster with AI-powered insights tailored to your teaching standards.",
    siteName: "EdCoachAi",
    images: [
      {
        url: "/brand/logos/primary-icon.png",
        width: 1200,
        height: 630,
        alt: "EdCoachAi - AI-Powered Instructional Coaching Platform",
      },
    ],
  },
  
  // Enhanced Twitter Card for landing page
  twitter: {
    card: "summary_large_image",
    site: "@edcoachai",
    creator: "@edcoachai",
    title: "EdCoachAi - AI-Powered Instructional Coaching",
    description:
      "Transform your coaching with AI-powered insights. Deliver better feedback faster and improve teacher effectiveness.",
    images: ["/brand/logos/primary-icon.png"],
  },
  
  // Landing page specific keywords
  keywords: [
    "instructional coaching software",
    "AI coaching platform",
    "teacher feedback system",
    "classroom observation tools",
    "education technology",
    "teaching improvement platform",
    "rubric-aligned feedback",
    "coaching management system",
    "teacher professional development",
    "educational assessment tools",
    "instructional leadership platform",
    "school improvement technology",
    "coaching platform for educators",
    "teacher evaluation software",
    "classroom walkthrough tools"
  ],
  
  // Additional metadata for landing page
  alternates: {
    canonical: "https://edcoachai.org",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
