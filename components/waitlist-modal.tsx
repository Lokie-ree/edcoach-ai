"use client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Waitlist } from "@clerk/nextjs";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function WaitlistModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-0">
        <VisuallyHidden>
          <DialogTitle>Join the Waitlist</DialogTitle>
        </VisuallyHidden>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2 text-center">Join the Waitlist</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
            Be the first to get early access to EdCoach AI. Enter your email below and we will notify you when you can sign up!
          </p>
          <Waitlist />
        </div>
      </DialogContent>
    </Dialog>
  );
} 