import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Section } from "@/components/ui/section";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import ctaData from "@/data/landing-content.json";

export default function CTASection() {
  const { headline, sub_headline, cta } = ctaData.cta;

  return (
    <Section id="cta" spacing="landing" className="relative overflow-hidden">
      <div className="mx-auto max-w-4xl px-6">
        <NeonGradientCard
          borderRadius={24}
          neonColors={{
            firstColor: "#2563eb",
            secondColor: "#7c3aed",
          }}
          className="overflow-hidden relative"
        >
          <div className="py-8 px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">{headline}</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              {sub_headline}
            </p>
            <SignInButton mode="modal">
              <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 px-8 py-3 text-md font-medium shadow hover:shadow-lg transition-all duration-300">
                {cta.label}
              </Button>
            </SignInButton>
          </div>
          <BorderBeam
            size={200}
            duration={10}
            colorFrom="#2563eb"
            colorTo="#7c3aed"
          />
        </NeonGradientCard>
      </div>
    </Section>
  );
}
