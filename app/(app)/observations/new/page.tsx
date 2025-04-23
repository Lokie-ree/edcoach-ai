import { Metadata } from "next";
import { NewObservationPageClient } from "./_components/page-client";

export const metadata: Metadata = {
  title: "New Observation | EdCoach AI",
  description: "Create a new observation or walkthrough using our step-by-step wizard",
  keywords: ["observation", "walkthrough", "education", "teaching", "feedback"],
  openGraph: {
    title: "New Observation | EdCoach AI",
    description: "Create a new observation or walkthrough using our step-by-step wizard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "New Observation | EdCoach AI",
    description: "Create a new observation or walkthrough using our step-by-step wizard",
  },
};

export default function NewObservationPage() {
  return (
    <div className="relative">
      {/* Background gradient effect */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white to-indigo-50/30 dark:from-zinc-900 dark:to-indigo-950/10" />
      </div>

      {/* Content */}
      <div className="container max-w-4xl py-8 relative">
        <NewObservationPageClient />
      </div>
    </div>
  );
} 