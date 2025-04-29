import React from 'react';
import Stepper, { Step } from './Stepper';
import { FormProvider, useForm } from 'react-hook-form';

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