"use client";
import React, { useEffect, useRef } from "react";
import {
  ArrowRight,
  ClipboardList,
  MessageSquareText,
  LineChart,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import landingContent from "@/data/landing-content.json";
import { Logo } from "@/components/common/Logo";
import { Container } from "@/components/ui/container";
import { SignInButton } from "@clerk/nextjs";
import { ICONS, STATUS_COLORS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { hero } = landingContent;

  // Particle animation effect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 5 + 2,
        speed: Math.random() * 0.5 + 0.1,
      }));

      const canvas = document.getElementById(
        "particle-canvas",
      ) as HTMLCanvasElement;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const resizeCanvas = () => {
        if (heroRef.current) {
          canvas.width = heroRef.current.offsetWidth;
          canvas.height = heroRef.current.offsetHeight;
        }
      };

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      const animate = () => {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((particle) => {
          // Update position
          particle.y += particle.speed;
          if (particle.y > 100) particle.y = 0;

          // Draw particle
          const x = (particle.x / 100) * canvas.width;
          const y = (particle.y / 100) * canvas.height;

          ctx.beginPath();
          ctx.arc(x, y, particle.size / 3, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(99, 102, 241, 0.1)";
          ctx.fill();
        });

        requestAnimationFrame(animate);
      };

      animate();

      return () => {
        window.removeEventListener("resize", resizeCanvas);
      };
    }
  }, []);

  return (
    <section
      className=""
      id="hero"
    >

      

        <Container size="lg" padding="normal">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="flex flex-col space-y-8">
              {/* Animated badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-fit"
              >
                <div className="rounded-full flex w-fit items-center gap-2 border border-primary/20 bg-background/80 p-1 pr-3 shadow-sm backdrop-blur-sm dark:border-primary/20 dark:bg-card/80">
                  <span className={cn(STATUS_COLORS.success.bg, STATUS_COLORS.success.text, "rounded-full px-2 py-1 text-xs font-medium")}>
                    Free
                  </span>
                  <span className="text-xs">
                    Start free today - no credit card required
                  </span>
                  <span className="block h-4 w-px bg-border dark:bg-border"></span>
                  <ArrowRight className={cn(ICONS.semantic.inline, "text-primary dark:text-primary")} />
                </div>
              </motion.div>

              {/* Headline with gradient text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-6"
              >
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl xl:text-5xl xl:[line-height:1.125]">
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent dark:from-primary dark:to-accent">
                    {hero.headline}
                  </span>{" "}
                  <br className="hidden md:block" />
                </h1>
                <h2 className="text-xl font-semibold text-primary dark:text-primary">
                  {hero.tagline}
                </h2>
                <p className="text-lg text-muted-foreground dark:text-muted-foreground max-w-xl">
                  {hero.sub_headline}
                </p>
              </motion.div>

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <SignInButton mode="modal">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 shadow-md hover:shadow-lg group"
                  >
                    <span>{hero.cta_primary.label}</span>
                    <ArrowRight className={cn(ICONS.semantic.inline, "ml-2 transition-transform group-hover:translate-x-1")} />
                  </Button>
                </SignInButton>
              </motion.div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="inline-block h-8 w-8 rounded-full bg-gradient-to-br from-primary/60 to-secondary/60 p-0.5"
                    >
                      <div className="h-full w-full rounded-full bg-background flex items-center justify-center text-xs font-medium">
                        {String.fromCharCode(64 + i)}
                      </div>
                    </div>
                  ))}
                </div>
                <span>
                  Trusted by{" "}
                  <span className="font-medium text-primary">
                    100+
                  </span>{" "}
                  school leaders
                </span>
              </motion.div>
            </div>

            {/* 3D-like floating illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mx-auto max-w-md"
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-70 dark:from-primary/30 dark:to-secondary/30 transform -rotate-2"></div>

              <div className="relative bg-card rounded-2xl border border-primary/20 shadow-xl overflow-hidden p-1 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-secondary"></div>

                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                        <Logo />
                      </div>
                      <div>
                        <h3 className="font-semibold">EdCoachAi</h3>
                        <p className="text-xs text-muted-foreground">
                          Observation Dashboard
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-3 w-3 rounded-full bg-destructive"></div>
                      <div className="h-3 w-3 rounded-full bg-warning"></div>
                      <div className="h-3 w-3 rounded-full bg-success"></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className={cn("flex items-center gap-3 p-3 rounded-lg border", STATUS_COLORS.coach.bg, STATUS_COLORS.coach.border)}>
                      <ClipboardList className={cn(ICONS.sizes.lg, STATUS_COLORS.coach.text)} />
                      <div>
                        <h4 className="font-medium">Observe & Align</h4>
                        <p className="text-xs text-muted-foreground">
                          Capture evidence and tag to rubric indicators
                        </p>
                      </div>
                    </div>

                    <div className={cn("flex items-center gap-3 p-3 rounded-lg border", STATUS_COLORS.teacher.bg, STATUS_COLORS.teacher.border)}>
                      <MessageSquareText className={cn(ICONS.sizes.lg, STATUS_COLORS.teacher.text)} />
                      <div>
                        <h4 className="font-medium">
                          Generate & Refine Feedback
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          AI-powered suggestions based on your notes
                        </p>
                      </div>
                    </div>

                    <div className={cn("flex items-center gap-3 p-3 rounded-lg border", STATUS_COLORS.info.bg, STATUS_COLORS.info.border)}>
                      <LineChart className={cn(ICONS.sizes.lg, STATUS_COLORS.info.text)} />
                      <div>
                        <h4 className="font-medium">Track & Support Growth</h4>
                        <p className="text-xs text-muted-foreground">
                          Visualize performance trends in real-time
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Time saved:
                        </span>
                        <span className="ml-2 font-medium text-primary">
                          4.5 hours/week
                        </span>
                      </div>
                      <div className={cn("text-white text-xs font-medium px-2.5 py-1 rounded-full", STATUS_COLORS.success.solid)}>
                        +30% Teacher Growth
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 3,
                  ease: "easeInOut",
                }}
                className="absolute -top-6 -right-4 bg-card rounded-lg shadow-lg p-2 border border-primary/20"
              >
                <div className="flex items-center gap-2">
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", STATUS_COLORS.success.bg)}>
                    <ArrowRight className={cn(ICONS.semantic.inline, STATUS_COLORS.success.text)} />
                  </div>
                  <span className="text-sm font-medium">AI-Generated</span>
                </div>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 10, 0],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 4,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute -bottom-4 -left-6 bg-card rounded-lg shadow-lg p-2 border border-primary/20"
              >
                <div className="flex items-center gap-2">
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", STATUS_COLORS.teacher.bg)}>
                    <span className={cn("text-sm font-bold", STATUS_COLORS.teacher.text)}>
                      5x
                    </span>
                  </div>
                  <span className="text-sm font-medium">Faster Feedback</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
          >
            <span className="text-sm text-muted-foreground mb-2">
              Scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
            >
              <ChevronDown className={cn(ICONS.sizes.md, "text-primary")} />
            </motion.div>
          </motion.div>
        </Container>
      
    </section>
  );
}
