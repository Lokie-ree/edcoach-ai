"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
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
  gradeBand: z.string().min(1, "Please select a grade band"),
  subject: z.string().min(1, "Please select a subject"),
});

type FormValues = z.infer<typeof formSchema>;

type TeacherDetailsFormProps = {
  onSuccess: () => void;
  createTeacherFromUser: (values: {
    userId: Id<'users'>;
    subject: string[];
    gradeBand: string;
  }) => Promise<unknown>;
  updateTeacher?: (values: {
    id: Id<'teachers'>;
    name: string;
    email: string;
    subject: string[];
    gradeBand: string;
  }) => Promise<unknown>;
  teacher: {
    _id: string;
    name: string;
    email: string;
    subject: string[];
    gradeBand: string;
    status?: string;
    isUserRecord?: boolean;
    userId?: string; // Add userId field for when it's a teacher record
  };
  initialSubject?: string;
  initialGradeBand?: string;
};

export default function TeacherDetailsForm({ 
  onSuccess, 
  createTeacherFromUser, 
  updateTeacher, 
  teacher,
  initialSubject = "",
  initialGradeBand = ""
}: TeacherDetailsFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gradeBand: teacher?.gradeBand || initialGradeBand || "",
      subject: teacher?.subject?.[0] || initialSubject || "",
    },
  });

  const isAddingDetails = teacher.isUserRecord || teacher.status === "needs_details";

  const onSubmit = async (values: FormValues) => {
    try {
      if (isAddingDetails) {
        // Creating teacher record from user
        // When isUserRecord is true, _id is the user ID
        // When isUserRecord is false, we need the userId field
        const userIdToUse = teacher.isUserRecord ? teacher._id : teacher.userId;
        
        if (!userIdToUse) {
          console.error("No user ID found for teacher:", teacher);
          toast.error("Unable to find user ID for this teacher");
          return;
        }
        
        console.log("Creating teacher record for user ID:", userIdToUse);
        
        await createTeacherFromUser({
          userId: userIdToUse as Id<'users'>,
          subject: [values.subject], // Convert single subject to array
          gradeBand: values.gradeBand,
        });
        toast.success("Teacher details added successfully");
      } else if (updateTeacher) {
        // Updating existing teacher record
        await updateTeacher({
          id: teacher._id as Id<'teachers'>,
          name: teacher.name,
          email: teacher.email,
          subject: [values.subject], // Convert single subject to array
          gradeBand: values.gradeBand,
        });
        toast.success("Teacher updated successfully");
      }
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Failed to save teacher:", error);
      
      // Extract more specific error message if available
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error details:", errorMessage);
      
      toast.error(`Failed to ${isAddingDetails ? "add details for" : "update"} teacher: ${errorMessage}`);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {isAddingDetails ? `Add Details for ${teacher.name}` : `Edit ${teacher.name}`}
      </h2>
      <p className="text-foreground mb-4">
        {isAddingDetails 
          ? `${teacher.name} has joined your organization. Add their teaching details below.`
          : "Update the teacher's details"
        }
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                ? (isAddingDetails ? "Adding Details..." : "Updating...")
                : (isAddingDetails ? "Add Details" : "Update Teacher")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 