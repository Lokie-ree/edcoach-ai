declare module '@reactbits/stepper' {
  interface StepperProps {
    steps: Array<{ label: string }>;
    currentStep: number;
    onStepClick?: (index: number) => void;
    className?: string;
  }

  export const Stepper: React.FC<StepperProps>;
}

declare module '@reactbits/elastic-slider' {
  interface ElasticSliderProps {
    values: number[];
    value: number;
    onChange: (value: number) => void;
    className?: string;
  }

  export const ElasticSlider: React.FC<ElasticSliderProps>;
} 