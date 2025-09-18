"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Users,
  Building,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Container } from "@/components/ui/container";
import { toast } from "sonner";
import { usePlanDetection } from "@/hooks/usePlanDetection";
import { AIUsageBadge, AIUsageWarning } from "@/components/common/AiUsageBadge";
import { useQuery as useConvexQuery } from "convex/react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import TeacherTutorial from "@/app/(setup)/onboarding/components/TeacherTutorial";
import CoachTutorial from "@/app/(setup)/onboarding/components/CoachTutorial";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [step, setStep] = useState<
    "role-detection" | "coaching-setup" | "complete"
  >("role-detection");
  const [completingOnboarding, setCompletingOnboarding] = useState(false);
  const [showTeacherTutorial, setShowTeacherTutorial] = useState(false);
  const [showCoachTutorial, setShowCoachTutorial] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [tutorialInitialized, setTutorialInitialized] = useState(false);

  // Get current user data
  const convexUser = useQuery(
    api.users.current,
    user && isLoaded ? {} : "skip",
  );

  const completeOnboarding = useMutation(api.onboarding.complete);

  const planDetection = usePlanDetection();
  const teachers = useConvexQuery(api.teachers.list) ?? [];
  const teacherLimit = planDetection.isProPlan
    ? 15 // Pro: 15 teachers
    : planDetection.isStarterPlan
      ? 5 // Starter: 5 teachers
      : 1; // Free: 1 teacher
  const teacherCount = teachers.length;
  const teacherProgress = Math.min((teacherCount / teacherLimit) * 100, 100);
  const isNearTeacherLimit = teacherLimit - teacherCount <= 1;
  const isAtTeacherLimit = teacherCount >= teacherLimit;

  // Handle redirect to dashboard after onboarding is complete
  useEffect(() => {
    if (convexUser?.onboardingComplete && !completingOnboarding && !isRedirecting) {
      console.log("Onboarding complete, redirecting to dashboard");
      setIsRedirecting(true);
      // Small delay to prevent immediate redirect during state changes
      const timer = setTimeout(() => {
        router.replace("/dashboard");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [convexUser?.onboardingComplete, completingOnboarding, isRedirecting, router]);

  // Determine initial step based on user state
  useEffect(() => {
    if (!convexUser || !isLoaded || completingOnboarding || tutorialInitialized) return;
    if (convexUser.onboardingComplete) return;
    
    console.log("Initializing tutorial for user:", convexUser.role);
    
    // Small delay to ensure user data is stable
    const timer = setTimeout(() => {
      if (convexUser.role === "teacher") {
        setShowTeacherTutorial(true);
        setStep("complete");
        setTutorialInitialized(true);
        return;
      }
      if (convexUser.role === "coach") {
        setShowCoachTutorial(true);
        setStep("complete");
        setTutorialInitialized(true);
        return;
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [convexUser, isLoaded, completingOnboarding, tutorialInitialized]);

  const handleRedirectToDashboard = () => {
    if (isRedirecting) return; // Prevent multiple redirects
    setIsRedirecting(true);
    console.log("Redirecting to dashboard...");
    toast.success("Welcome to EdCoachAi!");
    setTimeout(() => {
      router.replace("/dashboard");
    }, 1000);
  };

  const handleCompleteOnboarding = async () => {
    setCompletingOnboarding(true);

    try {
      console.log("Completing onboarding for user:", convexUser?.role);
      console.log("User ID:", convexUser?._id);
      console.log("Current onboardingComplete status:", convexUser?.onboardingComplete);
      
      const result = await completeOnboarding({});
      console.log("Onboarding completion result:", result);
      
      if (result.success) {
        console.log("Onboarding completed successfully");
        setCompletingOnboarding(false);
        handleRedirectToDashboard();
      } else {
        console.error("Onboarding completion returned failure:", result);
        toast.error("Failed to complete setup. Please try again.");
        setCompletingOnboarding(false);
      }
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      toast.error("Failed to complete setup. Please try again.");
      setCompletingOnboarding(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!convexUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (convexUser?.onboardingComplete || isRedirecting) {
    // Show a spinner while redirecting to dashboard
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isRedirecting ? "Redirecting to dashboard..." : "Setting up your account..."}
          </p>
        </div>
      </div>
    );
  }

  // Show loading if completing onboarding
  if (completingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  // Show loading while tutorial is being initialized
  if (convexUser && !convexUser.onboardingComplete && !tutorialInitialized && !showTeacherTutorial && !showCoachTutorial) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Preparing your tutorial...</p>
        </div>
      </div>
    );
  }

  if (
    showTeacherTutorial &&
    convexUser?.role === "teacher" &&
    !convexUser.onboardingComplete
  ) {
    return (
      <TeacherTutorial
        onComplete={async () => {
          console.log("Teacher tutorial completed");
          setShowTeacherTutorial(false);
          setCompletingOnboarding(true);
          try {
            const result = await completeOnboarding({});
            console.log("Teacher tutorial completion result:", result);
            if (result.success) {
              setCompletingOnboarding(false);
              handleRedirectToDashboard();
            } else {
              console.error("Teacher tutorial completion failed:", result);
              setCompletingOnboarding(false);
              toast.error("Failed to complete setup. Please try again.");
            }
          } catch (error) {
            console.error("Teacher tutorial completion error:", error);
            setCompletingOnboarding(false);
            toast.error("Failed to complete setup. Please try again.");
          }
        }}
        onSkip={async () => {
          console.log("Teacher tutorial skipped");
          setShowTeacherTutorial(false);
          setCompletingOnboarding(true);
          try {
            const result = await completeOnboarding({});
            console.log("Teacher tutorial skip result:", result);
            if (result.success) {
              setCompletingOnboarding(false);
              handleRedirectToDashboard();
            } else {
              console.error("Teacher tutorial skip failed:", result);
              setCompletingOnboarding(false);
              toast.error("Failed to complete setup. Please try again.");
            }
          } catch (error) {
            console.error("Teacher tutorial skip error:", error);
            setCompletingOnboarding(false);
            toast.error("Failed to complete setup. Please try again.");
          }
        }}
      />
    );
  }

  if (
    showCoachTutorial &&
    convexUser?.role === "coach" &&
    !convexUser.onboardingComplete
  ) {
    return (
      <CoachTutorial
        onComplete={async () => {
          console.log("Coach tutorial completed");
          setShowCoachTutorial(false);
          setCompletingOnboarding(true);
          try {
            const result = await completeOnboarding({});
            console.log("Coach tutorial completion result:", result);
            if (result.success) {
              setCompletingOnboarding(false);
              handleRedirectToDashboard();
            } else {
              console.error("Coach tutorial completion failed:", result);
              setCompletingOnboarding(false);
              toast.error("Failed to complete setup. Please try again.");
            }
          } catch (error) {
            console.error("Coach tutorial completion error:", error);
            setCompletingOnboarding(false);
            toast.error("Failed to complete setup. Please try again.");
          }
        }}
        onSkip={async () => {
          console.log("Coach tutorial skipped");
          setShowCoachTutorial(false);
          setCompletingOnboarding(true);
          try {
            const result = await completeOnboarding({});
            console.log("Coach tutorial skip result:", result);
            if (result.success) {
              setCompletingOnboarding(false);
              handleRedirectToDashboard();
            } else {
              console.error("Coach tutorial skip failed:", result);
              setCompletingOnboarding(false);
              toast.error("Failed to complete setup. Please try again.");
            }
          } catch (error) {
            console.error("Coach tutorial skip error:", error);
            setCompletingOnboarding(false);
            toast.error("Failed to complete setup. Please try again.");
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <Container size="md" padding="normal" className="py-8">
        <PageHeader
          title={
            convexUser?.role === "teacher"
              ? "Welcome to EdCoachAi"
              : "Welcome to EdCoachAi"
          }
          description={
            convexUser?.role === "teacher"
              ? "You're all set up as a teacher. Your coach can now conduct walkthroughs and provide feedback."
              : "Let's set up your coaching platform in just a few steps"
          }
          gradient={true}
        />

        {/* Plan and usage badges */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {convexUser?.role === "coach" && (
            <div>
              <span className="font-medium mr-2">Current Plan:</span>
              <AIUsageBadge showDetails />
            </div>
          )}
          {convexUser?.role === "coach" && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Teachers:</span>
              <span>
                {teacherCount} / {teacherLimit}
              </span>
              <div className="w-32">
                <Progress value={teacherProgress} />
              </div>
            </div>
          )}
        </div>
        {/* Usage warnings and upgrade prompts */}
        <AIUsageWarning />
        {convexUser?.role === "coach" &&
          (isNearTeacherLimit || isAtTeacherLimit) && (
            <div
              className={`mb-6 p-4 rounded border ${isAtTeacherLimit ? "border-red-300 bg-red-50 text-red-800" : "border-orange-200 bg-orange-50 text-orange-800"}`}
            >
              {isAtTeacherLimit ? (
                <>
                  <strong>Teacher Limit Reached:</strong> You have added all{" "}
                  {teacherLimit} teachers allowed on your plan.{" "}
                  <Link
                    href="/settings/billing"
                    className="underline font-semibold"
                  >
                    Upgrade to Coach Pro
                  </Link>{" "}
                  to add more.
                </>
              ) : (
                <>
                  <strong>Few Teacher Slots Remaining:</strong> You have{" "}
                  {teacherLimit - teacherCount} teacher slot
                  {teacherLimit - teacherCount === 1 ? "" : "s"} left this
                  month.
                </>
              )}
            </div>
          )}

          <div className="mt-8 space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-4 mb-8">
            <div
              className={`flex items-center space-x-2 ${step === "role-detection" ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "role-detection" ? "bg-primary text-white" : "bg-muted"}`}
              >
                1
              </div>
              <span className="text-sm font-medium">Role Setup</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div
              className={`flex items-center space-x-2 ${step === "coaching-setup" ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "coaching-setup" ? "bg-primary text-white" : step === "complete" ? "bg-green-500 text-white" : "bg-muted"}`}
              >
                {step === "complete" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  "2"
                )}
              </div>
              <span className="text-sm font-medium">Coaching Setup</span>
            </div>
          </div>

          {/* Step Content */}
          {step === "role-detection" && (
            <Card className="mx-auto max-w-2xl">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Users className="h-6 w-6" />
                  You&apos;re Set Up as a Coach
                </CardTitle>
                <CardDescription>
                  We&apos;ve detected that you&apos;re signing up as an
                  instructional coach. You&apos;ll be able to:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Conduct classroom walkthroughs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Generate AI-powered feedback</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Manage your teacher team</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Access analytics and insights</span>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Coach Free Plan</strong> - Start with 1 teacher and
                    3 walkthroughs per month. Upgrade to Coach Starter
                    ($7/month) for 5 teachers and 15 walkthroughs, or Coach Pro
                    for even more.
                  </p>
                </div>
                <Button
                  onClick={() => setStep("coaching-setup")}
                  className="w-full"
                  size="lg"
                >
                  Continue Setup
                </Button>
              </CardContent>
            </Card>
          )}

          {step === "coaching-setup" && (
            <Card className="mx-auto max-w-2xl">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Building className="h-6 w-6" />
                  Set Up Your Coaching
                </CardTitle>
                <CardDescription>
                  Set up your coaching dashboard to manage your teacher
                  relationships
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="text-lg font-medium">
                    Your coaching dashboard will be named:
                    <span className="text-primary font-semibold block mt-1">
                      {user.firstName || user.fullName || "Coach"}&apos;s
                      Coaching
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    This will be your personal coaching space where you can
                    invite teachers directly, conduct walkthroughs, and manage
                    feedback.
                  </p>
                </div>
                <Button
                  onClick={handleCompleteOnboarding}
                  className="w-full"
                  size="lg"
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}

          {step === "complete" && (
            <Card className="mx-auto max-w-2xl">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Welcome to EdCoachAi!
                </CardTitle>
                <CardDescription>
                  {convexUser.role === "teacher"
                    ? "You're all set up as a teacher. Your coach can now conduct walkthroughs and provide feedback."
                    : "Your coaching setup is ready. You can now invite teachers and start conducting walkthroughs."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 justify-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Account setup complete</span>
                    </div>
                    {convexUser.role === "coach" && (
                      <>
                        <div className="flex items-center gap-3 justify-center">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span>Free Coach Starter plan activated</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleCompleteOnboarding}
                  className="w-full"
                  size="lg"
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
          </div>
        </Container>
      </div>
  );
}
