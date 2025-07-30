"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { walkthroughSchema } from "@/app/(dashboard)/walkthrough/new/validation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Import wizard steps
import {
  BasicInfoStep,
  IndicatorSelectionStep,
  EvidenceCaptureStep,
  AIFeedbackStep,
  ReviewStep,
} from "./wizard-steps";

// Types
export type WalkthroughFormData = z.infer<typeof walkthroughSchema>;

// Wizard step configuration
interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<WizardStepProps>;
  validation?: z.ZodSchema;
}

interface WizardStepProps {
  formData: WalkthroughFormData;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  canProceed: boolean;
  clearFormData?: () => void;
}

const STEPS: WizardStep[] = [
  {
    id: "basic-info",
    title: "Basic Information",
    description: "Select teacher and observation date",
    component: BasicInfoStep,
    validation: z.object({
      teacherId: z.string().min(1, "Teacher selection is required"),
      walkthroughDate: z.date(),
    }),
  },
  {
    id: "indicators",
    title: "Select Indicators",
    description: "Choose reinforcement and refinement indicators",
    component: IndicatorSelectionStep,
    validation: z.object({
      reinforcementIndicator: z
        .string()
        .min(1, "Reinforcement indicator is required"),
      refinementIndicator: z
        .string()
        .min(1, "Refinement indicator is required"),
    }),
  },
  {
    id: "evidence",
    title: "Evidence Summary",
    description: "Record your classroom observations",
    component: EvidenceCaptureStep,
    validation: z.object({
      evidenceSummary: z.string().min(1, "Evidence summary is required"),
    }),
  },
  {
    id: "ai-feedback",
    title: "AI Feedback",
    description: "Generate and refine AI-powered feedback",
    component: AIFeedbackStep,
  },
  {
    id: "review",
    title: "Review & Submit",
    description: "Review and finalize your walkthrough",
    component: ReviewStep,
  },
];

interface WalkthroughWizardProps {
  walkthroughId?: Id<"walkthroughs">;
  coachId?: Id<"users">;
}

export function WalkthroughWizard({ walkthroughId }: WalkthroughWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const formKey = `walkthrough-draft-${walkthroughId || "new"}`;

  // Form setup with localStorage persistence
  const getStoredFormData = (): Partial<WalkthroughFormData> => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem(formKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const storeFormData = useCallback(
    (data: WalkthroughFormData) => {
      if (typeof window === "undefined") return;
      try {
        localStorage.setItem(formKey, JSON.stringify(data));
      } catch {
        // Ignore localStorage errors
      }
    },
    [formKey],
  );

  const clearStoredFormData = () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(formKey);
    } catch {
      // Ignore localStorage errors
    }
  };

  const storedData = getStoredFormData();
  const methods = useForm<WalkthroughFormData>({
    resolver: zodResolver(walkthroughSchema),
    defaultValues: {
      type: "walkthrough",
      teacherId: storedData.teacherId || "",
      walkthroughDate: storedData.walkthroughDate
        ? new Date(storedData.walkthroughDate)
        : new Date(),
      status: "draft",
      evidenceSummary: storedData.evidenceSummary || "",
      reinforcementIndicator: storedData.reinforcementIndicator || "",
      refinementIndicator: storedData.refinementIndicator || "",
      walkthroughEntries: storedData.walkthroughEntries || [
        { indicatorAcronym: "", type: "reinforcement", aiFeedback: "" },
        { indicatorAcronym: "", type: "refinement", aiFeedback: "" },
      ],
    },
    mode: "onChange",
  });

  const currentStep = STEPS[currentStepIndex];
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  // Auto-save functionality
  const saveDraft = useMutation(api.walkthroughs.createWalkthroughAndEntries);
  const updateDraft = useMutation(api.walkthroughs.updateWalkthroughAndEntries);

  const handleAutoSave = useCallback(async () => {
    try {
      const formData = methods.getValues();
      const walkthroughDate =
        formData.walkthroughDate instanceof Date
          ? formData.walkthroughDate.getTime()
          : Number(formData.walkthroughDate);

      // Only auto-save if we have at least teacher and some content
      if (!formData.teacherId || !formData.evidenceSummary?.trim()) {
        return;
      }

      if (walkthroughId) {
        await updateDraft({
          walkthroughId,
          teacherId: formData.teacherId as Id<"teachers">,
          walkthroughDate,
          status: "draft",
          reinforcementIndicator: formData.reinforcementIndicator,
          refinementIndicator: formData.refinementIndicator,
          evidenceSummary: formData.evidenceSummary,
          walkthroughEntries: formData.walkthroughEntries,
        });
      } else {
        // Create new draft
        const newDraftId = await saveDraft({
          teacherId: formData.teacherId as Id<"teachers">,
          walkthroughDate,
          status: "draft",
          reinforcementIndicator: formData.reinforcementIndicator,
          refinementIndicator: formData.refinementIndicator,
          evidenceSummary: formData.evidenceSummary,
          walkthroughEntries: formData.walkthroughEntries,
          hasProPlan: false,
          hasStarterPlan: true,
        });

        // Update the URL to reflect the new draft ID
        if (newDraftId) {
          window.history.replaceState(
            {},
            "",
            `/walkthrough/new?draft=${newDraftId}`,
          );
        }
      }

      // Also store in localStorage
      storeFormData(formData);

      // Show subtle feedback that save occurred
      toast({
        title: "Draft saved",
        description: "Your progress has been automatically saved",
        variant: "success",
      });
    } catch (error) {
      console.warn("Auto-save failed:", error);
      // Don't show error toast for auto-save failures to avoid overwhelming user
    }
  }, [walkthroughId, saveDraft, updateDraft, methods, storeFormData, toast]);

  // Clear stored data on successful submission
  const clearFormData = () => {
    clearStoredFormData();
    if (typeof window !== "undefined") {
      localStorage.removeItem(`${formKey}-step`);
    }
  };

  // Step navigation
  const validateCurrentStep = async (): Promise<boolean> => {
    if (!currentStep.validation) return true;

    const formData = methods.getValues();
    const result = currentStep.validation.safeParse(formData);

    if (!result.success) {
      // Group errors by field for better UX
      const fieldErrors = result.error.errors.reduce(
        (acc, error) => {
          const field = error.path.join(".");
          if (!acc[field]) acc[field] = [];
          acc[field].push(error.message);
          return acc;
        },
        {} as Record<string, string[]>,
      );

      // Show a consolidated error message
      const errorCount = Object.keys(fieldErrors).length;
      const firstError = Object.values(fieldErrors)[0]?.[0];

      toast({
        title: `Please complete ${errorCount} required field${errorCount > 1 ? "s" : ""}`,
        description:
          firstError || `Step ${currentStepIndex + 1} has validation errors`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    // Mark current step as completed
    setCompletedSteps((prev) => new Set([...prev, currentStepIndex]));

    // Auto-save progress
    await handleAutoSave();

    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to completed steps or the next step
    if (completedSteps.has(stepIndex) || stepIndex <= currentStepIndex + 1) {
      setCurrentStepIndex(stepIndex);
    }
  };

  const canProceed = () => {
    if (!currentStep.validation) return true;

    const formData = methods.getValues();
    const result = currentStep.validation.safeParse(formData);
    return result.success;
  };

  // Enhanced validation with field-specific feedback

  // Persist form data to localStorage on changes
  useEffect(() => {
    if (!isFormLoaded) return; // Wait until form is loaded
    const subscription = methods.watch((data) => {
      storeFormData(data as WalkthroughFormData);
    });
    return () => subscription.unsubscribe();
  }, [methods, isFormLoaded, storeFormData]);

  // Persist current step index
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`${formKey}-step`, currentStepIndex.toString());
    }
  }, [currentStepIndex, formKey]);

  // Load step index from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedStep = localStorage.getItem(`${formKey}-step`);
      if (storedStep) {
        const stepIndex = parseInt(storedStep, 10);
        if (stepIndex >= 0 && stepIndex < STEPS.length) {
          setCurrentStepIndex(stepIndex);
          // Mark previous steps as completed
          const completed = new Set<number>();
          for (let i = 0; i < stepIndex; i++) {
            completed.add(i);
          }
          setCompletedSteps(completed);
        }
      }
      setIsFormLoaded(true);
    }
  }, [formKey]);

  // Setup auto-save timer
  useEffect(() => {
    const setupAutoSave = () => {
      if (autoSaveTimer.current) {
        clearInterval(autoSaveTimer.current);
      }

      autoSaveTimer.current = setInterval(() => {
        const formData = methods.getValues();
        if (formData.teacherId && formData.evidenceSummary?.trim()) {
          handleAutoSave();
        }
      }, 30000); // Auto-save every 30 seconds
    };

    setupAutoSave();

    return () => {
      if (autoSaveTimer.current) {
        clearInterval(autoSaveTimer.current);
      }
    };
  }, [walkthroughId, handleAutoSave, methods]);

  // Load draft data if editing
  useEffect(() => {
    // This effect would load draft data when walkthroughId is provided
    // The data loading logic is already handled in the original component
    // through the useQuery hooks and useEffect
  }, [walkthroughId]);

  const CurrentStepComponent = currentStep.component;

  // Show loading state until form data is loaded
  if (!isFormLoaded) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading walkthrough...</p>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div
        className="min-h-screen bg-muted/30"
        role="main"
        aria-label="Walkthrough Creation Wizard"
      >
        {/* Mobile-optimized header with progress */}
        <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
          <div className="container max-w-4xl mx-auto px-4 py-4">
            {/* Step indicator - mobile optimized */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="text-muted-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
                Cancel
              </Button>
              <div className="text-sm font-medium">
                Step {currentStepIndex + 1} of {STEPS.length}
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{currentStep.title}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
            </div>

            {/* Desktop step navigation - hidden on mobile */}
            <div className="hidden md:flex items-center justify-center mt-6 space-x-1">
              {STEPS.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50",
                    index === currentStepIndex
                      ? "bg-primary text-primary-foreground"
                      : completedSteps.has(index)
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "text-muted-foreground hover:bg-muted",
                    completedSteps.has(index) || index <= currentStepIndex + 1
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-50",
                  )}
                  disabled={
                    !completedSteps.has(index) && index > currentStepIndex + 1
                  }
                  aria-current={index === currentStepIndex ? "step" : undefined}
                  aria-label={`Step ${index + 1}: ${step.title} ${
                    completedSteps.has(index)
                      ? "(completed)"
                      : index === currentStepIndex
                        ? "(current)"
                        : ""
                  }`}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                      index === currentStepIndex
                        ? "bg-primary-foreground text-primary"
                        : completedSteps.has(index)
                          ? "bg-green-600 text-white"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {completedSteps.has(index) ? "✓" : index + 1}
                  </div>
                  <span className="hidden lg:inline">{step.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              {/* Step title and description */}
              <div className="mb-6 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">{currentStep.title}</h2>
                <p className="text-muted-foreground">
                  {currentStep.description}
                </p>
              </div>

              {/* Step content */}
              <CurrentStepComponent
                formData={methods.getValues()}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isFirst={currentStepIndex === 0}
                isLast={currentStepIndex === STEPS.length - 1}
                canProceed={canProceed()}
                clearFormData={clearFormData}
              />
            </CardContent>
          </Card>
        </div>

        {/* Mobile navigation footer */}
        <div className="sticky bottom-0 bg-background border-t p-4 md:hidden shadow-lg">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="flex-1 h-12 text-base"
              size="lg"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 h-12 text-base"
              size="lg"
            >
              {currentStepIndex === STEPS.length - 1 ? "Submit" : "Next"}
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
