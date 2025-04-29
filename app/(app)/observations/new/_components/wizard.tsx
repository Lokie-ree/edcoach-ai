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
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/components/ui/toast";

type Step = {
  title: string;
  component: React.ReactNode;
};

export function Wizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const createObservation = useMutation(
    api.observations.createObservationAndResponses,
  );
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

  const handleSubmit = async () => {
    try {
      const values = methods.getValues();
      const walkthroughEntries: {
        indicatorAcronym: string;
        type: "reinforcement" | "refinement";
        comment: string;
      }[] = [];

      if (selectedType === "walkthrough") {
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
      }

      await createObservation({
        teacherId: values.teacherId,
        subject: values.subject,
        gradeLevels: values.gradeLevels,
        observationDate: values.observationDate.getTime(),
        reinforcementComment: values.reinforcementComment,
        refinementComment: values.refinementComment,
        rubricResponses:
          selectedType === "formal" ? values.rubricResponses : undefined,
        walkthroughEntries:
          selectedType === "walkthrough" ? walkthroughEntries : undefined,
      });

      toast({
        title: "Success",
        description: "Observation created successfully",
      });

      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
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
          {currentStep === steps.length - 1 ? (
            <Button onClick={handleSubmit}>Submit</Button>
          ) : (
            <Button onClick={handleNext}>Next</Button>
          )}
        </div>
      </div>
    </FormProvider>
  );
}
