"use client";

import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { RubricContent } from "@/app/types/rubric";
import rubricContent from "@/data/rubric-content.json";

interface RubricStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function RubricStep({ onNext, onBack }: RubricStepProps) {
  const { control, watch } = useFormContext();
  const [expandedDomains, setExpandedDomains] = useState<string[]>([]);
  const rubricData = (rubricContent as RubricContent[])[0];

  const toggleDomain = (domainName: string) => {
    setExpandedDomains((prev) =>
      prev.includes(domainName)
        ? prev.filter((d) => d !== domainName)
        : [...prev, domainName],
    );
  };

  const completedIndicators = rubricData.domains.reduce((count, domain) => {
    return (
      count +
      domain.indicators.filter((indicator) => {
        const value = watch(`rubric.${domain.name}.${indicator.name}`);
        return value !== undefined && value !== null;
      }).length
    );
  }, 0);

  const totalIndicators = rubricData.domains.reduce(
    (count, domain) => count + domain.indicators.length,
    0,
  );

  const progress = (completedIndicators / totalIndicators) * 100;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {completedIndicators} of {totalIndicators} indicators rated
          </span>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <ScrollArea className="h-[500px] rounded-md border">
        <div className="p-4 space-y-4">
          {rubricData.domains.map((domain) => {
            const isExpanded = expandedDomains.includes(domain.name);
            return (
              <div key={domain.name} className="space-y-4">
                <div
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-muted",
                    isExpanded && "bg-muted",
                  )}
                  onClick={() => toggleDomain(domain.name)}
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <h3 className="font-medium">{domain.name}</h3>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-sm space-y-2">
                          <p className="font-medium">Level 5 - Exemplary</p>
                          <p className="text-sm">
                            {
                              domain.performance_level_descriptions[
                                "Level 5 Exemplary"
                              ]
                            }
                          </p>
                          <p className="font-medium">Level 3 - Proficient</p>
                          <p className="text-sm">
                            {
                              domain.performance_level_descriptions[
                                "Level 3 Proficient"
                              ]
                            }
                          </p>
                          <p className="font-medium">
                            Level 1 - Unsatisfactory
                          </p>
                          <p className="text-sm">
                            {
                              domain.performance_level_descriptions[
                                "Level 1 Unsatisfactory"
                              ]
                            }
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {isExpanded && (
                  <div className="space-y-6 pl-6">
                    {domain.indicators.map((indicator) => (
                      <div key={indicator.name} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">
                            {indicator.name}
                            {indicator.acronym && ` (${indicator.acronym})`}
                          </h4>
                        </div>

                        <div className="space-y-4">
                          <Controller
                            name={`rubric.${domain.name}.${indicator.name}`}
                            control={control}
                            render={({ field }) => {
                              const value = field.value || 0;
                              const level = Math.ceil(value / 20); // Convert 0-100 to 1-5

                              return (
                                <div className="flex items-center gap-4">
                                  {[1, 2, 3, 4, 5].map((rating) => (
                                    <label
                                      key={rating}
                                      className={cn(
                                        "flex items-center gap-2 cursor-pointer",
                                        level === rating && "text-primary",
                                      )}
                                    >
                                      <input
                                        type="radio"
                                        name={`rubric.${domain.name}.${indicator.name}`}
                                        value={rating * 20}
                                        checked={level === rating}
                                        onChange={() =>
                                          field.onChange(rating * 20)
                                        }
                                        className="h-4 w-4 border-muted-foreground/25"
                                      />
                                      <span className="text-sm font-medium">
                                        {rating}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              );
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}
