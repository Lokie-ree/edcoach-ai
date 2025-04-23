"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypeStep } from "./type-step";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DetailsStep } from "./details-step";

type Step = {
  id: string;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    id: "type",
    title: "Observation Type",
    description: "Select the type of observation you want to create",
  },
  {
    id: "details",
    title: "Details",
    description: "Basic observation information",
  },
  {
    id: "rubric",
    title: "Rubric",
    description: "Select evaluation criteria",
  },
  {
    id: "evidence",
    title: "Evidence",
    description: "Record observations",
  },
  {
    id: "feedback",
    title: "Feedback",
    description: "Provide constructive feedback",
  },
];

export default function Wizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case "type":
        return <TypeStep selectedType={selectedType} onSelectType={setSelectedType} />;
      case "details":
        return <DetailsStep onNext={handleNext} onBack={handleBack} />;
      case "rubric":
        return (
          <Card className="p-6 bg-gradient-to-br from-white to-indigo-50/30 dark:from-zinc-900 dark:to-indigo-950/10">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
              Rubric Selection
            </h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </Card>
        );
      case "evidence":
        return (
          <Card className="p-6 bg-gradient-to-br from-white to-indigo-50/30 dark:from-zinc-900 dark:to-indigo-950/10">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
              Evidence Collection
            </h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </Card>
        );
      case "feedback":
        return (
          <Card className="p-6 bg-gradient-to-br from-white to-indigo-50/30 dark:from-zinc-900 dark:to-indigo-950/10">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
              Feedback
            </h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <motion.div 
        className="flex items-center justify-between px-8 md:px-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "flex items-center",
              index < steps.length - 1 ? "flex-1" : ""
            )}
          >
            <motion.div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full",
                index <= currentStep
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  : "bg-muted"
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {index + 1}
            </motion.div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-[2px] mx-2 rounded-full",
                  index < currentStep
                    ? "bg-gradient-to-r from-indigo-600/80 via-purple-600/80 to-indigo-600/80"
                    : "bg-muted/50"
                )}
              />
            )}
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-white to-indigo-50/30 dark:from-zinc-900 dark:to-indigo-950/10">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
              {steps[currentStep].title}
            </CardTitle>
            <p className="text-muted-foreground">
              {steps[currentStep].description}
            </p>
          </CardHeader>
          <CardContent>
            {renderStepContent()}

            <div className="flex justify-between space-x-4 mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="border-indigo-200/50 dark:border-indigo-800/20 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20"
              >
                Previous
              </Button>
              <Button 
                onClick={handleNext}
                disabled={currentStep === 0 && !selectedType}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {currentStep === steps.length - 1 ? "Submit" : "Next"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 