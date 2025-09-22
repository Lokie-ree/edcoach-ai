import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { BorderBeam } from "@/components/magicui/border-beam";
import { motion } from "framer-motion";
import landingContent from "@/data/landing-content.json";
import { STATUS_COLORS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";



export default function Pricing() {
  const { pricing } = landingContent;

  return (
    <section
      id="pricing"
      className="relative overflow-hidden py-12 md:py-16"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-secondary/5"></div>
        <div className="absolute inset-x-0 top-12 -z-[1] mx-auto h-1/3 w-2/3 rounded-full bg-primary/20 blur-3xl dark:bg-primary/10"></div>
        <div className="absolute inset-0 -top-8 left-1/2 -z-20 h-56 w-full -translate-x-1/2 [background-image:linear-gradient(to_bottom,transparent_98%,theme(colors.gray.200/75%)_98%),linear-gradient(to_right,transparent_94%,_theme(colors.gray.200/75%)_94%)] [background-size:16px_35px] [mask:radial-gradient(black,transparent_95%)] dark:opacity-10"></div>
      </div>

      <Container size="lg" padding="normal">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl xl:text-4xl mb-6">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {pricing.headline}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {pricing.sub_headline}
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {pricing.tiers.map((tier, index) => {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className=""
              >
                <Card className={cn(
                  "group p-6 rounded-xl shadow-sm h-full relative overflow-hidden transition-all duration-300 hover:shadow-lg bg-card",
                  tier.highlight ? "border-2 border-transparent" : ""
                )}>
                  {tier.highlight && (
                    <span className="absolute top-3 right-3 bg-gradient-to-r from-primary to-secondary text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg z-10">
                      Most Popular
                    </span>
                  )}
                  <div className="flex flex-col h-full">
                    <div className="mb-8">
                      <h3 className="text-2xl font-semibold mb-3">
                        {tier.name}
                      </h3>
                      <div className="text-4xl font-bold mb-2">
                        {tier.price}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tier.price_description}
                      </p>
                    </div>

                    <div className="flex-grow">
                      <ul className="space-y-4">
                        {tier.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-center gap-3 text-sm"
                          >
                            <div className={cn("flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center", STATUS_COLORS.success.bg)}>
                              <Check className={cn("h-3 w-3", STATUS_COLORS.success.text)} />
                            </div>
                            <span className="text-muted-foreground">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {tier.highlight && (
                    <>
                      <BorderBeam
                        duration={12}
                        size={300}
                        colorFrom="#3b82f6"
                        colorTo="#10b981"
                      />
                      <BorderBeam
                        duration={12}
                        delay={6}
                        size={300}
                        colorFrom="#10b981"
                        colorTo="#3b82f6"
                      />
                    </>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}