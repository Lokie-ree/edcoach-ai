import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import AppLayout from "@/components/layout/AppLayout";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EdCoach AI - AI-Powered Instructional Coaching Platform",
  description:
    "EdCoach AI empowers school leaders and coaches with real-time, rubric-aligned feedback suggestions to improve teacher effectiveness.",
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
    description:
      "Deliver better feedback faster with AI-powered coaching insights tailored to your teaching standards.",
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
    description:
      "Deliver better feedback faster with AI-powered coaching insights.",
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
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${oswald.className} antialiased`}>
        <ClerkProvider 
          afterSignOutUrl="/"
          dynamic
        >
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
        </ClerkProvider>
        <Toaster />
      </body>
    </html>
  );
}
