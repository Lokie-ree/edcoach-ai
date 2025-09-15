"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { FormField, FormActions, FormSection, FormWrapper } from "@/components/forms";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, CheckCircle, Loader2, Target, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { usePgpForm } from "./use-pgp-form";
import { ANIMATIONS, SPACING, FORM_PATTERNS, RESPONSIVE_PATTERNS, STATUS_COLORS, ACCESSIBILITY } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

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
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const indicators = useQuery(api.rubricIndicators.getAllIndicators);
  const draftGoal = useAction(api.teachers.draftPgpGoal);
  const setPgpGoal = useMutation(api.teachers.setPgpGoal);
  const initializeWorkflow = useMutation(api.workflowState.initializeWorkflowState);
  const completePgpSetup = useMutation(api.workflowState.completePgpSetup);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      indicatorCode: "",
      contextNotes: "",
      goalText: "",
    },
  });

  // Create initial data for dirty state tracking
  const initialData = {
    indicatorCode: existingGoal?.indicatorCode || "",
    contextNotes: existingGoal?.contextNotes || "",
    goalText: existingGoal?.text || "",
  };

  // Use the custom hook to track form state
  const { setFormData, isDirty } = usePgpForm(initialData);

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

  // Update form data when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      setFormData({
        indicatorCode: value.indicatorCode || "",
        contextNotes: value.contextNotes || "",
        goalText: value.goalText || "",
      });
    });
    return () => subscription.unsubscribe();
  }, [form, setFormData]);

  // Handle close with confirmation logic
  const handleClose = () => {
    if (isDirty) {
      // If the form has changes, open the confirmation modal
      setIsConfirmModalOpen(true);
    } else {
      // If there are no changes, just close the wizard
      onCancel();
    }
  };

  const selectedIndicator = form.watch("indicatorCode");
  const selectedIndicatorData = indicators?.find(
    (ind) => ind.indicator_code === selectedIndicator,
  );

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

      // If this is a new goal (not editing), initialize workflow and complete setup step
      if (!existingGoal) {
        try {
          // Get coach ID from current user context (you might need to pass this as a prop)
          const coachId = "coach_id_placeholder" as Id<"users">; // TODO: Get actual coach ID
          
          // Initialize workflow state if it doesn't exist
          await initializeWorkflow({
            teacherId: teacherId as Id<"teachers">,
            coachId,
          });

          // Complete the PGP setup step
          await completePgpSetup({
            teacherId: teacherId as Id<"teachers">,
            goalIndicator: values.indicatorCode,
          });
        } catch (workflowError) {
          console.error("Workflow initialization error:", workflowError);
          // Don't fail the whole operation if workflow update fails
        }
      }

      toast.success(
        existingGoal
          ? "PGP goal updated successfully!"
          : "PGP goal set successfully!",
      );
      onSuccess();
    } catch (error) {
      toast.error("Failed to save goal. Please try again.");
      console.error("Error saving goal:", error);
    }
  };

  return (
    <div className={cn("space-y-6", SPACING.layout.section)}>
      {/* Header Section with Progress Indicator */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            existingGoal ? STATUS_COLORS.info.bg : STATUS_COLORS.success.bg
          )}>
            <Target className={cn(
              "w-6 h-6",
              existingGoal ? STATUS_COLORS.info.text : STATUS_COLORS.success.text
            )} />
          </div>
          <div>
            <h2 className={cn("font-bold text-foreground", RESPONSIVE_PATTERNS.text.heading)}>
              {existingGoal ? "Edit" : "Set"} PGP Goal for {teacherName}
            </h2>
            <p className={cn("text-muted-foreground", RESPONSIVE_PATTERNS.text.body)}>
              {existingGoal
                ? "Update the Professional Growth Plan goal for this teacher."
                : "Create a Professional Growth Plan goal focused on improving specific teaching practices."}
            </p>
          </div>
        </div>
        
        {/* Progress Steps Indicator */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              selectedIndicator ? STATUS_COLORS.success.bg : "bg-muted",
              selectedIndicator ? STATUS_COLORS.success.text : "text-muted-foreground"
            )}>
              1
            </div>
            <span className={cn("text-sm font-medium", selectedIndicator ? "text-foreground" : "text-muted-foreground")}>
              Select Indicator
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center space-x-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              form.getValues("goalText") ? STATUS_COLORS.success.bg : "bg-muted",
              form.getValues("goalText") ? STATUS_COLORS.success.text : "text-muted-foreground"
            )}>
              2
            </div>
            <span className={cn("text-sm font-medium", form.getValues("goalText") ? "text-foreground" : "text-muted-foreground")}>
              Generate Goal
            </span>
          </div>
        </div>
      </div>

      <FormWrapper form={form} onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="indicatorCode"
          label="Focus Indicator"
          description="Choose an indicator to focus on for this PGP goal"
        >
          {({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Choose an indicator to focus on..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {indicators?.map((indicator) => (
                  <SelectItem
                    key={indicator.indicator_code}
                    value={indicator.indicator_code}
                    className="py-3"
                  >
                    <div className="flex flex-col space-y-1">
                      <span className="font-medium text-sm">
                        {indicator.indicator_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {indicator.indicator_code}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>

        <FormField
          control={form.control}
          name="contextNotes"
          label="Additional Context (Optional)"
          description="Add any specific context about the teacher's current practice, recent observations, or areas of focus"
        >
          {({ field }) => (
            <Textarea
              placeholder="Add any specific context about the teacher's current practice, recent observations, or areas of focus..."
              className="min-h-[100px]"
              {...field}
            />
          )}
        </FormField>

          {/* AI Generation Section */}
          <div className={cn(
            "p-4 rounded-lg border-2 border-dashed transition-all",
            ANIMATIONS.classes.normal,
            selectedIndicator ? "border-primary bg-primary/5" : "border-muted bg-muted/20"
          )}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-medium text-sm">AI-Assisted Goal Generation</h4>
                <p className="text-xs text-muted-foreground">
                  {selectedIndicator 
                    ? "Ready to generate a SMART goal based on the selected indicator"
                    : "Select an indicator above to enable AI goal generation"
                  }
                </p>
              </div>
              <Button
                type="button"
                onClick={handleDraftGoal}
                disabled={isDrafting || !selectedIndicator}
                variant={selectedIndicator ? "default" : "outline"}
                className={cn(
                  "transition-all",
                  ANIMATIONS.classes.normal,
                  selectedIndicator ? "hover:bg-primary/90" : ""
                )}
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
          </div>

        <FormField
          control={form.control}
          name="goalText"
          label="PGP Goal"
          description="The AI-generated goal will appear here. You can edit it to better fit your needs."
        >
          {({ field }) => (
            <div className="space-y-2">
              <Textarea
                placeholder="The AI-generated goal will appear here. You can edit it to better fit your needs."
                className="min-h-[120px]"
                {...field}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Minimum 10 characters required</span>
                <span className={cn(
                  field.value && field.value.length >= 10 ? STATUS_COLORS.success.text : ""
                )}>
                  {field.value?.length || 0} characters
                </span>
              </div>
            </div>
          )}
        </FormField>

        <FormActions
          onCancel={handleClose}
          isSubmitting={form.formState.isSubmitting}
          submitText={existingGoal ? "Update PGP Goal" : "Set PGP Goal"}
          cancelText="Cancel"
          disabled={!form.getValues("goalText")}
        />
      </FormWrapper>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
          setIsConfirmModalOpen(false);
          onCancel();
        }}
        title="Discard unsaved changes?"
        description="You have unsaved changes. Are you sure you want to discard them? This action cannot be undone."
        confirmText="Discard Changes"
        cancelText="Keep Editing"
        variant="destructive"
      />
    </div>
  );
}
