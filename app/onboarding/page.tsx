"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Auto-complete onboarding with role detection
  const handleGetStarted = async () => {
    try {
      setIsProcessing(true);
      const result = await completeSimplifiedOnboarding();
      
      if (result.role === "teacher") {
        toast.success("Welcome teacher! You've been connected to your coach.");
      } else {
        toast.success("Welcome coach! You can now start managing teachers.");
      }
      
      router.replace("/dashboard");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      toast.error("Failed to complete setup. Please try again.");
      setIsProcessing(false);
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
        <Card className="p-8 max-w-lg w-full text-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Welcome to EdCoach AI
            </h2>
            <p className="text-muted-foreground">
              Hello {user.firstName || user.fullName}! We&apos;re setting up your account based on your email.
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              We&apos;ll automatically determine if you&apos;re joining as a coach or teacher based on your email address.
            </p>
          </div>

          <Button 
            onClick={handleGetStarted} 
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? "Setting up your account..." : "Get Started"}
          </Button>
        </Card>
      </SignedIn>
    </div>
  );
} 