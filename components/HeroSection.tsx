"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import Link from "next/link";
import { ArrowRight, Rocket, Clock, Brain, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroContent from "@/data/heroContent.json";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { AuroraText } from "@/components/magicui/aurora-text";
import { BorderBeam } from "@/components/magicui/border-beam";

// Icon mapping
const IconMap = {
  Rocket,
  Clock,
  Brain,
  Shield,
  ArrowRight,
} as const;

type IconName = keyof typeof IconMap;

// Types
interface Feature {
  id: number;
  title: string;
  description: string;
  icon?: IconName;
}

interface HeroContent {
  metadata: {
    version: string;
    product: string;
    lastUpdated: string;
  };
  theme: {
    primaryColor: string;
    accentColor: string;
    backgroundPattern: string;
  };
  announcement: {
    badge: string;
    text: string;
    link: string;
    badgeColor: string;
  };
  hero: {
    title: string;
    titleHighlight?: string;
    description: {
      desktop: string;
      mobile: string;
    };
    cta: {
      text: string;
      link: string;
      icon?: IconName;
    };
  };
  features: Feature[];
  layout: {
    contentWidth: "narrow" | "wide" | "full";
    textAlignment: "left" | "center";
    featureDisplay: "slider" | "grid";
  };
}

// Feature Card Component
const FeatureCard = ({ feature }: { feature: Feature }) => {
  const Icon = feature.icon ? IconMap[feature.icon] : null;

  return (
    <div className="relative">
      <div className="bg-background rounded-(--radius) h-auto max-w-lg border p-9">
        <div className="mx-auto h-fit w-full text-center">
          {Icon && <Icon className="mx-auto mb-4 h-6 w-6" />}
          <h3 className="text-xl font-semibold">{feature.title}</h3>
          <p className="mt-6 text-center text-lg font-medium">
            {feature.description}
          </p>
        </div>
      </div>
      <BorderBeam
        size={40}
        duration={4}
        colorFrom="#7928CA"
        colorTo="#38bdf8"
        className="opacity-70"
      />
    </div>
  );
};

export default function HeroSection() {
  const content = heroContent as HeroContent;
  const CTAIcon = content.hero.cta.icon ? IconMap[content.hero.cta.icon] : null;

  return (
    <main className="overflow-hidden">
      <section className="relative">
        <div className="relative py-24 lg:py-28">
          <div
            className={`mx-auto px-6 md:px-12 max-w-${content.layout.contentWidth}`}
          >
            <div
              className={`sm:mx-auto sm:w-10/12 lg:mr-auto lg:mt-0 lg:w-4/5 text-${content.layout.textAlignment}`}
            >
              {/* Announcement Link */}
              <Link
                href={content.announcement.link}
                className="rounded-(--radius) mx-auto flex w-fit items-center gap-2 border p-1 pr-3"
              >
                <span
                  className={`rounded-[calc(var(--radius)-0.25rem)] px-2 py-1 text-xs ${content.announcement.badgeColor}`}
                >
                  {content.announcement.badge}
                </span>
                <AuroraText
                  className="text-sm"
                  colors={["#7928CA", "#5107f2", "#38bdf8"]}
                  speed={0.8}
                >
                  {content.announcement.text}
                </AuroraText>
                <span className="bg-(--color-border) block h-4 w-px"></span>
                <ArrowRight className="size-4" />
              </Link>

              {/* Hero Title */}
              <h1 className="mt-8 text-4xl font-semibold md:text-5xl xl:text-5xl xl:[line-height:1.125]">
                {content.hero.title.replace(
                  content.hero.titleHighlight || "",
                  "",
                )}
                {content.hero.titleHighlight && (
                  <AnimatedGradientText
                    colorFrom="#7928CA"
                    colorTo="#38bdf8"
                    speed={2}
                  >
                    {content.hero.titleHighlight}
                  </AnimatedGradientText>
                )}
              </h1>

              {/* Hero Description */}
              <p className="mx-auto mt-8 hidden max-w-2xl text-wrap text-lg sm:block">
                {content.hero.description.desktop}
              </p>
              <p className="mx-auto mt-6 max-w-2xl text-wrap sm:hidden">
                {content.hero.description.mobile}
              </p>

              {/* CTA Button */}
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link
                    href={content.hero.cta.link}
                    className="flex items-center gap-2"
                  >
                    {CTAIcon && <CTAIcon className="relative size-4" />}
                    <span className="text-nowrap">{content.hero.cta.text}</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Features Section */}
            <div className="x-auto relative mx-auto mt-8 max-w-lg sm:mt-12">
              {/* Background decorative elements */}
              <div className="absolute inset-0 -top-8 left-1/2 -z-20 h-56 w-full -translate-x-1/2 [background-image:linear-gradient(to_bottom,transparent_98%,theme(colors.gray.200/75%)_98%),linear-gradient(to_right,transparent_94%,_theme(colors.gray.200/75%)_94%)] [background-size:16px_35px] [mask:radial-gradient(black,transparent_95%)] dark:opacity-10"></div>
              <div className="absolute inset-x-0 top-12 -z-[1] mx-auto h-1/3 w-2/3 rounded-full bg-blue-300 blur-3xl dark:bg-white/20"></div>

              {content.layout.featureDisplay === "slider" ? (
                <Swiper
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                  loop
                  autoplay={{ delay: 5000 }}
                  modules={[Autoplay, EffectCoverflow]}
                >
                  {content.features.map((feature) => (
                    <SwiperSlide key={feature.id} className="px-2">
                      <FeatureCard feature={feature} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {content.features.map((feature) => (
                    <FeatureCard key={feature.id} feature={feature} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
