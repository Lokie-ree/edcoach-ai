import { Metadata } from "next";
import { WalkthroughForm } from "@/components/walkthrough-form";
export const metadata: Metadata = {
  title: "New Observation | EdCoach AI",
  description: "Create a new observation or walkthrough using our simplified form",
  keywords: ["observation", "walkthrough", "education", "teaching", "feedback"],
  openGraph: {
    title: "New Observation | EdCoach AI",
    description: "Create a new observation or walkthrough using our simplified form",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "New Observation | EdCoach AI",
    description: "Create a new observation or walkthrough using our simplified form",
  },
};

export default function NewObservationPage() {
  return (
    <div className="relative">
      {/* Background gradient effect */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-background to-card/30" />
      </div>

      {/* Content */}
      <div className="container max-w-4xl py-8 relative">
        <WalkthroughForm />
      </div>
    </div>
  );
} 