"use client";

import { useState } from "react";
import { TypeStep } from "./type-step";
import { DetailsStep } from "./details-step";
import { RubricStep } from "./rubric-step";
import { InformalWalkthroughStep } from "./informal-walkthrough-step";
import { AIFeedbackReviewStep } from "./ai-feedback-review-step";
import { StepperWrapper } from "@/components/reactbits/Components/Stepper/StepperWrapper";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/components/ui/toast";
import { Id } from "@/convex/_generated/dataModel";
import { sanitizeObject } from "@/lib/sanitize";
import { handleError } from "@/lib/error-handler";
import { useForm, FormProvider, FieldValues } from "react-hook-form";
import { z } from "zod";
import {
  typeStepSchema,
  formalDetailsStepSchema,
  formalRubricStepSchema,
  informalWalkthroughStepSchema,
  observationSchema,
  walkthroughSchema
} from "../validation";

// Add type alias for observation type
export type ObservationType = "formal" | "walkthrough";

// Type for the form data, inferred from the main Zod schema
type ObservationFormData = Omit<z.infer<typeof observationSchema>, 'observationDate' | 'teacherId'> & FieldValues & {
  teacherId?: string | Id<'teachers'>;
  observationDate?: number | string | Date;
  reinforcementIndicator: string;
  refinementIndicator?: string;
  additionalComments?: string;
  rubricResponses?: Record<string, Record<string, number>> | Record<string, never>;
  subject?: string;
  gradeLevels?: string[];
  rubric?: Record<string, Record<string, string | number>>;
  reinforcementComments?: Record<string, string>;
  refinementComments?: Record<string, string>;
  evidenceSummary?: string;
};

// Add type for createObservationAndResponses mutation args
// export type CreateObservationArgs = {
//   teacherId: Id<"teachers">;
//   subject: string;
//   gradeLevels: string[];
//   observationDate: number;
//   rubricResponses?: Record<string, number>;
//   walkthroughEntries?: {
//     indicatorAcronym: string;
//     type: "reinforcement" | "refinement";
//     comment: string;
//   }[];
// };

type Step = {
  title: string;
  component: React.ReactNode;
};

// Helper function to prepare data for mutation
// const prepareObservationPayload = (values: ObservationFormData) => {
//   if (values.type === "walkthrough") {
//     const walkthroughEntries: {
//       indicatorAcronym: string;
//       type: "reinforcement" | "refinement";
//       aiFeedback?: string;
//     }[] = [];
//
//     if (values.reinforcementIndicator) {
//       walkthroughEntries.push({
//         indicatorAcronym: values.reinforcementIndicator,
//         type: "reinforcement",
//       });
//     }
//     if (values.refinementIndicator) {
//       walkthroughEntries.push({
//         indicatorAcronym: values.refinementIndicator,
//         type: "refinement",
//       });
//     }
//
//     // Ensure walkthroughDate is a number
//     const rawWalkthroughDate = values.observationDate;
//     const walkthroughDate = typeof rawWalkthroughDate === "object" && rawWalkthroughDate !== null && typeof rawWalkthroughDate.getTime === "function"
//       ? rawWalkthroughDate.getTime()
//       : Number(rawWalkthroughDate);
//
//     return {
//       teacherId: values.teacherId as Id<"teachers">,
//       walkthroughDate,
//       walkthroughEntries,
//       reinforcementIndicator: values.reinforcementIndicator || "",
//       refinementIndicator: values.refinementIndicator || "",
//       evidenceSummary: values.evidenceSummary || "",
//       status: "completed" as const,
//     };
//   }
//   // ... (optionally comment out or remove formal observation logic for MVP)
// };

export function Wizard({ organization }: { organization?: string }) {
  const methods = useForm<ObservationFormData>({
    defaultValues: {
      type: undefined,
      teacherId: undefined,
      observationDate: Date.now(),
      subject: undefined,
      gradeLevels: [],
      rubricResponses: undefined,
      reinforcementIndicator: "",
      refinementIndicator: "",
    },
  });
  const { setError, clearErrors, trigger, getValues } = methods;

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState<ObservationType | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const createObservation = useMutation(
    api.observations.createObservationAndResponses,
  );
  const createWalkthrough = useMutation(
    api.walkthroughs.createWalkthroughAndEntries,
  );

  const handleNext = async () => {
    let isValid = false;
    let fieldsToValidate: string[] | undefined = undefined;

    if (currentStep === 0) {
      fieldsToValidate = ["type"];
      const result = typeStepSchema.safeParse({ type: selectedType });
      isValid = result.success;
      if (!isValid) setError("type" as keyof ObservationFormData, { type: "manual", message: result.error?.errors[0]?.message || "Type is required." });
      else clearErrors("type" as keyof ObservationFormData);
    } else if (selectedType === "walkthrough") {
      if (currentStep === 1) {
        fieldsToValidate = [
          "teacherId", "observationDate", "reinforcementIndicator", 
          "refinementIndicator", "evidenceSummary"
        ];
        const currentValues = getValues();
        const result = informalWalkthroughStepSchema.safeParse(currentValues);
        isValid = result.success;
        if (!isValid) {
          result.error?.errors.forEach((err: z.ZodIssue) => {
            const path: string = (Array.isArray(err.path) && err.path.length > 0 && typeof err.path.join(".") === "string" && err.path.join(".").length > 0)
              ? err.path.join(".")
              : "root";
            setError(path, { type: "manual", message: err.message });
          });
        }
      }
    } else if (selectedType === "formal") {
      if (currentStep === 1) {
        fieldsToValidate = ["teacherId", "observationDate", "subject", "gradeLevels"];
        const currentValues = getValues();
        const result = formalDetailsStepSchema.safeParse(currentValues);
        isValid = result.success;
        if (!isValid) {
          result.error?.errors.forEach((err: z.ZodIssue) => {
            const path: string = (Array.isArray(err.path) && err.path.length > 0 && typeof err.path.join(".") === "string" && err.path.join(".").length > 0)
              ? err.path.join(".")
              : "root";
            setError(path, { type: "manual", message: err.message });
          });
        }
      } else if (currentStep === 2) {
        fieldsToValidate = ["rubricResponses"];
        const currentValues = getValues();
        const result = formalRubricStepSchema.safeParse(currentValues);
        isValid = result.success;
        if (!isValid) {
          result.error?.errors.forEach((err: z.ZodIssue) => {
            const path: string = (Array.isArray(err.path) && err.path.length > 0 && typeof err.path.join(".") === "string" && err.path.join(".").length > 0)
              ? err.path.join(".")
              : "root";
            setError(path, { type: "manual", message: err.message });
          });
        }
      }
    }

    if (fieldsToValidate && fieldsToValidate.length > 0) {
        const rhfValidationResult = await trigger(fieldsToValidate as (keyof ObservationFormData)[]);
        isValid = rhfValidationResult && isValid;
    }

    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      // Only show the toast if not submitting (i.e., not on the last step)
      if (currentStep < steps.length - 1) {
        toast({
          title: "Validation Error",
          description: "Please complete all required fields correctly.",
          variant: "destructive",
        });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (values: ObservationFormData) => {
    try {
      // Always convert observationDate to a timestamp (number)
      let observationDateValue: number;
      if (
        typeof values.observationDate === 'object' &&
        values.observationDate !== null &&
        Object.prototype.toString.call(values.observationDate) === '[object Date]'
      ) {
        observationDateValue = (values.observationDate as Date).getTime();
      } else if (typeof values.observationDate === 'string') {
        observationDateValue = new Date(values.observationDate).getTime();
      } else {
        observationDateValue = Number(values.observationDate);
      }
      const isWalkthrough = values.type === "walkthrough";
      // 2. Sanitize other values
      const valuesToSanitize = { ...values };
      // Map rubric field to rubricResponses
      if (values.rubric) {
        const rubricResponses: Record<string, Record<string, number>> = {};
        for (const domain in values.rubric) {
          rubricResponses[domain] = {};
          for (const indicator in values.rubric?.[domain] || {}) {
            const val = values.rubric?.[domain]?.[indicator];
            rubricResponses[domain][indicator] = typeof val === "string" ? Number(val) : val;
          }
        }
        valuesToSanitize.rubricResponses = rubricResponses;
      }
      const sanitizedValues = sanitizeObject(valuesToSanitize);
      if (isWalkthrough) {
        // --- FULL ZOD VALIDATION FOR WALKTHROUGH ---
        // Build walkthroughEntries array for validation
        const walkthroughEntries = [
          {
            indicatorAcronym: sanitizedValues.reinforcementIndicator as string,
            type: "reinforcement" as const,
            aiFeedback: sanitizedValues.aiFeedbackSummary || "",
          },
          {
            indicatorAcronym: sanitizedValues.refinementIndicator as string,
            type: "refinement" as const,
            aiFeedback: sanitizedValues.aiFeedbackSummary || "",
          },
        ];
        // Prepare the object for validation
        const walkthroughValidationObj = {
          type: "walkthrough",
          teacherId: sanitizedValues.teacherId || "",
          walkthroughDate: observationDateValue,
          status: "completed",
          evidenceSummary: sanitizedValues.evidenceSummary || "",
          reinforcementIndicator: sanitizedValues.reinforcementIndicator || "",
          refinementIndicator: sanitizedValues.refinementIndicator || "",
          walkthroughEntries,
        };
        console.log("walkthroughValidationObj", walkthroughValidationObj);
        const validationResult = walkthroughSchema.safeParse(walkthroughValidationObj);
        if (!validationResult.success) {
          console.error("walkthroughSchema validation errors", validationResult.error.errors);
          // Show all errors to the user
          validationResult.error.errors.forEach((err) => {
            const path: string = (Array.isArray(err.path) && err.path.length > 0 && typeof err.path.join(".") === "string" && err.path.join(".").length > 0)
              ? err.path.join(".")
              : "root";
            setError(path, { type: "manual", message: err.message });
          });
          toast({
            title: "Validation Error",
            description: "Please complete all required fields correctly.",
            variant: "destructive",
          });
          return;
        }
        // --- END FULL ZOD VALIDATION ---
        await createWalkthrough({
          teacherId: sanitizedValues.teacherId as Id<"teachers">,
          walkthroughDate: observationDateValue,
          status: "completed",
          reinforcementIndicator: sanitizedValues.reinforcementIndicator || "",
          refinementIndicator: sanitizedValues.refinementIndicator || "",
          evidenceSummary: sanitizedValues.evidenceSummary || "",
          walkthroughEntries,
        });
        toast({
          title: "Success",
          description: "Walkthrough created successfully",
          variant: "success",
        });
        router.push("/dashboard");
        return;
      }
      // 3. Formal observation: Prepare payload using timestamp
      // if (!isWalkthrough) {
      //   const payloadInput = {
      //     ...values,
      //     teacherId: values.teacherId as Id<'teachers'>,
      //     observationDate: observationDateValue,
      //   };
      //   const payload = prepareObservationPayload(payloadInput);
      //   if (!payload) {
      //     toast({
      //       title: "Validation Error",
      //       description: "Could not build a valid observation payload.",
      //       variant: "destructive",
      //     });
      //     return;
      //   }
      //   console.log("Submitting payload:", payload);
      //   await createObservation(payload);
      //   toast({
      //     title: "Success",
      //     description: "Observation created successfully",
      //     variant: "success",
      //   });
      //   router.push("/dashboard");
      // }
    } catch (error) {
      handleError(error, "Failed to create observation/walkthrough. Please try again.");
    }
  };

  const steps: Step[] = [
    {
      title: "Type",
      component: (
        <div className="space-y-4 px-6">
          <h2 className="text-2xl font-bold">Select Type</h2>
          <TypeStep selectedType={selectedType} onSelectType={(type: ObservationType) => setSelectedType(type)} />
        </div>
      ),
    },
    ...(selectedType === "walkthrough"
      ? [
          {
            title: "Walkthrough",
            component: (
              <div className="space-y-4 px-6">
                <h2 className="text-2xl font-bold">Informal Walkthrough</h2>
                <InformalWalkthroughStep />
              </div>
            ),
          },
          {
            title: "AI Feedback Review",
            component: (
              <div className="space-y-4 px-6">
                <h2 className="text-2xl font-bold">AI Feedback Review</h2>
                <AIFeedbackReviewStep />
              </div>
            ),
          },
        ]
      : [
          {
            title: "Details",
            component: (
              <div className="space-y-4 px-6">
                <h2 className="text-2xl font-bold">Observation Details</h2>
                <DetailsStep />
              </div>
            ),
          },
          {
            title: "Rubric",
            component: (
              <div className="space-y-4 px-6">
                <h2 className="text-2xl font-bold">Rubric Assessment</h2>
                <RubricStep />
              </div>
            ),
          },
        ]),
  ];

  return (
    <FormProvider {...methods}>
      <div className="w-full max-w-4xl mx-auto">
        <StepperWrapper<ObservationFormData>
          steps={steps.map((step) => ({ 
            label: step.title,
            component: step.component
          }))}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          onSubmit={handleSubmit}
          onNext={handleNext}
          onBack={handleBack}
        />
      </div>
    </FormProvider>
  );
}
