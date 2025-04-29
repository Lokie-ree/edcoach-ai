"use client";

import { useState } from "react";
import { TypeStep } from "./type-step";
import { DetailsStep } from "./details-step";
import { RubricStep } from "./rubric-step";
import { InformalWalkthroughStep } from "./informal-walkthrough-step";
import { StepperWrapper } from "@/components/reactbits/Components/Stepper/StepperWrapper";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/components/ui/toast";
import { Id } from "@/convex/_generated/dataModel";
import { sanitizeObject } from "@/lib/sanitize";
import { handleError } from "@/lib/error-handler";

type Step = {
  title: string;
  component: React.ReactNode;
};

// Define interface for form data
interface ObservationFormData {
  // Common fields
  type: "formal" | "walkthrough";
  teacherId: Id<"teachers">;
  observationDate: Date;

  // Formal Observation fields
  subject?: string;
  gradeLevels?: string[];
  reinforcementComment?: string; // General comments for formal
  refinementComment?: string;    // General comments for formal
  rubricResponses?: Record<string, Record<string, number>>; // Assuming structure { domain: { indicator: score } }

  // Informal Walkthrough fields
  reinforcementIndicators?: string[]; // Specific indicators
  refinementIndicators?: string[];    // Specific indicators
  reinforcementComments?: Record<string, string>; // Comments per indicator
  refinementComments?: Record<string, string>;    // Comments per indicator
  additionalComments?: string;
}

// Helper function to prepare data for mutation
const prepareObservationPayload = (values: ObservationFormData) => {
  if (values.type === "walkthrough") {
    const walkthroughEntries: {
      indicatorAcronym: string;
      type: "reinforcement" | "refinement";
      comment: string;
    }[] = [];

    const reinforcementIndicators = values.reinforcementIndicators || [];
    const refinementIndicators = values.refinementIndicators || [];

    for (const indicator of reinforcementIndicators) {
      walkthroughEntries.push({
        indicatorAcronym: indicator,
        type: "reinforcement",
        comment: values.reinforcementComments?.[indicator] || "",
      });
    }

    for (const indicator of refinementIndicators) {
      walkthroughEntries.push({
        indicatorAcronym: indicator,
        type: "refinement",
        comment: values.refinementComments?.[indicator] || "",
      });
    }
    // Walkthrough: Include walkthrough fields, set formal fields to undefined
    return {
      teacherId: values.teacherId,
      observationDate: values.observationDate.getTime(),
      walkthroughEntries: walkthroughEntries,
      reinforcementComment: values.additionalComments, // Remap additionalComments from walkthrough
      refinementComment: undefined, // Not applicable for walkthrough
      subject: undefined, // Not applicable for walkthrough
      gradeLevels: undefined, // Not applicable for walkthrough
      rubricResponses: undefined, // Not applicable for walkthrough
    };
  } else {
    // Formal: Include formal fields, set walkthrough fields to undefined
    return {
      teacherId: values.teacherId,
      observationDate: values.observationDate.getTime(),
      subject: values.subject,
      gradeLevels: values.gradeLevels,
      reinforcementComment: values.reinforcementComment,
      refinementComment: values.refinementComment,
      rubricResponses: values.rubricResponses,
      walkthroughEntries: undefined, // Not applicable for formal
    };
  }
};

export function Wizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const createObservation = useMutation(
    api.observations.createObservationAndResponses,
  );

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

  const handleSubmit = async (values: ObservationFormData) => {
    try {
      // Sanitize all input values before processing
      const sanitizedValues = sanitizeObject(values);
      
      // Use the helper function to prepare payload
      const payload = prepareObservationPayload(sanitizedValues);

      await createObservation(payload);

      toast({
        title: "Success",
        description: "Observation created successfully",
      });

      router.push("/dashboard");
    } catch (error) {
      handleError(error, "Failed to create observation. Please try again.");
    }
  };

  const steps: Step[] = [
    {
      title: "Type",
      component: (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Select Type</h2>
          <TypeStep selectedType={selectedType} onSelectType={setSelectedType} />
        </div>
      ),
    },
    ...(selectedType === "walkthrough"
      ? [
          {
            title: "Walkthrough",
            component: (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Informal Walkthrough</h2>
                <InformalWalkthroughStep
                  onNext={handleNext}
                  onBack={handleBack}
                />
              </div>
            ),
          },
        ]
      : [
          {
            title: "Details",
            component: (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Observation Details</h2>
                <DetailsStep onNext={handleNext} onBack={handleBack} />
              </div>
            ),
          },
          {
            title: "Rubric",
            component: (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Rubric Assessment</h2>
                <RubricStep onNext={handleNext} onBack={handleBack} />
              </div>
            ),
          },
        ]),
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <StepperWrapper
        steps={steps.map((step) => ({ 
          label: step.title,
          component: step.component
        }))}
        currentStep={currentStep}
        onStepClick={setCurrentStep}
        onSubmit={handleSubmit}
        onNext={handleNext}
        onBack={handleBack}
        isLastStep={currentStep === steps.length - 1}
      />
    </div>
  );
}
