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
import { useForm, FormProvider, FieldValues } from "react-hook-form";
import { z } from "zod";
import {
  typeStepSchema,
  formalDetailsStepSchema,
  formalRubricStepSchema,
  informalWalkthroughStepSchema,
  observationSchema
} from "../validation";

// Add type alias for observation type
export type ObservationType = "formal" | "walkthrough";

// Type for the form data, inferred from the main Zod schema
type ObservationFormData = Omit<z.infer<typeof observationSchema>, 'observationDate' | 'teacherId'> & FieldValues & {
  teacherId?: string | Id<'teachers'>;
  observationDate?: number | string | Date;
  reinforcementIndicators?: string[];
  refinementIndicators?: string[];
  reinforcementComments?: Record<string, string>;
  refinementComments?: Record<string, string>;
  additionalComments?: string;
  rubricResponses?: Record<string, Record<string, number>> | Record<string, never>;
  subject?: string;
  gradeLevels?: string[];
  reinforcementComment?: string;
  refinementComment?: string;
  rubric?: Record<string, Record<string, string | number>>;
};

// Add type for createObservationAndResponses mutation args
export type CreateObservationArgs = {
  teacherId: Id<"teachers">;
  subject: string;
  gradeLevels: string[];
  observationDate: number;
  reinforcementComment?: string;
  refinementComment?: string;
  rubricResponses?: Record<string, number>;
  walkthroughEntries?: {
    indicatorAcronym: string;
    type: "reinforcement" | "refinement";
    comment: string;
  }[];
};

type Step = {
  title: string;
  component: React.ReactNode;
};

// Helper function to prepare data for mutation (expects timestamp for date)
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

    return {
      teacherId: values.teacherId as Id<"teachers">,
      observationDate: values.observationDate,
      walkthroughEntries,
      reinforcementComment: values.additionalComments ?? "",
      refinementComment: "",
      subject: "",
      gradeLevels: [],
      rubricResponses: undefined,
    };
  } else {
    // Transform rubric responses from Record<string, Record<string, number>> to Record<string, number>
    const transformedRubricResponses = values.rubricResponses
      ? Object.entries(values.rubricResponses as Record<string, Record<string, number>>).reduce((acc, [domain, indicators]) => {
          Object.entries(indicators).forEach(([indicator, rating]) => {
            acc[`${domain}.${indicator}`] = rating;
          });
          return acc;
        }, {} as Record<string, number>)
      : undefined;

    return {
      teacherId: String(values.teacherId),
      observationDate: Number(values.observationDate),
      subject: values.subject ?? "",
      gradeLevels: Array.isArray(values?.gradeLevels) ? values.gradeLevels : [],
      reinforcementComment: values?.reinforcementComment ?? "",
      refinementComment: values?.refinementComment ?? "",
      rubricResponses: transformedRubricResponses,
      walkthroughEntries: [],
    };
  }
};

export function Wizard({ organization }: { organization?: string }) {
  const methods = useForm<ObservationFormData>({
    defaultValues: {
      type: undefined,
      teacherId: undefined,
      observationDate: Date.now(),
      subject: undefined,
      gradeLevels: [],
      reinforcementComment: undefined,
      refinementComment: undefined,
      rubricResponses: undefined,
      reinforcementIndicators: [],
      refinementIndicators: [],
      reinforcementComments: undefined,
      refinementComments: undefined,
      additionalComments: undefined,
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
          "teacherId", "observationDate", "reinforcementIndicators", 
          "refinementIndicators", "reinforcementComments", "refinementComments", "additionalComments"
        ];
        const currentValues = getValues();
        const result = informalWalkthroughStepSchema.safeParse(currentValues);
        isValid = result.success;
        if (!isValid) {
          result.error?.errors.forEach((err: z.ZodIssue) => {
            setError(err.path.join(".") as keyof ObservationFormData, { type: "manual", message: err.message });
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
            setError(err.path.join(".") as keyof ObservationFormData, { type: "manual", message: err.message });
          });
        }
      } else if (currentStep === 2) {
        fieldsToValidate = ["rubricResponses"];
        const currentValues = getValues();
        const result = formalRubricStepSchema.safeParse(currentValues);
        isValid = result.success;
        if (!isValid) {
          result.error?.errors.forEach((err: z.ZodIssue) => {
            setError(err.path.join(".") as keyof ObservationFormData, { type: "manual", message: err.message });
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
      toast({
        title: "Validation Error",
        description: "Please complete all required fields correctly.",
        variant: "destructive",
      });
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
      // 2. Sanitize other values (exclude date or handle its sanitized form if needed)
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
        // Type guard: treat sanitizedValues as ObservationFormData with walkthrough type
        const walkthroughSanitized = sanitizedValues as ObservationFormData & { type: "walkthrough" };
        const reinforcementCommentsArr = Object.entries(walkthroughSanitized.reinforcementComments || {}).map(
          ([indicator, comment]) => ({ indicator, comment: String(comment) })
        );
        const refinementCommentsArr = Object.entries(walkthroughSanitized.refinementComments || {}).map(
          ([indicator, comment]) => ({ indicator, comment: String(comment) })
        );
        const walkthroughEntries: {
          indicatorAcronym: string;
          type: "reinforcement" | "refinement";
          comment: string;
        }[] = [];
        for (const indicator of walkthroughSanitized.reinforcementIndicators || []) {
          walkthroughEntries.push({
            indicatorAcronym: indicator,
            type: "reinforcement",
            comment: walkthroughSanitized.reinforcementComments?.[indicator] || "",
          });
        }
        for (const indicator of walkthroughSanitized.refinementIndicators || []) {
          walkthroughEntries.push({
            indicatorAcronym: indicator,
            type: "refinement",
            comment: walkthroughSanitized.refinementComments?.[indicator] || "",
          });
        }
        const org = organization || "";
        await createWalkthrough({
          teacherId: walkthroughSanitized.teacherId as Id<"teachers">,
          walkthroughDate: observationDateValue,
          status: "completed",
          reinforcementIndicators: walkthroughSanitized.reinforcementIndicators || [],
          refinementIndicators: walkthroughSanitized.refinementIndicators || [],
          reinforcementComments: reinforcementCommentsArr,
          refinementComments: refinementCommentsArr,
          additionalComments: walkthroughSanitized.additionalComments || undefined,
          organization: org,
          walkthroughEntries,
        });
        toast({
          title: "Success",
          description: "Walkthrough created successfully",
        });
        router.push("/dashboard");
        return;
      }
      // 3. Formal observation: Prepare payload using timestamp
      const payloadInput = {
        ...values,
        teacherId: values.teacherId as Id<'teachers'>,
        observationDate: observationDateValue, // Pass as number
      };
      const payload = prepareObservationPayload(payloadInput);
      console.log("Submitting payload:", payload);
      await createObservation(payload as CreateObservationArgs);
      toast({
        title: "Success",
        description: "Observation created successfully",
      });
      router.push("/dashboard");
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
