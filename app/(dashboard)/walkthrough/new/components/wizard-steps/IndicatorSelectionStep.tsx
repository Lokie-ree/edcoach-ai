"use client";

import { useFormContext } from "react-hook-form";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WalkthroughFormData } from "@/app/(dashboard)/walkthrough/new/validation";

interface IndicatorSelectionStepProps {
  isLast: boolean;
  canProceed: boolean;
}

export function IndicatorSelectionStep({}: IndicatorSelectionStepProps) {
  const methods = useFormContext<WalkthroughFormData>();
  
  // Get teachers for selection
  const teachers = useQuery(api.teachers.list);
  
  // Get indicators - use same approach as WalkthroughForm for consistency
  const rubricData = useQuery(api.rubrics.listRubricWithIndicators);
  
  interface Indicator {
    indicator_code: string;
    indicator_name: string;
    overview?: string | string[] | Record<string, string>;
    key_terms?: string | string[] | Record<string, string>;
    effective_practice?: string | string[] | Record<string, string>;
    development_evidence?: string | string[] | Record<string, string>;
    student_centered_evidence?: string | string[] | Record<string, string>;
    domain?: string;
  }
  
  const indicators: Indicator[] = rubricData
    ? rubricData.domains.flatMap(
        (domain: { indicators: Indicator[] }) => domain.indicators,
      )
    : [];

  // Show all indicators in both dropdowns - users can choose any indicator for reinforcement or refinement
  const reinforcementIndicators = indicators;
  const refinementIndicators = indicators;

  return (
    <div className="space-y-6">
      {/* Teacher Selection */}
      <FormField
        control={methods.control}
        name="teacherId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select Teacher</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a teacher..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {teachers?.map((teacher: { _id: string; name: string }) => (
                  <SelectItem key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Date Selection */}
      <FormField
        control={methods.control}
        name="walkthroughDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Walkthrough Date</FormLabel>
            <FormControl>
              <input
                type="date"
                value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                onChange={(e) => field.onChange(new Date(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reinforcement Indicator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 flex-wrap">
              <Badge variant="default" className="bg-green-100 text-green-800">
                Reinforcement
              </Badge>
              <span className="break-words">What went well?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={methods.control}
              name="reinforcementIndicator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose ONE indicator to reinforce</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reinforcement..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reinforcementIndicators.map((indicator: Indicator) => (
                        <SelectItem
                          key={indicator.indicator_code}
                          value={indicator.indicator_code}
                        >
                          <div className="break-words">
                            <div className="font-medium">
                              {(indicator as Indicator).indicator_code}: {(indicator as Indicator).indicator_name}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Refinement Indicator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Refinement
              </Badge>
              <span className="break-words">Area for growth?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={methods.control}
              name="refinementIndicator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose ONE area to refine</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select refinement..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {refinementIndicators.map((indicator: Indicator) => (
                        <SelectItem
                          key={indicator.indicator_code}
                          value={indicator.indicator_code}
                        >
                          <div className="break-words">
                            <div className="font-medium">
                              {(indicator as Indicator).indicator_code}: {(indicator as Indicator).indicator_name}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}