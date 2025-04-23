import { Metadata } from "next";
import { NewObservationPageClient } from "./_components/page-client";

export const metadata: Metadata = {
  title: "New Observation | EdCoach AI",
  description: "Create a new observation or walkthrough",
};

export default function NewObservationPage() {
  return <NewObservationPageClient />;
} 