"use client";

import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function RubricStep() {
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

      <ScrollArea className="h-[270px] rounded-md border">
        <div className="p-4 space-y-6">
          {rubricData.domains.map((domain) => {
            const isExpanded = expandedDomains.includes(domain.name);
            return (
              <div key={domain.name} className="space-y-4">
                <div
                  className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-muted/50"
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
                  <div className="space-y-4 pl-6">
                    {domain.indicators.map((indicator) => (
                      <div key={indicator.name} className="space-y-2">
                        <Label className="text-sm font-medium">
                          {indicator.name}
                          {indicator.acronym && ` (${indicator.acronym})`}
                        </Label>

                        <Controller
                          name={`rubric.${domain.name}.${indicator.name}`}
                          control={control}
                          render={({ field }) => (
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value ? field.value.toString() : undefined}
                              className="flex items-center gap-4"
                            >
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <div key={rating} className="flex items-center space-x-2">
                                  <RadioGroupItem value={(rating * 20).toString()} id={`rubric.${domain.name}.${indicator.name}.${rating}`} />
                                  <Label htmlFor={`rubric.${domain.name}.${indicator.name}.${rating}`}>{rating}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
