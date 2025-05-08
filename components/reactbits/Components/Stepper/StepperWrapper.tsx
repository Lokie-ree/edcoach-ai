import React from 'react';
import Stepper, { Step } from './Stepper';
import { useFormContext, FieldValues } from 'react-hook-form';

interface StepperWrapperProps<T extends FieldValues> {
  steps: Array<{ label: string; component: React.ReactNode }>;
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
  onSubmit?: (data: T) => void | Promise<void>;
  onNext?: () => void | Promise<void>;
  onBack?: () => void;
}

export function StepperWrapper<T extends FieldValues = Record<string, unknown>>({ 
  steps, 
  currentStep,
  onStepClick, 
  className,
  onSubmit,
  onNext,
  onBack
}: StepperWrapperProps<T>) {
  const methods = useFormContext<T>();

  const handleStepChange = (step: number) => {
    onStepClick?.(step - 1);
  };

  const handleSubmit = () => {
    if (onSubmit && methods) {
      const values = methods.getValues();
      onSubmit(values as T);
    } else if (onSubmit) {
      console.warn("StepperWrapper: onSubmit called but form context not available. Submitting empty data.");
      onSubmit({} as T);
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