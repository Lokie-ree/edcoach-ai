import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";
import { BorderBeam } from "@/components/magicui/border-beam";

export default function CTASection() {
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
            <h2 className="text-3xl font-bold mb-6">
              Ready to transform your coaching practice?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of educators using EdCoach AI to deliver better
              feedback faster.
            </p>
            <a
              href="/signup"
              className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-3 text-md font-medium text-white shadow hover:opacity-90 transition-opacity"
            >
              Get Started Today
            </a>
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
