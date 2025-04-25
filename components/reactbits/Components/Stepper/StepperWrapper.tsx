import React from 'react';
import Stepper, { Step } from './Stepper';

interface StepperWrapperProps {
  steps: Array<{ label: string }>;
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

export function StepperWrapper({ steps, currentStep, onStepClick, className }: StepperWrapperProps) {
  return (
    <Stepper
      initialStep={currentStep + 1}
      onStepChange={(step) => onStepClick?.(step - 1)}
      className={className}
    >
      {steps.map((step, index) => (
        <Step key={index}>
          <div className="text-sm font-medium">{step.label}</div>
        </Step>
      ))}
    </Stepper>
  );
} 