"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import rubricContent from "@/data/rubric-content.json";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiSelect } from "@/components/ui/multi-select";
import { useMemo } from "react";

interface RubricIndicator {
  name: string;
  acronym: string;
  rubric: {
    "Level 5 Exemplary": string[];
    "Level 3 Proficient": string[];
    "Level 1 Unsatisfactory": string[];
    footnote?: string;
  };
}

interface RubricDomain {
  name: string;
  performance_level_descriptions: {
    "Level 5 Exemplary": string;
    "Level 3 Proficient": string;
    "Level 1 Unsatisfactory": string;
  };
  indicators: RubricIndicator[];
}

interface RubricContent {
  document_title: string;
  release_date: string;
  issuing_organization: string;
  partnership: string;
  contact_info: {
    website: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  overview: {
    purpose: string;
    grounding: string;
    focus_domains: string[];
    performance_levels: {
      defined: number[];
      observer_judgment: number[];
      notes: string;
    };
  };
  domains: RubricDomain[];
}

const formSchema = z.object({
  teacherId: z.string(),
  observationDate: z.coerce.date(),
  reinforcementIndicators: z.array(z.string()),
  refinementIndicators: z.array(z.string()),
  reinforcementComments: z.record(z.string(), z.string()),
  refinementComments: z.record(z.string(), z.string()),
  additionalComments: z.string().optional(),
});

interface InformalWalkthroughStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function InformalWalkthroughStep({
  onNext,
  onBack,
}: InformalWalkthroughStepProps) {
  const teachers = useQuery(api.teachers.list);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      observationDate: new Date(),
    },
  });

  const INSTRUCTION_DOMAINS = ["INSTRUCTION", "PLANNING", "ENVIRONMENT"];

  const indicators = useMemo(() => {
    return (rubricContent[0] as RubricContent).domains
      .filter((domain) => INSTRUCTION_DOMAINS.includes(domain.name))
      .flatMap((domain) =>
        domain.indicators.map((indicator) => ({
          value: indicator.acronym,
          label: `${indicator.name} (${indicator.acronym})`,
        })),
      );
  }, []);

  const reinforcementIndicators = form.watch("reinforcementIndicators") || [];
  const refinementIndicators = form.watch("refinementIndicators") || [];

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      onNext();
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
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
              <FormDescription>Select a teacher</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
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

        <Card>
          <CardHeader>
            <CardTitle>Reinforcement Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MultiSelect
              options={indicators}
              value={reinforcementIndicators}
              onChange={(value) =>
                form.setValue("reinforcementIndicators", value)
              }
              placeholder="Select up to 3 indicators to reinforce"
              maxSelected={3}
            />
            {reinforcementIndicators.map((indicator) => (
              <div key={indicator} className="space-y-2">
                <label className="text-sm font-medium">
                  Keep doing this for {indicator}
                </label>
                <Textarea
                  {...form.register(`reinforcementComments.${indicator}`)}
                  placeholder="What specific practices should be continued?"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Refinement Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MultiSelect
              options={indicators}
              value={refinementIndicators}
              onChange={(value) => form.setValue("refinementIndicators", value)}
              placeholder="Select up to 3 indicators to refine"
              maxSelected={3}
            />
            {refinementIndicators.map((indicator) => (
              <div key={indicator} className="space-y-2">
                <label className="text-sm font-medium">
                  What about this for {indicator}
                </label>
                <Textarea
                  {...form.register(`refinementComments.${indicator}`)}
                  placeholder="What specific practices could be refined?"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <FormField
          control={form.control}
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
              <FormDescription>
                Share any additional feedback...
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Next</Button>
        </div>
      </form>
    </Form>
  );
}
