"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";
import { STATUS_COLORS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { UserPlus, Mail, Loader2 } from "lucide-react";
import { useCanInviteTeacher } from "@/hooks/usageEnforcer";
import { useAuth } from "@clerk/nextjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  teacherEmail: z.string().email("Please enter a valid email address"),
  teacherName: z.string().min(2, "Teacher name must be at least 2 characters"),
  subject: z.string().optional(),
  gradeBand: z.string().optional(),
});

interface TeacherInvitationFormProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const GRADE_BAND_OPTIONS = [
  { value: "elementary", label: "Elementary" },
  { value: "middle", label: "Middle" },
  { value: "high", label: "High" },
];
const SUBJECT_OPTIONS = [
  { value: "math", label: "Math" },
  { value: "ela", label: "ELA" },
  { value: "science", label: "Science" },
  { value: "social studies", label: "Social Studies" },
  { value: "electives", label: "Electives" },
  { value: "sped", label: "SPED" },
];

export function TeacherInvitationForm({
  trigger,
  onSuccess,
}: TeacherInvitationFormProps) {
  const [open, setOpen] = useState(false);
  const { has } = useAuth();
  // Updated to use the new simplified action
  const sendInvitation = useAction(api.invitations.inviteTeacher);

  // Use the updated teacher limit checker
  const {
    allowed: canInviteTeacher,
    reason: inviteBlockReason,
    teacherUsage,
  } = useCanInviteTeacher();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teacherEmail: "",
      teacherName: "",
      subject: "",
      gradeBand: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // ENFORCE TEACHER LIMIT
    if (!canInviteTeacher) {
      toast.error("Teacher Limit Reached", {
        description:
          inviteBlockReason ||
          "You have reached your teacher limit. Upgrade to Coach Pro for more.",
      });
      return;
    }
    try {
      // Check for PAID Pro plan only - free users get starter plan by default
      const hasProPlan =
        (has?.({ plan: "coach_pro" }) ?? false) ||
        (has?.({ permission: "coach_pro" }) ?? false) ||
        (has?.({ role: "coach_pro" }) ?? false);

      // All users without a paid Pro plan get starter plan benefits by default
      const hasStarterPlan = !hasProPlan;

      console.log("🔍 Teacher invitation plan check:", {
        hasProPlan,
        hasStarterPlan,
        finalPlan: hasProPlan ? "pro" : "starter_free",
      });

      const result = await sendInvitation({
        teacherEmail: values.teacherEmail,
        teacherName: values.teacherName,
        subject: values.subject,
        gradeBand: values.gradeBand,
        hasProPlan,
        hasStarterPlan,
      });

      if (result.success) {
        toast.success("Invitation sent successfully!", {
          description: `An invitation has been sent to ${values.teacherEmail}`,
        });
        form.reset();
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error("Failed to send invitation", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("An error occurred", {
        description: "Failed to send invitation. Please try again.",
      });
    }
  }

  const defaultTrigger = (
    <Button className="gap-2">
      <UserPlus className="h-4 w-4" />
      Invite Teacher
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invite Teacher
          </DialogTitle>
          <DialogDescription>
            Send an invitation to a teacher to join your coaching team.
            They&apos;ll receive an email with instructions to get started.
          </DialogDescription>
        </DialogHeader>

        {/* Show current usage and warning if at limit */}
        {teacherUsage && (
          <div className={cn("mb-4 p-3 rounded border", STATUS_COLORS.info.bg, STATUS_COLORS.info.text, STATUS_COLORS.info.border)}>
            <div className="text-sm">
              <strong>Teacher Usage:</strong> {teacherUsage.teacherCount} of{" "}
              {teacherUsage.teacherLimit} used
            </div>
            {teacherUsage.teachersRemaining > 0 && (
              <div className="text-xs mt-1">
                {teacherUsage.teachersRemaining} teacher
                {teacherUsage.teachersRemaining === 1 ? "" : "s"} remaining
              </div>
            )}
          </div>
        )}

        {/* Show warning if at teacher limit */}
        {!canInviteTeacher && (
          <div className={cn("mb-4 p-3 rounded border", STATUS_COLORS.warning.bg, STATUS_COLORS.warning.text, STATUS_COLORS.warning.border)}>
            {inviteBlockReason ||
              "You have reached your teacher limit. Upgrade to Coach Pro for more."}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="teacherName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Sarah Johnson"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="teacherEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="teacher@school.edu"
                      {...field}
                      disabled={isLoading}
                    />
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
                  <FormLabel>Subject Area (optional)</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject area" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <FormLabel>Grade Band (optional)</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade band" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_BAND_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !canInviteTeacher}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className=" h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function TeacherInvitationFormContent({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { has } = useAuth();
  const sendInvitation = useAction(api.invitations.inviteTeacher);

  const {
    allowed: canInviteTeacher,
    reason: inviteBlockReason,
    teacherUsage,
  } = useCanInviteTeacher();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teacherEmail: "",
      teacherName: "",
      subject: "",
      gradeBand: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!canInviteTeacher) {
      toast.error("Teacher Limit Reached", {
        description:
          inviteBlockReason ||
          "You have reached your teacher limit. Upgrade to Coach Pro for more.",
      });
      return;
    }
    try {
      const hasProPlan =
        (has?.({ plan: "coach_pro" }) ?? false) ||
        (has?.({ permission: "coach_pro" }) ?? false) ||
        (has?.({ role: "coach_pro" }) ?? false);

      const hasStarterPlan = !hasProPlan;

      const result = await sendInvitation({
        teacherEmail: values.teacherEmail,
        teacherName: values.teacherName,
        subject: values.subject,
        gradeBand: values.gradeBand,
        hasProPlan,
        hasStarterPlan,
      });

      if (result.success) {
        toast.success("Invitation sent successfully!", {
          description: `An invitation has been sent to ${values.teacherEmail}`,
        });
        form.reset();
        onSuccess?.();
      } else {
        toast.error("Failed to send invitation", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("An error occurred", {
        description: "Failed to send invitation. Please try again.",
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Show current usage and warning if at limit */}
      {teacherUsage && (
        <div className={cn("p-3 rounded border", STATUS_COLORS.info.bg, STATUS_COLORS.info.text, STATUS_COLORS.info.border)}>
          <div className="text-sm">
            <strong>Teacher Usage:</strong> {teacherUsage.teacherCount} of{" "}
            {teacherUsage.teacherLimit} used
          </div>
          {teacherUsage.teachersRemaining > 0 && (
            <div className="text-xs mt-1">
              {teacherUsage.teachersRemaining} teacher
              {teacherUsage.teachersRemaining === 1 ? "" : "s"} remaining
            </div>
          )}
        </div>
      )}

      {/* Show warning if at teacher limit */}
      {!canInviteTeacher && (
        <div className={cn("p-3 rounded border", STATUS_COLORS.warning.bg, STATUS_COLORS.warning.text, STATUS_COLORS.warning.border)}>
          {inviteBlockReason ||
            "You have reached your teacher limit. Upgrade to Coach Pro for more."}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="teacherName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teacher Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Sarah Johnson"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="teacherEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="teacher@school.edu"
                    {...field}
                    disabled={isLoading}
                  />
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
                <FormLabel>Subject Area (optional)</FormLabel>
                <FormControl>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject area" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <FormLabel>Grade Band (optional)</FormLabel>
                <FormControl>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade band" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_BAND_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-center space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={onSuccess}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !canInviteTeacher}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
