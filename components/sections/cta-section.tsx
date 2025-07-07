import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";
import { BorderBeam } from "@/components/magicui/border-beam";
import ctaData from "@/data/landing-content.json";

export default function CTASection({ onWaitlistClick }: { onWaitlistClick: () => void }) {
  const { headline, sub_headline, cta } = ctaData.cta;

  return (
    <div className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <NeonGradientCard
          borderRadius={24}
          neonColors={{
            firstColor: "#2563eb",
            secondColor: "#7c3aed",
          }}
          className="overflow-hidden relative"
        >
          <div className="py-10 px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">{headline}</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              {sub_headline}
            </p>
            <button
              className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-3 text-md font-medium text-white shadow hover:opacity-90 transition-opacity"
              onClick={onWaitlistClick}
            >
              {cta.label}
            </button>
          </div>
          <BorderBeam
            size={200}
            duration={10}
            colorFrom="#2563eb"
            colorTo="#7c3aed"
          />
        </NeonGradientCard>
      </div>
    </div>
  );
}
