import React from 'react';
import Stepper, { Step } from './Stepper';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { observationSchema } from '@/app/(app)/observations/new/validation';

interface StepperWrapperProps {
  steps: Array<{ label: string; component: React.ReactNode }>;
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
  onSubmit?: (data: any) => void;
  onNext?: () => void;
  onBack?: () => void;
  isLastStep?: boolean;
}

export function StepperWrapper({ 
  steps, 
  currentStep, 
  onStepClick, 
  className,
  onSubmit,
  onNext,
  onBack,
  isLastStep
}: StepperWrapperProps) {
  const methods = useForm({
    defaultValues: {
      type: "",
      teacherId: "",
      observationDate: null,
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
    },
    resolver: zodResolver(observationSchema),
    mode: "onBlur" // Validate on blur for better UX
  });

  const handleStepChange = (step: number) => {
    onStepClick?.(step - 1);
  };

  const handleSubmit = () => {
    methods.handleSubmit((values) => {
      onSubmit?.(values);
    })();
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
            onClick: () => {
              const currentValues = methods.getValues();
              // For the first step, validate the type selection
              if (currentStep === 0) {
                if (!currentValues.type) {
                  methods.setError("type", {
                    type: "required",
                    message: "Please select an observation type"
                  });
                  return;
                }
              }
              onNext?.();
            },
            type: 'button'
          }}
          stepCircleContainerClassName="bg-transparent shadow-none border-none"
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