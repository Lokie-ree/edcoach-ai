"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import RoleSelectionForm from "@/components/forms/role-selection-form";
import CoachProfileForm from "@/components/forms/coach-profile-form";
import TeacherProfileForm from "@/components/forms/teacher-profile-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Types for form values
interface RoleSelectionValues {
  role: "coach" | "teacher";
  name: string;
  email: string;
}
interface CoachProfileValues {
  name: string;
  email: string;
  subscriptionTier: "basic" | "pro";
}
interface TeacherProfileValues {
  name: string;
  email: string;
  subject: string[];
  gradeLevels: string[];
}

export default function OnboardingPage() {
  const [step, setStep] = useState<"role" | "profile" | "done">("role");
  const [roleData, setRoleData] = useState<RoleSelectionValues | null>(null);
  const router = useRouter();
  const { user } = useUser();

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const upsertUserOnboarding = useMutation(api.users.upsertUserOnboarding);
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  useEffect(() => {
    if (convexUser && convexUser.onboardingComplete === true) {
      router.replace("/dashboard");
    }
  }, [convexUser, router]);

  // Loading State
  if (!user || convexUser === undefined) {
    return <div>Loading...</div>;
  }

  // Save role selection to Convex
  const handleRoleSelection = async (values: RoleSelectionValues) => {
    await upsertUserOnboarding({
      clerkId: user.id,
      role: values.role,
      name: values.name,
      email: values.email,
    });
    setRoleData(values);
    setStep("profile");
  };

  // Save profile completion to Convex
  const handleProfileComplete = async (
    profileValues: CoachProfileValues | TeacherProfileValues
  ) => {
    if (!roleData) return;
    if (roleData.role === "coach") {
      const coachVals = profileValues as CoachProfileValues;
      await completeOnboarding({
        clerkId: user.id,
        subscriptionTier: coachVals.subscriptionTier,
      });
    } else {
      await completeOnboarding({
        clerkId: user.id,
      });
    }
    setStep("done");
    router.replace("/dashboard");
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
          {step === "role" && (
            <RoleSelectionForm onSuccess={handleRoleSelection} />
          )}
          {step === "profile" && roleData?.role === "coach" && (
            <CoachProfileForm
              defaultName={roleData.name}
              defaultEmail={roleData.email}
              onSuccess={handleProfileComplete}
            />
          )}
          {step === "profile" && roleData?.role === "teacher" && (
            <TeacherProfileForm
              defaultName={roleData.name}
              defaultEmail={roleData.email}
              onSuccess={handleProfileComplete}
            />
          )}
          {step === "done" && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Onboarding Complete!</h2>
              <p>Redirecting to your dashboard...</p>
            </div>
          )}
        </Card>
      </SignedIn>
    </div>
  );
} 