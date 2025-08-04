"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "@clerk/nextjs";
import { walkthroughSchema } from "@/app/(dashboard)/walkthrough/new/validation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { CalendarInput } from "@/components/ui/calendar-input";
import { Loader2 } from "lucide-react";

// Types
export type WalkthroughFormData = z.infer<typeof walkthroughSchema>;

// Explicit types for teachers and indicators
interface Teacher {
  _id: string;
  name: string;
  email?: string;
  department?: string;
  gradeLevel?: string;
  status?: string;
  createdBy?: string;
  createdAt: number;
  organization?: string;
}

interface Indicator {
  indicator_code: string;
  indicator_name: string;
  overview?: string | string[] | Record<string, string>;
  key_terms?: string | string[] | Record<string, string>;
  effective_practice?: string | string[] | Record<string, string>;
  development_evidence?: string | string[] | Record<string, string>;
  student_centered_evidence?: string | string[] | Record<string, string>;
  domain?: string;
}

export function WalkthroughForm({
  coachId: propCoachId,
}: {
  walkthroughId?: Id<"walkthroughs">;
  coachId?: Id<"users">;
}) {
  const methods = useForm<WalkthroughFormData>({
    resolver: zodResolver(walkthroughSchema),
    defaultValues: {
      teacherId: "",
      walkthroughDate: new Date(),
      evidenceSummary: "",
      reinforcementIndicator: "",
      refinementIndicator: "",
      reinforcementFeedback: "",
      refinementFeedback: "",
    },
    mode: "onChange",
  });
  
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  
  const createWalkthrough = useMutation(api.walkthroughs.createWalkthrough);
  const router = useRouter();
  const { toast } = useToast();

  // Use propCoachId if provided, otherwise fetch current user
  const { user } = useUser();
  const convexUser = useQuery(
    api.users.current,
    !propCoachId && user ? {} : "skip",
  );

  // Get the coach ID from props or current user
  const coachId = propCoachId || convexUser?._id;

  // Get teachers for selection
  const teachers = useQuery(
    api.teachers.list,
    coachId ? {} : "skip",
  ) as Teacher[] | undefined;

  // Get indicators
  const rubricData = useQuery(api.rubrics.listRubricWithIndicators);
  const indicators = rubricData
    ? rubricData.domains.flatMap(
        (domain: { indicators: Indicator[] }) => domain.indicators,
      )
    : [];

  // Submit handler
  const onSubmit = async (data: WalkthroughFormData) => {
    if (!coachId) {
      toast({
        title: "Error",
        description: "Coach not found",
        variant: "destructive",
      });
      return;
    }

    try {
      const walkthroughDate =
        data.walkthroughDate instanceof Date
          ? data.walkthroughDate.getTime()
          : Number(data.walkthroughDate);

      const walkthroughId = await createWalkthrough({
        teacherId: data.teacherId as Id<"teachers">,
        walkthroughDate,
        evidenceSummary: data.evidenceSummary,
        reinforcementIndicator: data.reinforcementIndicator,
        refinementIndicator: data.refinementIndicator,
        reinforcementFeedback: data.reinforcementFeedback,
        refinementFeedback: data.refinementFeedback,
      });

      toast({
        title: "Success",
        description: "Walkthrough created successfully",
      });

      router.push(`/walkthrough/${walkthroughId}/view`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create walkthrough",
        variant: "destructive",
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Walkthrough Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Teacher Selection */}
              <FormField
                control={methods.control}
                name="teacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Teacher</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a teacher..." />
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

              {/* Date Selection */}
              <FormField
                control={methods.control}
                name="walkthroughDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Walkthrough Date</FormLabel>
                    <FormControl>
                      <CalendarInput
                        date={field.value instanceof Date ? field.value : new Date(field.value)}
                        setDate={(date) => field.onChange(date || new Date())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reinforcement Indicator */}
              <FormField
                control={methods.control}
                name="reinforcementIndicator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reinforcement Indicator</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an indicator to reinforce..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {indicators.map((indicator: Indicator) => (
                          <SelectItem
                            key={indicator.indicator_code}
                            value={indicator.indicator_code}
                          >
                            {indicator.indicator_code}: {indicator.indicator_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Refinement Indicator */}
              <FormField
                control={methods.control}
                name="refinementIndicator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Refinement Indicator</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an indicator to refine..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {indicators.map((indicator: Indicator) => (
                          <SelectItem
                            key={indicator.indicator_code}
                            value={indicator.indicator_code}
                          >
                            {indicator.indicator_code}: {indicator.indicator_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Evidence Summary */}
              <FormField
                control={methods.control}
                name="evidenceSummary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evidence Summary</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} placeholder="Describe what you observed..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reinforcement Feedback */}
              <FormField
                control={methods.control}
                name="reinforcementFeedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reinforcement Feedback</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} placeholder="Positive feedback for reinforcement..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Refinement Feedback */}
              <FormField
                control={methods.control}
                name="refinementFeedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Refinement Feedback</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} placeholder="Constructive feedback for refinement..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Walkthrough"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </FormProvider>
  );
}