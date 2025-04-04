import HeroSection from "@/components/hero-section";
import { Section } from "@/components/ui/section";
import landingContent from "@/data/landing-content.json";

export default function Home() {
  return (
    <>
      {/* Hero section - kept as is because it has its own styling */}
      <HeroSection />

      {/* Placeholder for other sections */}
      <Section variant="default" background="subtle" id="features">
        <h2 className="text-3xl font-bold mb-8 text-center">
          {landingContent.features.headline}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {landingContent.features.cards.map((card, index) => (
            <div 
              key={index} 
              className="bg-card p-6 rounded-lg shadow-sm border border-border"
            >
              <h3 className="text-xl font-semibold mb-3">{card.title}</h3>
              <p className="text-muted-foreground">{card.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Other sections to be added later */}
      <div className="h-24 bg-muted/10 flex items-center justify-center">
        <p className="text-muted-foreground">More sections coming soon...</p>
      </div>
    </>
  );
}
