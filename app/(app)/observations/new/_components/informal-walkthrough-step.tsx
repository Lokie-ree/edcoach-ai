"use client";

import { useFormContext } from "react-hook-form";
import { useQuery } from "convex/react";
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
import louisianaEducatorRubric from "@/data/louisiana-educator-rubric.json";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Rubric, RubricDomain, RubricIndicator } from "@/types/louisianaEducatorRubric";

export function InformalWalkthroughStep() {
  const teachers = useQuery(api.teachers.list);
  const { control, register, watch } = useFormContext();

  const indicators = useMemo(() => {
    const INSTRUCTION_DOMAINS = ["INSTRUCTION", "PLANNING", "ENVIRONMENT"];
    return (louisianaEducatorRubric as Rubric).domains
      .filter((domain: RubricDomain) => INSTRUCTION_DOMAINS.includes(domain.domain_name))
      .flatMap((domain: RubricDomain) =>
        domain.indicators.map((indicator: RubricIndicator) => ({
          value: indicator.indicator_code,
          label: `${indicator.indicator_name} (${indicator.indicator_code})`,
        })),
      );
  }, []);

  const reinforcementIndicators = watch("reinforcementIndicators") || [];
  const refinementIndicators = watch("refinementIndicators") || [];

  return (
    <div className="space-y-8">
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

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Reinforcement Indicators</h3>
        <FormField
          control={control}
          name="reinforcementIndicators"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {field.value && field.value.length > 0
                        ? field.value
                            .map((v: string) => indicators.find((o) => o.value === v)?.label)
                            .join(", ")
                        : "Select up to 3 indicators to reinforce"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    {indicators.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.value?.includes(option.value)}
                          disabled={
                            !field.value?.includes(option.value) &&
                            field.value?.length >= 3
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              if ((field.value || []).length < 3) {
                                field.onChange([...(field.value || []), option.value]);
                              }
                            } else {
                              field.onChange(
                                (field.value || []).filter((v: string) => v !== option.value)
                              );
                            }
                          }}
                          id={option.value}
                        />
                        <Label htmlFor={option.value}>{option.label}</Label>
                      </div>
                    ))}
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {reinforcementIndicators.map((indicator: string) => (
          <div key={indicator} className="space-y-2">
            <Label className="text-sm font-medium">
              Keep doing this for {indicator}
            </Label>
            <Textarea
              {...register(`reinforcementComments.${indicator}`)}
              placeholder="What specific practices should be continued?"
            />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Refinement Indicators</h3>
        <FormField
          control={control}
          name="refinementIndicators"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {field.value && field.value.length > 0
                        ? field.value
                            .map((v: string) => indicators.find((o) => o.value === v)?.label)
                            .join(", ")
                        : "Select up to 3 indicators to refine"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    {indicators.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.value?.includes(option.value)}
                          disabled={
                            !field.value?.includes(option.value) &&
                            field.value?.length >= 3
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              if ((field.value || []).length < 3) {
                                field.onChange([...(field.value || []), option.value]);
                              }
                            } else {
                              field.onChange(
                                (field.value || []).filter((v: string) => v !== option.value)
                              );
                            }
                          }}
                          id={option.value}
                        />
                        <Label htmlFor={option.value}>{option.label}</Label>
                      </div>
                    ))}
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {refinementIndicators.map((indicator: string) => (
          <div key={indicator} className="space-y-2">
            <Label className="text-sm font-medium">
              What about this for {indicator}
            </Label>
            <Textarea
              {...register(`refinementComments.${indicator}`)}
              placeholder="What specific practices could be refined?"
            />
          </div>
        ))}
      </div>

      <FormField
        control={control}
        name="additionalComments"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Comments (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Share any additional feedback..."
                className="resize-none"
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
