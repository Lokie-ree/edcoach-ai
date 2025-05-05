"use client";

import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Rubric, RubricDomain, RubricIndicator } from "@/types/louisianaEducatorRubric";
import louisianaEducatorRubric from "@/data/louisiana-educator-rubric.json";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function RubricStep() {
  const { control, watch } = useFormContext();
  const [expandedDomains, setExpandedDomains] = useState<string[]>([]);
  const rubricData = louisianaEducatorRubric as Rubric;

  const toggleDomain = (domainName: string) => {
    setExpandedDomains((prev) =>
      prev.includes(domainName)
        ? prev.filter((d) => d !== domainName)
        : [...prev, domainName],
    );
  };

  const completedIndicators = rubricData.domains.reduce((count: number, domain: RubricDomain) => {
    return (
      count +
      domain.indicators.filter((indicator: RubricIndicator) => {
        const value = watch(`rubric.${domain.domain_name}.${indicator.indicator_name}`);
        return value !== undefined && value !== null;
      }).length
    );
  }, 0);

  const totalIndicators = rubricData.domains.reduce(
    (count: number, domain: RubricDomain) => count + domain.indicators.length,
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
          {rubricData.domains.map((domain: RubricDomain) => {
            const isExpanded = expandedDomains.includes(domain.domain_name);
            return (
              <div key={domain.domain_name} className="space-y-4">
                <div
                  className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleDomain(domain.domain_name)}
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <h3 className="font-medium">{domain.domain_name}</h3>
                  </div>
                </div>

                {isExpanded && (
                  <div className="space-y-4 pl-6">
                    {domain.indicators.map((indicator: RubricIndicator) => (
                      <div key={indicator.indicator_name} className="space-y-2">
                        <Label className="text-sm font-medium">
                          {indicator.indicator_name}
                          {indicator.indicator_code && ` (${indicator.indicator_code})`}
                        </Label>

                        <Controller
                          name={`rubric.${domain.domain_name}.${indicator.indicator_name}`}
                          control={control}
                          render={({ field }) => (
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value ? field.value.toString() : undefined}
                              className="flex items-center gap-4"
                            >
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <div key={rating} className="flex items-center space-x-2">
                                  <RadioGroupItem value={(rating * 20).toString()} id={`rubric.${domain.domain_name}.${indicator.indicator_name}.${rating}`} />
                                  <Label htmlFor={`rubric.${domain.domain_name}.${indicator.indicator_name}.${rating}`}>{rating}</Label>
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
