"use client";

import { useFormContext } from "react-hook-form";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

// Explicitly type the prop
interface InformalWalkthroughStepProps {
  onSubmit?: (payload: any) => Promise<void>;
}

export function InformalWalkthroughStep({ onSubmit: parentOnSubmit }: InformalWalkthroughStepProps) {
  const teachers = useQuery(api.teachers.list);
  const createWalkthrough = useMutation(api.walkthroughs.createWalkthroughAndEntries);
  const generateFeedback = useAction(api.aiFeedback.generateWalkthroughFeedback);
  const { control, setValue, watch, getValues } = useFormContext();

  const rubricData = useQuery(api.rubrics.listRubricWithIndicators);
  const rubricDomains = rubricData ? rubricData.domains : [];
  const allIndicators = rubricDomains.flatMap((domain: any) => domain.indicators);

  return (
    <div className="space-y-8">
      {/* Teacher selection */}
      <FormField
        control={control}
        name="teacherId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Teacher</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {teachers?.map((teacher) => (
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
      {/* Observation date */}
      <FormField
        control={control}
        name="observationDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Observation Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Reinforcement Indicator (single select dropdown) */}
      <FormField
        control={control}
        name="reinforcementIndicator"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reinforcement Indicator</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select an indicator to reinforce" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {allIndicators.map((indicator) => (
                  <SelectItem key={indicator.indicator_code} value={indicator.indicator_code}>
                    {indicator.indicator_name} ({indicator.indicator_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Refinement Indicator (single select dropdown) */}
      <FormField
        control={control}
        name="refinementIndicator"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Refinement Indicator</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select an indicator to refine" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {allIndicators.map((indicator) => (
                  <SelectItem key={indicator.indicator_code} value={indicator.indicator_code}>
                    {indicator.indicator_name} ({indicator.indicator_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Evidence Summary (required) */}
      <FormField
        control={control}
        name="evidenceSummary"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Evidence Summary</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter your overall notes and observations for this walkthrough..."
                className="resize-none"
                required
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}