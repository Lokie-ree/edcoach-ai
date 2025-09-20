"use client";
import React, { useEffect, useRef } from "react";
import {
  ArrowRight,
  Target,
  Eye,
  Sparkles,
  MessageSquare,
  TrendingUp,
  ChevronDown,
  Play,
  CheckCircle,
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

  // Precursor-inspired particle animation
  useEffect(() => {
    if (typeof window !== "undefined") {
      const canvas = document.getElementById("particle-canvas") as HTMLCanvasElement;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const particles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.3 + 0.1,
      }));

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
          particle.y += particle.speed;
          if (particle.y > canvas.height) particle.y = 0;

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`;
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
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      id="hero"
    >
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Particle canvas */}
      <canvas
        id="particle-canvas"
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      <Container size="lg" padding="normal" className="relative z-10">
        <div className="grid gap-16 lg:grid-cols-2 items-center min-h-[80vh]">
          {/* Left content - Precursor-inspired clean layout */}
          <div className="flex flex-col space-y-8">
            {/* Animated badge - Precursor style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-fit"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1.5 text-sm backdrop-blur-sm shadow-sm">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="font-medium text-foreground">Free to start</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                <span className="text-muted-foreground">No credit card required</span>
              </div>
            </motion.div>

            {/* Main headline - Precursor typography style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
                <span className="block">Start with</span>
                <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Structure
                </span>
                <span className="block text-foreground/80">End Vibe Coding Chaos</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                EdCoach AI helps educators plan, observe, and iterate on classroom walkthroughs with intelligent guidance, designed to work with your existing coaching workflow.
              </p>
            </motion.div>

            {/* CTA buttons - Precursor style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <span>Join the Waitlist</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </SignInButton>
              
              <Button
                variant="outline"
                size="lg"
                className="border-primary/20 hover:bg-primary/5 transition-all duration-300"
              >
                <Play className="mr-2 h-4 w-4" />
                Learn More
              </Button>
            </motion.div>

            {/* Social proof - Precursor style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">5x</span>
                <span>Faster Planning</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">250+</span>
                <span>Educators Waiting</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">100%</span>
                <span>AI-Powered</span>
              </div>
            </motion.div>
          </div>

          {/* Right content - Precursor-inspired interactive demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Main demo card */}
            <div className="relative bg-card rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
              {/* Card header */}
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <Logo variant="storytelling" size="sm" showText={false} />
                  <div>
                    <h3 className="font-semibold text-foreground">EdCoach AI</h3>
                    <p className="text-sm text-muted-foreground">Continuous Growth Loop</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="h-3 w-3 rounded-full bg-destructive" />
                  <div className="h-3 w-3 rounded-full bg-warning" />
                  <div className="h-3 w-3 rounded-full bg-success" />
                </div>
              </div>

              {/* Demo content */}
              <div className="p-6 space-y-4">
                {/* 5-phase continuous growth loop */}
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { icon: Target, label: "Goal", color: "bg-primary/10 text-primary border-primary/20" },
                    { icon: Eye, label: "Capture", color: "bg-secondary/10 text-secondary border-secondary/20" },
                    { icon: Sparkles, label: "Generate", color: "bg-accent/10 text-accent border-accent/20" },
                    { icon: MessageSquare, label: "Reflect", color: "bg-primary/10 text-primary border-primary/20" },
                    { icon: TrendingUp, label: "Monitor", color: "bg-secondary/10 text-secondary border-secondary/20" },
                  ].map((phase, index) => (
                    <motion.div
                      key={phase.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-300 hover:scale-105",
                        phase.color
                      )}
                    >
                      <phase.icon className="h-6 w-6" />
                      <span className="text-xs font-medium">{phase.label}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">90%</div>
                    <div className="text-sm text-muted-foreground">Time Saved on Planning</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">5x</div>
                    <div className="text-sm text-muted-foreground">Faster Documentation</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-card rounded-lg shadow-lg p-3 border border-border/50"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                <span className="text-sm font-medium">AI-Generated</span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-4 -left-4 bg-card rounded-lg shadow-lg p-3 border border-border/50"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">5x</span>
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
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
        >
          <span className="text-sm text-muted-foreground mb-2">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown className="h-5 w-5 text-primary" />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
