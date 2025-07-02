"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, ClipboardList, BarChart3, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CoachTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function CoachTutorial({ onComplete, onSkip }: CoachTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Your Coach Dashboard",
      description: "Your coaching team is now set up! Let's walk through the key features.",
      icon: Users,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">You're All Set!</h3>
            <p className="text-muted-foreground">
              Your coaching team is ready and you're set to start supporting your teachers directly.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Coach account activated</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Ready to invite teachers to your group</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Invite and Manage Teachers",
      description: "Add teachers to your group and manage their details.",
      icon: Users,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Building Your Team</h3>
            <p className="text-muted-foreground">
              Go to the Teachers page to invite teachers directly to your coaching group.
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium">What you can do:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Send invitations to teachers by email</li>
              <li>• Add teaching details (subjects, grade bands)</li>
              <li>• View teacher status and activity</li>
              <li>• Manage your teacher group</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "Conduct Walkthroughs",
      description: "Create classroom observations and generate AI-powered feedback.",
      icon: ClipboardList,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
              <ClipboardList className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Observations</h3>
            <p className="text-muted-foreground">
              Create detailed walkthroughs with AI-generated, rubric-aligned feedback for your teachers.
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium">Walkthrough process:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>1. Select a teacher and observation date</li>
              <li>2. Choose reinforcement and refinement indicators</li>
              <li>3. Record evidence and observations</li>
              <li>4. Generate and customize AI feedback</li>
              <li>5. Share with the teacher</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "Track Progress with Analytics",
      description: "Monitor teacher growth and coaching effectiveness with detailed insights.",
      icon: BarChart3,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Data-Driven Coaching</h3>
            <p className="text-muted-foreground">
              Use analytics to track teacher progress and identify coaching opportunities in your group.
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium">Analytics features:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Teacher progress tracking</li>
              <li>• Walkthrough frequency and completion rates</li>
              <li>• Most common feedback indicators</li>
              <li>• Growth trends over time</li>
              <li>• Coaching impact metrics</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="max-w-2xl w-full"
      >
        <Card>
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <currentStepData.icon className="h-5 w-5" />
                  {currentStepData.title}
                </CardTitle>
                <CardDescription>{currentStepData.description}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={onSkip}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Progress indicator */}
            <div className="flex items-center gap-2 mt-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full ${
                    index <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {currentStep + 1} of {steps.length}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStepData.content}
              </motion.div>
            </AnimatePresence>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={onSkip}>
                  Skip Tutorial
                </Button>
                <Button onClick={handleNext}>
                  {currentStep === steps.length - 1 ? (
                    <>
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  ) : (
                    'Next'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 