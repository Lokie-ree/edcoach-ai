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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";
import { UserPlus, Mail, Loader2 } from "lucide-react";
import { useCanInviteTeacher } from "@/lib/usageEnforcer";

const formSchema = z.object({
  teacherEmail: z.string().email("Please enter a valid email address"),
  teacherName: z.string().min(2, "Teacher name must be at least 2 characters"),
});

interface TeacherInvitationFormProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function TeacherInvitationForm({ 
  trigger, 
  onSuccess 
}: TeacherInvitationFormProps) {
  const [open, setOpen] = useState(false);
  const sendInvitation = useAction(api.invitations.sendTeacherInvitation);

  // Fetch current teacher list for the coach
  const teachers = useQuery(api.teachers.list) ?? [];
  const { allowed: canInviteTeacher, reason: inviteBlockReason } = useCanInviteTeacher(teachers.length);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teacherEmail: "",
      teacherName: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // ENFORCE TEACHER LIMIT
    if (!canInviteTeacher) {
      toast.error("Teacher Limit Reached", {
        description: inviteBlockReason || "You have reached your teacher limit. Upgrade to Coach Pro for more.",
      });
      return;
    }
    try {
      const result = await sendInvitation({
        teacherEmail: values.teacherEmail,
        teacherName: values.teacherName,
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
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invite Teacher
          </DialogTitle>
          <DialogDescription>
            Send an invitation to a teacher to join your coaching team. They&apos;ll receive an email with instructions to get started.
          </DialogDescription>
        </DialogHeader>
        {/* Show warning if at teacher limit */}
        {!canInviteTeacher && (
          <div className="mb-4 p-3 rounded bg-orange-50 text-orange-800 border border-orange-200">
            {inviteBlockReason || "You have reached your teacher limit. Upgrade to Coach Pro for more."}
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
                  <FormDescription>
                    The full name of the teacher you&apos;re inviting
                  </FormDescription>
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
                  <FormDescription>
                    The teacher&apos;s email address where they&apos;ll receive the invitation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
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
                    <Mail className="mr-2 h-4 w-4" />
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