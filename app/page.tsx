import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import HowItWorksSection from "@/components/how-it-works-section";
import Pricing from "@/components/pricing";
import TestimonialsSection from "@/components/testimonials-section";
import FAQSection from "@/components/faq-section";
import Footer from "@/components/footer";
import { Metadata } from "next";
import CTASection from "@/components/cta-section";

export const metadata: Metadata = {
  title: "EdCoach AI - AI-Powered Instructional Coaching Platform",
  description:
    "EdCoach AI empowers school leaders and coaches with real-time, rubric-aligned feedback suggestions.",
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <Pricing />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </>
  );
}
