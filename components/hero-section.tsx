"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
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
import { Logo } from "@/components/logo";
import { Section } from "@/components/ui/section";

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
    <Section
      variant="full-bleed"
      spacing="compact"
      className="relative"
      id="hero"
    >
      <div ref={heroRef} className="relative w-full h-full">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <canvas
            id="particle-canvas"
            className="absolute inset-0 w-full h-full"
          ></canvas>
          <div className="absolute inset-0 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 dark:from-zinc-950 dark:via-indigo-950/10 dark:to-purple-950/10"></div>
          <div className="absolute inset-x-0 top-12 -z-[1] mx-auto h-1/3 w-2/3 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10"></div>
          <div className="absolute inset-0 -top-8 left-1/2 -z-20 h-56 w-full -translate-x-1/2 [background-image:linear-gradient(to_bottom,transparent_98%,theme(colors.gray.200/75%)_98%),linear-gradient(to_right,transparent_94%,_theme(colors.gray.200/75%)_94%)] [background-size:16px_35px] [mask:radial-gradient(black,transparent_95%)] dark:opacity-10"></div>
        </div>

        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="flex flex-col space-y-8">
              {/* Animated badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-fit"
              >
                <div className="rounded-full flex w-fit items-center gap-2 border border-indigo-200 bg-white/80 p-1 pr-3 shadow-sm backdrop-blur-sm dark:border-indigo-800 dark:bg-zinc-900/80">
                  <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded-full px-2 py-1 text-xs font-medium">
                    New
                  </span>
                  <span className="text-xs">
                    Join the waitlist for early access
                  </span>
                  <span className="block h-4 w-px bg-gray-300 dark:bg-gray-700"></span>
                  <ArrowRight className="size-4 text-indigo-600 dark:text-indigo-400" />
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
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                    {hero.headline}
                  </span>{" "}
                  <br className="hidden md:block" />
                </h1>
                <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                  {hero.tagline}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl">
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
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg group"
                  asChild
                >
                  <Link href={hero.cta_primary.href}>
                    <span>{hero.cta_primary.label}</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all duration-300"
                  asChild
                >
                  <Link href="#how-it-works">
                    <span>Learn More</span>
                  </Link>
                </Button>
              </motion.div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="inline-block h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 p-0.5"
                    >
                      <div className="h-full w-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-xs font-medium">
                        {String.fromCharCode(64 + i)}
                      </div>
                    </div>
                  ))}
                </div>
                <span>
                  Trusted by{" "}
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
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
              <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-indigo-200 to-purple-200 rounded-2xl blur-xl opacity-70 dark:from-indigo-900/30 dark:to-purple-900/30 transform -rotate-2"></div>

              <div className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 shadow-xl overflow-hidden p-1 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        <Logo />
                      </div>
                      <div>
                        <h3 className="font-semibold">EdCoach AI</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Observation Dashboard
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-3 w-3 rounded-full bg-red-400"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                      <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/30">
                      <ClipboardList className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <h4 className="font-medium">Observe & Align</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          Capture evidence and tag to rubric indicators
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800/30">
                      <MessageSquareText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      <div>
                        <h4 className="font-medium">
                          Generate & Refine Feedback
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          AI-powered suggestions based on your notes
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800/30">
                      <LineChart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      <div>
                        <h4 className="font-medium">Track & Support Growth</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          Visualize performance trends in real-time
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Time saved:
                        </span>
                        <span className="ml-2 font-medium text-indigo-600 dark:text-indigo-400">
                          4.5 hours/week
                        </span>
                      </div>
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
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
                className="absolute -top-6 -right-4 bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-2 border border-indigo-100 dark:border-indigo-800/30"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-green-600 dark:text-green-400" />
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
                className="absolute -bottom-4 -left-6 bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-2 border border-indigo-100 dark:border-indigo-800/30"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
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
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
            >
              <ChevronDown className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
