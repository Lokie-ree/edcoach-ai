"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import SimplifiedOnboardingForm from "@/components/forms/simplified-onboarding-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

// Types for form values
interface OnboardingFormValues {
  name: string;
  email: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const completeSimplifiedOnboarding = useMutation(api.users.completeSimplifiedOnboarding);

  useEffect(() => {
    if (convexUser && convexUser.onboardingComplete === true) {
      router.replace("/dashboard");
    }
  }, [convexUser, router]);

  // Loading State
  if (!user || convexUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Complete onboarding with simplified form data
  const handleOnboardingComplete = async (values: OnboardingFormValues) => {
    try {
      await completeSimplifiedOnboarding({
        name: values.name,
        email: values.email,
      });
      toast.success("Welcome to EdCoach AI!");
      router.replace("/dashboard");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      toast.error("Failed to complete onboarding. Please try again.");
    }
  };

  return (
    <div className="min-h-screen px-4 flex items-center justify-center bg-background">
      <SignedOut>
        <Card className="p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in to continue</h2>
          <SignInButton mode="modal">
            <Button>Sign In</Button>
          </SignInButton>
        </Card>
      </SignedOut>
      <SignedIn>
        <Card className="p-8 max-w-lg w-full">
          <SimplifiedOnboardingForm
            defaultName={user.fullName || user.firstName || ""}
            defaultEmail={user.primaryEmailAddress?.emailAddress || ""}
            onSuccess={handleOnboardingComplete}
          />
        </Card>
      </SignedIn>
    </div>
  );
} 