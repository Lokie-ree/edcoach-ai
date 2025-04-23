"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type ObservationType = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

const observationTypes: ObservationType[] = [
  {
    id: "classroom",
    title: "Classroom Observation",
    description: "Observe teaching and learning in a classroom setting",
    icon: "🏫",
  },
  {
    id: "walkthrough",
    title: "Walkthrough",
    description: "Brief, focused observation of specific teaching practices",
    icon: "🚶",
  },
];

interface TypeStepProps {
  selectedType: string | null;
  onSelectType: (type: string) => void;
}

export function TypeStep({ selectedType, onSelectType }: TypeStepProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {observationTypes.map((type) => (
        <motion.div
          key={type.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            className={cn(
              "p-6 cursor-pointer transition-all bg-gradient-to-br from-white to-indigo-50/30 dark:from-zinc-900 dark:to-indigo-950/10",
              selectedType === type.id
                ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20"
                : "border-indigo-200/50 dark:border-indigo-800/20 hover:border-indigo-400 dark:hover:border-indigo-600"
            )}
            onClick={() => onSelectType(type.id)}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{type.icon}</div>
              <div>
                <h3 className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                  {type.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {type.description}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
} 