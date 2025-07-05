"use client";
import React from "react";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { BorderBeam } from "@/components/magicui/border-beam";
import landingContent from "@/data/landing-content.json";
import { motion } from "framer-motion";
import { BotMessageSquare, FileCog, LineChart, ClipboardList, UserCheck } from "lucide-react";

// Map icon strings to components
const iconMap = {
  BotMessageSquare: BotMessageSquare,
  FileCog: FileCog,
  LineChart: LineChart,
  ClipboardList: ClipboardList,
  UserCheck: UserCheck,
  // Add other icon mappings as needed
};

export default function FeaturesSection() {
  const { features } = landingContent;

  // Function to get icon component based on string name
  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent className="h-8 w-8" /> : null;
  };

  // Generate gradient colors based on index
  const getGradientColors = (index: number) => {
    const gradients = [
      { from: "#6366F1", to: "#8B5CF6" }, // indigo to purple
      { from: "#8B5CF6", to: "#EC4899" }, // purple to pink
      { from: "#3B82F6", to: "#6366F1" }, // blue to indigo
    ];

    return gradients[index % gradients.length];
  };

  return (
    <Section
      id="features"
      spacing="compact"
      className="relative"
    >
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl xl:text-4xl mb-6">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
              {features.headline}
            </span>
          </h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.cards.map((feature, index) => {
            const { from, to } = getGradientColors(index);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 rounded-xl shadow-sm h-full relative overflow-hidden">
                  <div className="flex flex-col gap-4 h-full">
                    <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 w-14 h-14 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      {getIconComponent(feature.icon)}
                    </div>

                    <h3 className="text-xl font-semibold">{feature.title}</h3>

                    <p className="text-gray-600 dark:text-gray-300 flex-grow">
                      {feature.description}
                    </p>
                  </div>
                  <BorderBeam
                    duration={6}
                    size={300}
                    colorFrom={from}
                    colorTo={to}
                  />
                  <BorderBeam
                    duration={6}
                    delay={3}
                    size={300}
                    colorFrom={to}
                    colorTo={from}
                  />
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
