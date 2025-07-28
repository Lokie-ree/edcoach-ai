"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  BookOpen,
  TrendingUp,
  Users,
  ArrowRight,
  X,
  Award,
  Target,
  MessageSquare,
  Goal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TeacherTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function TeacherTutorial({
  onComplete,
  onSkip,
}: TeacherTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Your Growth Journal",
      description:
        "You are connected to your coach and ready to grow professionally!",
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          {/* Keep icon centered for visual impact */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Left-align the content for better readability */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Welcome to EdCoach AI!</h3>
            <p className="text-muted-foreground">
              Your coach has added you to their team. This is your personal
              growth journal to track professional development and receive
              personalized feedback.
            </p>

            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Connected directly to your coach</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Personalized feedback aligned with your PGP goals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Two-way reflection system for deeper learning</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Your Professional Growth Plan (PGP)",
      description:
        "Understand how your coach sets goals and tracks your progress.",
      icon: Goal,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <Goal className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Goal-Driven Growth</h3>
            <p className="text-muted-foreground">
              Your coach will set an annual PGP goal focused on your specific
              growth area, ensuring all feedback is perfectly aligned with your
              professional development.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Your PGP includes:</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong>Annual Goal:</strong> Specific teaching indicator to
                    focus on
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong>Action Plan:</strong> Context and strategies from
                    your coach
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong>Progress Tracking:</strong> Visual evidence of your
                    growth over time
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong>AI Alignment:</strong> All feedback references your
                    PGP goal
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Understanding Classroom Walkthroughs",
      description:
        "Learn how your coach will observe and provide feedback on your teaching.",
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Collaborative Observations
            </h3>
            <p className="text-muted-foreground">
              Your coach will conduct regular classroom walkthroughs to support
              your professional growth.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium">What to expect:</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Brief, non-evaluative classroom visits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Focus on specific teaching indicators</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>AI-powered, PGP-aware feedback</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Celebration of your strengths</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Targeted suggestions for growth</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Receiving Meaningful Feedback",
      description:
        "Discover how AI-generated feedback helps accelerate your professional growth.",
      icon: Award,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
              <Award className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Personalized Growth Insights
            </h3>
            <p className="text-muted-foreground">
              Each walkthrough includes specific, actionable feedback tailored
              to your teaching practice and aligned with your PGP goal.
            </p>

            <div className="grid gap-3">
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="font-medium text-green-800 dark:text-green-200">
                    Reinforcement
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Celebrate what you&apos;re doing well - specific strengths to
                  continue building on.
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    Refinement
                  </span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Growth opportunities with practical strategies to enhance your
                  practice.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "The Reflection Loop",
      description: "Complete the growth cycle by reflecting on your feedback.",
      icon: MessageSquare,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Two-Way Dialogue</h3>
            <p className="text-muted-foreground">
              After receiving feedback, you&apos;ll be prompted to share your
              reflections, creating a continuous growth loop with your coach.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium">The reflection process:</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong>Receive Feedback:</strong> Get AI-generated insights
                    from your coach
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong>Reflect:</strong> Share your thoughts and learning
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong>Connect:</strong> Link feedback to your PGP goal
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong>Plan:</strong> Document next steps for your practice
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Your Growth Journal Dashboard",
      description: "Navigate your personal space for professional development.",
      icon: TrendingUp,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-teal-500 to-green-600 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Growth Journey</h3>
            <p className="text-muted-foreground">
              Your growth journal provides everything you need to track progress
              and celebrate achievements with your coach&apos;s support.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Available in your growth journal:</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong>PGP Goal:</strong> Your annual focus area and action
                    plan
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong>Current Sprint:</strong> What you&apos;re working on
                    right now
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong>Reflection Prompt:</strong> Respond to recent
                    feedback
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong>Growth Story:</strong> Timeline of your professional
                    journey
                  </span>
                </li>
              </ul>
            </div>
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
                    index <= currentStep ? "bg-primary" : "bg-muted"
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
                      Start Learning
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  ) : (
                    "Next"
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
