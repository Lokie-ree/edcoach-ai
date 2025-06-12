"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

// Define grade bands - simplified to 3 main categories
const GRADE_BANDS = [
  { value: "elementary", label: "Elementary" },
  { value: "middle", label: "Middle School" },
  { value: "high", label: "High School" },
];

// Define subjects - simplified list that works across all grade bands
const SUBJECTS = [
  { value: "math", label: "Math" },
  { value: "ela", label: "ELA" },
  { value: "science", label: "Science" },
  { value: "social_studies", label: "Social Studies" },
  { value: "elective", label: "Elective" },
  { value: "sped", label: "SPED" },
];

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  gradeBand: z.string().min(1, "Please select a grade band"),
  subject: z.string().min(1, "Please select a subject"),
});

type FormValues = z.infer<typeof formSchema>;

type TeachersFormProps = {
  onSuccess: () => void;
  createTeacher: (values: {
    name: string;
    email?: string;
    subject: string[];
    gradeBand: string;
    status?: string;
  }) => Promise<unknown>;
  updateTeacher?: (values: {
    id: Id<'teachers'>;
    name: string;
    email?: string;
    subject: string[];
    gradeBand: string;
    status?: string;
  }) => Promise<unknown>;
  teacher?: {
    _id: string;
    name: string;
    email?: string;
    subject: string[];
    gradeBand: string;
    status?: string;
  };
};

export default function TeachersForm({ onSuccess, createTeacher, updateTeacher, teacher }: TeachersFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: teacher?.name || "",
      email: teacher?.email || "",
      gradeBand: teacher?.gradeBand || "",
      subject: teacher?.subject?.[0] || "", // Take first subject if multiple exist
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      if (teacher && updateTeacher) {
        await updateTeacher({
          id: teacher._id as Id<'teachers'>,
          name: values.name,
          email: values.email,
          subject: [values.subject], // Convert single subject to array
          gradeBand: values.gradeBand,
          status: teacher.status,
        });
        toast.success("Teacher updated successfully");
      } else {
        await createTeacher({
          name: values.name,
          email: values.email,
          subject: [values.subject], // Convert single subject to array
          gradeBand: values.gradeBand,
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
            name="gradeBand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade Band</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a grade band" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GRADE_BANDS.map((band) => (
                      <SelectItem key={band.value} value={band.value}>
                        {band.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SUBJECTS.map((subject) => (
                      <SelectItem key={subject.value} value={subject.value}>
                        {subject.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                form.reset();
                onSuccess();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting} className="flex-1">
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