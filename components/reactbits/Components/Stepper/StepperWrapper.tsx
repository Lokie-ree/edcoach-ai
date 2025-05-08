import React from 'react';
import Stepper, { Step } from './Stepper';
import { useFormContext } from 'react-hook-form';

interface FormData {
  type?: "formal" | "walkthrough";
  teacherId?: string;
  observationDate?: Date;
  subject?: string;
  gradeLevels?: string[];
  reinforcementComment?: string;
  refinementComment?: string;
  rubricResponses?: Record<string, number>;
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
  onSubmit?: (data: any) => void | Promise<void>;
  onNext?: () => void | Promise<void>;
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
  const methods = useFormContext<FormData>();

  const handleStepChange = (step: number) => {
    onStepClick?.(step - 1);
  };

  const handleSubmit = () => {
    if (onSubmit && methods) {
      const values = methods.getValues();
      onSubmit(values as any);
    } else if (onSubmit) {
      console.warn("StepperWrapper: onSubmit called but form context not available. Submitting empty data.");
      onSubmit({} as any);
    }
  };

  return (
    <div className="w-full">
      <Stepper
        currentStep={currentStep + 1}
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
  );
} 