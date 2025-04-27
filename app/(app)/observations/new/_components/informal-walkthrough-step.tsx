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

const formSchema = z.object({
  teacherId: z.string(),
  observationDate: z.coerce.date(),
  reinforcementIndicator: z.string(),
  refinementIndicator: z.string(),
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

  // Extract only the INSTRUCTION domain's indicators
  const instructionDomain = rubricContent[0].domains.find(
    (d) => d.name === "INSTRUCTION",
  );
  const instructionIndicators = instructionDomain?.indicators || [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      observationDate: new Date(),
    },
  });

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

        <FormField
          control={form.control}
          name="reinforcementIndicator"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What went well?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an indicator" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {instructionIndicators.map((indicator) => (
                    <SelectItem key={indicator.name} value={indicator.name}>
                      {indicator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>What went well?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="refinementIndicator"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What could we build on next?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an indicator" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {instructionIndicators.map((indicator) => (
                    <SelectItem key={indicator.name} value={indicator.name}>
                      {indicator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>What could we build on next?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
