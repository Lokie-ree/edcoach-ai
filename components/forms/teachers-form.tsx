"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MultipleSelector, { Option } from "@/components/multiple-selector";
import { Id } from "@/convex/_generated/dataModel";

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

type TeachersFormProps = {
  onSuccess: () => void;
  createTeacher: (values: {
    name: string;
    email?: string;
    subject: string[];
    gradeLevels: string[];
    status?: string;
  }) => Promise<unknown>;
  updateTeacher?: (values: {
    id: Id<'teachers'>;
    name: string;
    email?: string;
    subject: string[];
    gradeLevels: string[];
    status?: string;
  }) => Promise<unknown>;
  teacher?: {
    _id: string;
    name: string;
    email?: string;
    subject: string[];
    gradeLevels: string[];
    status?: string;
  };
};

export default function TeachersForm({ onSuccess, createTeacher, updateTeacher, teacher }: TeachersFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: teacher?.name || "",
      email: teacher?.email || "",
      subject: teacher?.subject || [],
      gradeLevels: teacher?.gradeLevels || [],
    },
  });

  // Helper to map Option[] to string[]
  const getValuesFromOptions = (options: Option[]) => options.map((o) => o.value);

  const onSubmit = async (values: FormValues) => {
    try {
      if (teacher && updateTeacher) {
        await updateTeacher({
          id: teacher._id as Id<'teachers'>,
          name: values.name,
          email: values.email,
          subject: values.subject,
          gradeLevels: values.gradeLevels,
          status: teacher.status,
        });
        toast.success("Teacher updated successfully");
      } else {
        await createTeacher({
          name: values.name,
          email: values.email,
          subject: values.subject,
          gradeLevels: values.gradeLevels,
          status: "pending",
        });
        toast.success("Teacher added successfully");
      }
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Failed to save teacher:", error);
      toast.error(`Failed to ${teacher ? "update" : "add"} teacher. Please try again.`);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {teacher ? "Edit Teacher" : "Add New Teacher"}
      </h2>
      <p className="text-foreground mb-4">
        {teacher ? "Update the teacher's details" : "Enter the teacher's details to send them an invitation"}
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter teacher's name" {...field} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter teacher's email" {...field} />
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
          <div className="flex justify-between px-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                onSuccess();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? (teacher ? "Updating..." : "Adding...")
                : (teacher ? "Update Teacher" : "Add Teacher")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 