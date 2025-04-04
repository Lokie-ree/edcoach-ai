import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import HowItWorksSection from "@/components/how-it-works-section";

export default function Home() {
  return (
    <>
      {/* Hero section */}
      <HeroSection />

      {/* Features section with BorderBeam effects */}
      <FeaturesSection />

      {/* How it works section with BorderBeam effects */}
      <HowItWorksSection />

      {/* Other sections to be added later */}
      <div className="h-24 bg-muted/10 flex items-center justify-center">
        <p className="text-muted-foreground">More sections coming soon...</p>
      </div>
    </>
  );
}
