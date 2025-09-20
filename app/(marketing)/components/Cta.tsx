import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Container } from "@/components/ui/container";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import ctaData from "@/data/landing-content.json";
import { ANIMATIONS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export default function CTASection() {
  const { headline, sub_headline, cta } = ctaData.cta;

  return (
    <section id="cta" className="relative overflow-hidden py-12 md:py-16">
      <Container size="md" padding="normal">
        <NeonGradientCard
          borderRadius={24}
          neonColors={{
            firstColor: "hsl(var(--primary))",
            secondColor: "hsl(var(--secondary))",
          }}
          className="overflow-hidden relative"
        >
          <div className="py-8 px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">{headline}</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              {sub_headline}
            </p>
            <SignInButton mode="modal">
              <Button className={cn("bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 px-8 py-3 text-md font-medium shadow hover:shadow-lg", ANIMATIONS.classes.normal)}>
                {cta.label}
              </Button>
            </SignInButton>
          </div>
          <BorderBeam
            size={200}
            duration={10}
            colorFrom="hsl(var(--primary))"
            colorTo="hsl(var(--secondary))"
          />
        </NeonGradientCard>
      </Container>
    </section>
  );
}
