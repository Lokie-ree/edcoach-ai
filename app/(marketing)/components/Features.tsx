"use client";
import React from "react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import landingContent from "@/data/landing-content.json";
import { motion } from "framer-motion";
import { STATUS_COLORS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { 
  BotMessageSquare, 
  FileCog, 
  LineChart, 
  ClipboardList, 
  UserCheck, 
  Send,
  MessageSquareShare,
  TrendingUp,
  LayoutDashboard,
  Target,
  Clock,
  BarChart3,
  Eye,
  Sparkles
} from "lucide-react";
import { ICONS } from "@/lib/design-tokens";

// Map icon strings to components
const iconMap = {
  BotMessageSquare: BotMessageSquare,
  FileCog: FileCog,
  LineChart: LineChart,
  ClipboardList: ClipboardList,
  UserCheck: UserCheck,
  Send: Send,
  MessageSquareShare: MessageSquareShare,
  TrendingUp: TrendingUp,
  LayoutDashboard: LayoutDashboard,
  Target: Target,
  Clock: Clock,
  BarChart3: BarChart3,
  Eye: Eye,
  Sparkles: Sparkles,
};

export default function FeaturesSection() {
  const { features } = landingContent;

  // Function to get icon component based on string name
  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent className={ICONS.sizes.lg} /> : null;
  };


  return (
    <section
      id="features"
      className="relative py-12 md:py-16"
    >
      <Container size="md" padding="normal">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl xl:text-4xl mb-6">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {features.headline}
            </span>
          </h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.cards.map((feature, index) => {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 rounded-xl shadow-sm h-full relative overflow-hidden bg-card">
                  <div className="flex flex-col gap-4 h-full">
                    <div className={cn("rounded-full w-14 h-14 flex items-center justify-center", STATUS_COLORS.coach.bg)}>
                      <div className="text-primary">
                        {getIconComponent(feature.icon)}
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold">{feature.title}</h3>

                    <p className="text-muted-foreground flex-grow">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
