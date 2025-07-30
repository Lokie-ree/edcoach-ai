"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Circle,
  Target,
  Eye,
  BarChart3,
  RefreshCw,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StepProgress {
  setup: {
    pgpSet: boolean;
    goalIndicator?: string;
  };
  capture: {
    walkthroughsCompleted: number;
  };
  analyze: {
    patternsIdentified: string[];
    insightsGenerated: number;
  };
  refine: {
    strategiesAdjusted: number;
  };
  reflect: {
    reflectionsCompleted: number;
  };
  monitor: {
    progressMetrics: string[];
    trendsIdentified: string[];
  };
}

interface WorkflowNavigatorProps {
  teacherId: Id<"teachers">;
  className?: string;
  compact?: boolean;
}

const stepIcons = {
  setup: Target,
  capture: Eye,
  analyze: BarChart3,
  refine: RefreshCw,
  reflect: MessageSquare,
  monitor: TrendingUp,
};

const stepColors = {
  setup: "bg-blue-500",
  capture: "bg-green-500",
  analyze: "bg-purple-500",
  refine: "bg-orange-500",
  reflect: "bg-pink-500",
  monitor: "bg-teal-500",
};

const stepLabels = {
  setup: "Setup",
  capture: "Capture",
  analyze: "Analyze",
  refine: "Refine",
  reflect: "Reflect",
  monitor: "Monitor",
};

export function WorkflowNavigator({
  teacherId,
  className,
  compact = false,
}: WorkflowNavigatorProps) {
  const workflowProgress = useQuery(api.workflowState.getWorkflowProgress, {
    teacherId,
  });
  const advanceStep = useMutation(api.workflowState.advanceWorkflowStep);

  if (!workflowProgress) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">
              No workflow state found
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stepOrder = [
    "setup",
    "capture",
    "analyze",
    "refine",
    "reflect",
    "monitor",
  ] as const;
  const currentStepIndex = stepOrder.indexOf(workflowProgress.currentStep);

  const handleAdvanceStep = async () => {
    try {
      await advanceStep({ teacherId });
    } catch (error) {
      console.error("Failed to advance workflow step:", error);
    }
  };

  if (compact) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Workflow Progress</CardTitle>
            <Badge variant="outline" className="text-xs">
              Cycle {workflowProgress.cycleNumber}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">
                {workflowProgress.overallProgress}%
              </span>
            </div>
            <Progress
              value={workflowProgress.overallProgress}
              className="h-2"
            />
          </div>

          <div className="flex items-center space-x-2">
            {stepOrder.map((step, index) => {
              const Icon = stepIcons[step];
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                      isCompleted && "bg-green-500 border-green-500 text-white",
                      isCurrent &&
                        `${stepColors[step]} border-current text-white`,
                      !isCompleted &&
                        !isCurrent &&
                        "border-muted-foreground/30 text-muted-foreground",
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  {index < stepOrder.length - 1 && (
                    <ChevronRight className="h-3 w-3 text-muted-foreground mx-1" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Current: {stepLabels[workflowProgress.currentStep]}
              </span>
              <span className="text-xs text-muted-foreground">
                {workflowProgress.currentStepProgress}% complete
              </span>
            </div>
            <Progress
              value={workflowProgress.currentStepProgress}
              className="h-1"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">EdCoach Workflow</CardTitle>
          <Badge variant="outline">Cycle {workflowProgress.cycleNumber}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-lg font-bold">
              {workflowProgress.overallProgress}%
            </span>
          </div>
          <Progress value={workflowProgress.overallProgress} className="h-3" />
        </div>

        {/* Step Progress */}
        <div className="space-y-4">
          {stepOrder.map((step, index) => {
            const Icon = stepIcons[step];
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const stepProgress = workflowProgress.stepProgress[step];

            return (
              <div key={step} className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                      isCompleted && "bg-green-500 border-green-500 text-white",
                      isCurrent &&
                        `${stepColors[step]} border-current text-white`,
                      !isCompleted &&
                        !isCurrent &&
                        "border-muted-foreground/30 text-muted-foreground",
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{stepLabels[step]}</h3>
                      {isCurrent && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>

                    {isCurrent && (
                      <div className="mt-1">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Step Progress</span>
                          <span>{workflowProgress.currentStepProgress}%</span>
                        </div>
                        <Progress
                          value={workflowProgress.currentStepProgress}
                          className="h-1 mt-1"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Step Details */}
                {isCurrent && (
                  <div className="ml-13 space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {getStepDescription(step, stepProgress)}
                    </div>

                    {/* Next Steps */}
                    {workflowProgress.nextSteps.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Next Steps
                        </span>
                        <ul className="space-y-1">
                          {workflowProgress.nextSteps.map((nextStep, idx) => (
                            <li
                              key={idx}
                              className="flex items-center space-x-2 text-sm"
                            >
                              <Circle className="h-3 w-3 text-muted-foreground" />
                              <span>{nextStep}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        {workflowProgress.currentStepProgress >= 80 && (
          <div className="pt-4 border-t">
            <Button onClick={handleAdvanceStep} className="w-full">
              <ChevronRight className="h-4 w-4 mr-2" />
              Advance to Next Step
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getStepDescription(
  step: string,
  stepProgress: StepProgress[keyof StepProgress],
): string {
  switch (step) {
    case "setup":
      const setupProgress = stepProgress as StepProgress["setup"];
      return setupProgress.pgpSet
        ? `PGP goal set for ${setupProgress.goalIndicator}`
        : "Set up your Professional Growth Plan to begin the coaching cycle";
    case "capture":
      const captureProgress = stepProgress as StepProgress["capture"];
      return `${captureProgress.walkthroughsCompleted} walkthrough${captureProgress.walkthroughsCompleted !== 1 ? "s" : ""} completed`;
    case "analyze":
      const analyzeProgress = stepProgress as StepProgress["analyze"];
      return `${analyzeProgress.insightsGenerated} insight${analyzeProgress.insightsGenerated !== 1 ? "s" : ""} generated from walkthrough data`;
    case "refine":
      const refineProgress = stepProgress as StepProgress["refine"];
      return `${refineProgress.strategiesAdjusted} coaching strateg${refineProgress.strategiesAdjusted !== 1 ? "ies" : "y"} adjusted`;
    case "reflect":
      const reflectProgress = stepProgress as StepProgress["reflect"];
      return `${reflectProgress.reflectionsCompleted} reflection${reflectProgress.reflectionsCompleted !== 1 ? "s" : ""} completed`;
    case "monitor":
      const monitorProgress = stepProgress as StepProgress["monitor"];
      return `Tracking ${monitorProgress.progressMetrics.length} progress metric${monitorProgress.progressMetrics.length !== 1 ? "s" : ""}`;
    default:
      return "";
  }
}
