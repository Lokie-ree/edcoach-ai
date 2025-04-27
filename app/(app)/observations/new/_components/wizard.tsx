"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypeStep } from "./type-step";
import { DetailsStep } from "./details-step";
import { RubricStep } from "./rubric-step";
import { InformalWalkthroughStep } from "./informal-walkthrough-step";
import { FormProvider, useForm } from "react-hook-form";
import { StepperWrapper } from "@/components/reactbits/Components/Stepper/StepperWrapper";

type Step = {
  title: string;
  component: React.ReactNode;
};

export function Wizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const methods = useForm();

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

  const steps: Step[] = [
    {
      title: "Type",
      component: (
        <TypeStep selectedType={selectedType} onSelectType={setSelectedType} />
      ),
    },
    ...(selectedType === "walkthrough"
      ? [
          {
            title: "Walkthrough",
            component: (
              <InformalWalkthroughStep
                onNext={handleNext}
                onBack={handleBack}
              />
            ),
          },
        ]
      : [
          {
            title: "Details",
            component: <DetailsStep onNext={handleNext} onBack={handleBack} />,
          },
          {
            title: "Rubric",
            component: <RubricStep onNext={handleNext} onBack={handleBack} />,
          },
        ]),
  ];

  return (
    <FormProvider {...methods}>
      <div className="space-y-8">
        <StepperWrapper
          steps={steps.map((step) => ({ label: step.title }))}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          className="mb-8"
        />

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
          </CardHeader>
          <CardContent>{steps[currentStep].component}</CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </FormProvider>
  );
}
