"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { walkthroughSchema, WalkthroughFormData } from "@/app/(dashboard)/walkthrough/new/validation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { ChevronLeft, ChevronRight, Send, Loader2, X } from "lucide-react";
import { usePlanDetection } from "@/hooks/usePlanDetection";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

// Step Components
import { IndicatorSelectionStep } from "./wizard-steps/IndicatorSelectionStep";
import { EvidenceCaptureStep } from "./wizard-steps/EvidenceCaptureStep";
import { AIFeedbackStep } from "./wizard-steps/AIFeedbackStep";

// Simplified 3-step configuration
const STEPS = [
  {
    id: "indicators",
    title: "Select Indicators",
    description: "Choose ONE reinforcement and ONE refinement indicator",
    component: IndicatorSelectionStep,
  },
  {
    id: "evidence",
    title: "Evidence Summary", 
    description: "Record your classroom observations",
    component: EvidenceCaptureStep,
  },
  {
    id: "ai-feedback",
    title: "AI Feedback & Submit",
    description: "Generate feedback and submit walkthrough",
    component: AIFeedbackStep,
  },
];

interface WalkthroughWizardProps {
  preselectedTeacherId?: Id<"teachers">;
}

export function WalkthroughWizard({ preselectedTeacherId }: WalkthroughWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { isProPlan, isStarterPlan } = usePlanDetection();

  // Simple React form state - no persistence, no drafts
  const methods = useForm<WalkthroughFormData>({
    resolver: zodResolver(walkthroughSchema),
    defaultValues: {
      teacherId: preselectedTeacherId || "",
      walkthroughDate: new Date(),
      evidenceSummary: "",
      reinforcementIndicator: "",
      refinementIndicator: "",
      reinforcementFeedback: "",
      refinementFeedback: "",
    },
    mode: "onChange",
  });

  const createWalkthrough = useMutation(api.walkthroughs.createWalkthrough);
  
  const currentStep = STEPS[currentStepIndex];
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  // Watch form values for real-time validation
  const watchedValues = methods.watch();
  
  // Validation for each step
  const canProceed = (): boolean => {
    switch (currentStepIndex) {
      case 0: // Indicators
        return !!(watchedValues.reinforcementIndicator && 
                 watchedValues.refinementIndicator && 
                 watchedValues.teacherId);
      case 1: // Evidence
        return (watchedValues.evidenceSummary?.trim().length ?? 0) > 0;
      case 2: // AI Feedback & Submit
        return (watchedValues.reinforcementFeedback?.trim().length ?? 0) > 0 &&
               (watchedValues.refinementFeedback?.trim().length ?? 0) > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && !isLastStep) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async (data: WalkthroughFormData) => {
    if (!isLastStep) return;
    
    setIsSubmitting(true);
    try {
      const walkthroughId = await createWalkthrough({
        teacherId: data.teacherId as Id<"teachers">,
        walkthroughDate: data.walkthroughDate instanceof Date 
          ? data.walkthroughDate.getTime() 
          : new Date(data.walkthroughDate).getTime(),
        evidenceSummary: data.evidenceSummary,
        reinforcementIndicator: data.reinforcementIndicator,
        refinementIndicator: data.refinementIndicator,
        reinforcementFeedback: data.reinforcementFeedback,
        refinementFeedback: data.refinementFeedback,
        hasProPlan: isProPlan,
        hasStarterPlan: isStarterPlan,
      });

      toast({
        title: "Success!",
        description: "Walkthrough has been completed and submitted.",
      });

      // Navigate to the completed walkthrough
      router.push(`/walkthrough/${walkthroughId}/view`);
      // onClose?.(); // This line is removed as per the edit hint
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create walkthrough",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user has started filling out the form
  const hasStartedForm = (): boolean => {
    const values = methods.getValues();
    return !!(values.teacherId || 
              values.reinforcementIndicator || 
              values.refinementIndicator || 
              values.evidenceSummary ||
              values.reinforcementFeedback ||
              values.refinementFeedback);
  };

  const handleCancelClick = () => {
    if (hasStartedForm()) {
      setShowCancelDialog(true);
    } else {
      router.push('/dashboard');
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelDialog(false);
    router.push('/dashboard');
  };

  const StepComponent = currentStep.component;

  return (
    <Container size="xl" padding="normal">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>New Walkthrough</span>
            <div className="flex items-center gap-4">
              <span className="text-sm font-normal text-muted-foreground">
                Step {currentStepIndex + 1} of {STEPS.length}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelClick}
                className="h-8 w-8 p-0"
                title="Cancel walkthrough"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">{currentStep.title}</h2>
            <p className="text-muted-foreground">{currentStep.description}</p>
          </div>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
              <StepComponent 
                isLast={isLastStep}
                canProceed={canProceed()}
              />

              {/* Navigation */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isFirstStep}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                {isLastStep ? (
                  <Button
                    type="submit"
                    disabled={!canProceed() || isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Submit Walkthrough
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Walkthrough?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to cancel? All your progress will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Continue Editing
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
            >
              Cancel Walkthrough
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Container>
  );
}