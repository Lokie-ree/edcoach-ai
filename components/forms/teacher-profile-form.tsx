"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MultipleSelector, { Option } from "@/components/multiple-selector";

const SUBJECT_OPTIONS: Option[] = [
  { value: "math", label: "Math" },
  { value: "science", label: "Science" },
  { value: "english", label: "English" },
  { value: "social_studies", label: "Social Studies" },
  { value: "art", label: "Art" },
  { value: "music", label: "Music" },
  { value: "pe", label: "Physical Education" },
  { value: "spanish", label: "Spanish" },
  { value: "other", label: "Other" },
];
const GRADE_LEVEL_OPTIONS: Option[] = [
  { value: "k", label: "Kindergarten" },
  { value: "1", label: "1st Grade" },
  { value: "2", label: "2nd Grade" },
  { value: "3", label: "3rd Grade" },
  { value: "4", label: "4th Grade" },
  { value: "5", label: "5th Grade" },
  { value: "6", label: "6th Grade" },
  { value: "7", label: "7th Grade" },
  { value: "8", label: "8th Grade" },
  { value: "9", label: "9th Grade" },
  { value: "10", label: "10th Grade" },
  { value: "11", label: "11th Grade" },
  { value: "12", label: "12th Grade" },
];

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.array(z.string()).min(1, "Please select at least one subject"),
  gradeLevels: z.array(z.string()).min(1, "Please select at least one grade level"),
});

type FormValues = z.infer<typeof formSchema>;

type TeacherProfileFormProps = {
  defaultName: string;
  defaultEmail: string;
  onSuccess: (values: FormValues) => void;
};

export default function TeacherProfileForm({ defaultName, defaultEmail, onSuccess }: TeacherProfileFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultName,
      email: defaultEmail,
      subject: [],
      gradeLevels: [],
    },
  });

  // Helper to map Option[] to string[]
  const getValuesFromOptions = (options: Option[]) => options.map((o) => o.value);

  const onSubmit = async (values: FormValues) => {
    onSuccess(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject(s)</FormLabel>
              <FormControl>
                <MultipleSelector
                  options={SUBJECT_OPTIONS}
                  value={SUBJECT_OPTIONS.filter(option => field.value.includes(option.value))}
                  onChange={(selected) => field.onChange(getValuesFromOptions(selected))}
                  placeholder="Select subject(s)"
                  hideClearAllButton
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gradeLevels"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grade Level(s)</FormLabel>
              <FormControl>
                <MultipleSelector
                  options={GRADE_LEVEL_OPTIONS}
                  value={GRADE_LEVEL_OPTIONS.filter(option => field.value.includes(option.value))}
                  onChange={(selected) => field.onChange(getValuesFromOptions(selected))}
                  placeholder="Select grade level(s)"
                  hideClearAllButton
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Continue"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 