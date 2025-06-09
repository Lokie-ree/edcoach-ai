"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { GraduationCap, User2 } from "lucide-react";

const formSchema = z.object({
  role: z.enum(["coach", "teacher"], {
    required_error: "Please select a role",
  }),
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type FormValues = z.infer<typeof formSchema>;

type RoleSelectionFormProps = {
  onSuccess: (values: FormValues) => void;
};

export default function RoleSelectionForm({ onSuccess }: RoleSelectionFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: undefined,
      email: "",
      name: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      onSuccess(values);
    } catch (error) {
      console.error("Failed to submit role selection:", error);
      toast.error("Failed to submit role selection. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Welcome to EdCoach AI</h2>
        <p className="text-muted-foreground">
          Please select your role and provide your information to get started
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel>Select Your Role</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <Card className={`cursor-pointer transition-colors ${
                      field.value === "coach" ? "border-primary" : ""
                    }`}>
                      <CardHeader>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="coach" id="coach" />
                          <CardTitle>Coach</CardTitle>
                        </div>
                        <CardDescription>
                          I am an instructional coach who provides feedback to teachers
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center p-4">
                          <GraduationCap className="h-12 w-12 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={`cursor-pointer transition-colors ${
                      field.value === "teacher" ? "border-primary" : ""
                    }`}>
                      <CardHeader>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="teacher" id="teacher" />
                          <CardTitle>Teacher</CardTitle>
                        </div>
                        <CardDescription>
                          I am a teacher who receives feedback from coaches
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center p-4">
                          <User2 className="h-12 w-12 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
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
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Continuing..." : "Continue"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 