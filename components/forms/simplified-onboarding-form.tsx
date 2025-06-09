"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof formSchema>;

type SimplifiedOnboardingFormProps = {
  defaultName: string;
  defaultEmail: string;
  onSuccess: (values: FormValues) => void;
};

export default function SimplifiedOnboardingForm({ 
  defaultName, 
  defaultEmail, 
  onSuccess 
}: SimplifiedOnboardingFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultName,
      email: defaultEmail,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      onSuccess(values);
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      toast.error("Failed to complete onboarding. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Welcome to EdCoach AI</h2>
        <p className="text-muted-foreground">
          Please confirm your information to get started as a coach
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              You&apos;ll start with a <strong>Basic</strong> subscription tier. You can upgrade to Pro later from your dashboard.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Getting Started..." : "Get Started"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 