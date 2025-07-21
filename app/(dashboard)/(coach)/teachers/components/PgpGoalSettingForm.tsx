"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const formSchema = z.object({
  indicatorCode: z.string().min(1, "Please select an indicator"),
  contextNotes: z.string().optional(),
  goalText: z.string().min(10, "Goal must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

type PgpGoalSettingFormProps = {
  teacherId: string;
  teacherName: string;
  teacherSubject: string[];
  teacherGradeBand: string;
  onSuccess: () => void;
  onCancel: () => void;
  existingGoal?: {
    text: string;
    indicatorCode: string;
    contextNotes?: string;
    setAt: number;
    targetDate?: number;
    progress?: number;
  };
};

export default function PgpGoalSettingForm({
  teacherId,
  teacherName,
  teacherSubject,
  teacherGradeBand,
  onSuccess,
  onCancel,
  existingGoal,
}: PgpGoalSettingFormProps) {
  const [isDrafting, setIsDrafting] = useState(false);
  
  const indicators = useQuery(api.rubricIndicators.getAllIndicators);
  const draftGoal = useAction(api.teachers.draftPgpGoal);
  const setPgpGoal = useMutation(api.teachers.setPgpGoal);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      indicatorCode: "",
      contextNotes: "",
      goalText: "",
    },
  });

  // Prefill form with existing goal data when editing
  useEffect(() => {
    if (existingGoal) {
      form.reset({
        indicatorCode: existingGoal.indicatorCode,
        contextNotes: existingGoal.contextNotes || "",
        goalText: existingGoal.text,
      });
    }
  }, [existingGoal, form]);

  const selectedIndicator = form.watch("indicatorCode");
  const selectedIndicatorData = indicators?.find(ind => ind.indicator_code === selectedIndicator);

  const handleDraftGoal = async () => {
    if (!selectedIndicator || !selectedIndicatorData) {
      toast.error("Please select an indicator first");
      return;
    }

    setIsDrafting(true);
    try {
      const goal = await draftGoal({
        indicatorCode: selectedIndicator,
        contextNotes: form.getValues("contextNotes") || undefined,
        teacherName,
        subject: teacherSubject,
        gradeBand: teacherGradeBand,
        indicatorName: selectedIndicatorData.indicator_name,
        indicatorDomain: selectedIndicatorData.domain,
        indicatorOverview: selectedIndicatorData.overview,
      });
      
      form.setValue("goalText", goal);
      toast.success("Goal drafted successfully!");
    } catch (error) {
      toast.error("Failed to draft goal. Please try again.");
      console.error("Error drafting goal:", error);
    } finally {
      setIsDrafting(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await setPgpGoal({
        teacherId: teacherId as Id<"teachers">,
        text: values.goalText.trim(),
        indicatorCode: values.indicatorCode,
        contextNotes: values.contextNotes || undefined,
      });
      toast.success(existingGoal ? "PGP goal updated successfully!" : "PGP goal set successfully!");
      onSuccess();
    } catch (error) {
      toast.error("Failed to save goal. Please try again.");
      console.error("Error saving goal:", error);
    }
  };

    return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {existingGoal ? "Edit" : "Set"} PGP Goal for {teacherName}
      </h2>
      <p className="text-foreground mb-4">
        {existingGoal 
          ? "Update the Professional Growth Plan goal for this teacher."
          : "Create a Professional Growth Plan goal focused on improving specific teaching practices."
        }
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="indicatorCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Focus Indicator</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an indicator to focus on..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {indicators?.map((indicator) => (
                      <SelectItem key={indicator.indicator_code} value={indicator.indicator_code}>
                        <div className="flex flex-col">
                          <span className="font-medium">{indicator.indicator_name}</span>
                          <span className="text-sm text-muted-foreground">
                            {indicator.indicator_code} • {indicator.domain}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedIndicatorData && (
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <div className="mb-2">
                <h4 className="font-semibold">{selectedIndicatorData.indicator_name}</h4>
                <p className="text-sm text-muted-foreground">{selectedIndicatorData.indicator_code}</p>
              </div>
              <p className="text-sm mb-2">
                {selectedIndicatorData.overview || "No overview available"}
              </p>
              <Badge variant="secondary">
                {selectedIndicatorData.domain}
              </Badge>
            </div>
          )}

          <FormField
            control={form.control}
            name="contextNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Context (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add any specific context about the teacher's current practice, recent observations, or areas of focus..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleDraftGoal}
              disabled={isDrafting || !selectedIndicator}
              variant="outline"
            >
              {isDrafting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Goal
                </>
              )}
            </Button>
          </div>

          <FormField
            control={form.control}
            name="goalText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PGP Goal</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="The AI-generated goal will appear here. You can edit it to better fit your needs."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting || !form.getValues("goalText")}
              className="flex-1"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {existingGoal ? "Updating..." : "Setting Goal..."}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {existingGoal ? "Update PGP Goal" : "Set PGP Goal"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 