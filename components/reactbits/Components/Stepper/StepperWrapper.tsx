import React from 'react';
import Stepper, { Step } from './Stepper';
import { FormProvider, useForm } from 'react-hook-form';
import { Id } from "@/convex/_generated/dataModel";

interface FormData {
  // Common fields
  type: "formal" | "walkthrough";
  teacherId: Id<"teachers">;
  observationDate: Date;

  // Formal Observation fields
  subject?: string;
  gradeLevels?: string[];
  reinforcementComment?: string;
  refinementComment?: string;
  rubricResponses?: Record<string, Record<string, number>>;

  // Informal Walkthrough fields
  reinforcementIndicators?: string[];
  refinementIndicators?: string[];
  reinforcementComments?: Record<string, string>;
  refinementComments?: Record<string, string>;
  additionalComments?: string;
}

interface StepperWrapperProps {
  steps: Array<{ label: string; component: React.ReactNode }>;
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
  onSubmit?: (data: FormData) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export function StepperWrapper({ 
  steps, 
  currentStep, 
  onStepClick, 
  className,
  onSubmit,
  onNext,
  onBack
}: StepperWrapperProps) {
  const methods = useForm<FormData>({
    defaultValues: {
      type: undefined,
      teacherId: undefined,
      observationDate: new Date(),
      subject: "",
      gradeLevels: [],
      reinforcementComment: "",
      refinementComment: "",
      rubricResponses: {},
      reinforcementIndicators: [],
      refinementIndicators: [],
      reinforcementComments: {},
      refinementComments: {},
      additionalComments: "",
    }
  });

  const handleStepChange = (step: number) => {
    onStepClick?.(step - 1);
  };

  const handleSubmit = () => {
    const values = methods.getValues();
    onSubmit?.(values);
  };

  return (
    <FormProvider {...methods}>
      <div className="w-full">
        <Stepper
          initialStep={currentStep + 1}
          onStepChange={handleStepChange}
          className={className}
          onFinalStepCompleted={handleSubmit}
          backButtonProps={{
            onClick: onBack,
            type: 'button'
          }}
          nextButtonProps={{
            onClick: onNext,
            type: 'button'
          }}
          stepCircleContainerClassName="shadow-none"
          contentClassName="p-0"
        >
          {steps.map((step, index) => (
            <Step key={index}>
              {step.component}
            </Step>
          ))}
        </Stepper>
      </div>
    </FormProvider>
  );
} 