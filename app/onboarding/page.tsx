"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Building, ArrowRight, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { usePlanDetection } from "@/lib/usePlanDetection";
import { AIUsageBadge, AIUsageWarning } from "@/components/ui/ai-usage-badge";
import { useQuery as useConvexQuery } from "convex/react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import TeacherTutorial from "@/components/onboarding/teacher-tutorial";


export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [step, setStep] = useState<'role-detection' | 'coaching-setup' | 'complete'>('role-detection');
  const [completingOnboarding, setCompletingOnboarding] = useState(false);
  const [showTeacherTutorial, setShowTeacherTutorial] = useState(false);

  // Get current user data
  const convexUser = useQuery(
    api.users.current,
    user && isLoaded ? {} : "skip"
  );

  const completeOnboarding = useMutation(api.onboarding.complete);

  const planDetection = usePlanDetection();
  const teachers = useConvexQuery(api.teachers.list) ?? [];
  const teacherLimit = planDetection.isProPlan ? 25 : 5;
  const teacherCount = teachers.length;
  const teacherProgress = Math.min((teacherCount / teacherLimit) * 100, 100);
  const isNearTeacherLimit = teacherLimit - teacherCount <= 1;
  const isAtTeacherLimit = teacherCount >= teacherLimit;

  // Handle redirect to dashboard after onboarding is complete
  useEffect(() => {
    if (convexUser?.onboardingComplete && !completingOnboarding) {
      console.log("Onboarding complete, redirecting to dashboard");
      // Small delay to prevent immediate redirect during state changes
      const timer = setTimeout(() => {
        router.replace('/dashboard');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [convexUser?.onboardingComplete, completingOnboarding, router]);

  // Determine initial step based on user state
  useEffect(() => {
    if (!convexUser || !isLoaded || completingOnboarding) return;
    if (convexUser.onboardingComplete) return;
    if (convexUser.role === "teacher") {
      setShowTeacherTutorial(true);
      setStep("complete");
      return;
    }
    if (convexUser.role === "coach") {
      setStep("role-detection");
    }
  }, [convexUser, isLoaded, completingOnboarding]);

  const handleCompleteOnboarding = async () => {
    setCompletingOnboarding(true);
    
    try {
      console.log("Completing onboarding for user:", convexUser?.role);
      await completeOnboarding({});
      console.log("Onboarding completed successfully");
      toast.success("Welcome to EdCoach AI!");
      
      // Small delay then redirect
      setTimeout(() => {
        router.replace('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  if (showTeacherTutorial && convexUser?.role === "teacher" && !convexUser.onboardingComplete) {
    return (
      <TeacherTutorial
        onComplete={async () => {
          setShowTeacherTutorial(false);
          setCompletingOnboarding(true);
          await completeOnboarding({});
          setCompletingOnboarding(false);
          router.replace("/dashboard");
        }}
        onSkip={async () => {
          setShowTeacherTutorial(false);
          setCompletingOnboarding(true);
          await completeOnboarding({});
          setCompletingOnboarding(false);
          router.replace("/dashboard");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <PageHeader
          title={convexUser?.role === "teacher" ? "Welcome to EdCoach AI" : "Welcome to EdCoach AI"}
          description={convexUser?.role === "teacher"
            ? "You're all set up as a teacher. Your coach can now conduct walkthroughs and provide feedback."
            : "Let's set up your coaching platform in just a few steps"}
          gradient={true}
        />

        {/* Plan and usage badges */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div>
            <span className="font-medium mr-2">Current Plan:</span>
            <AIUsageBadge showDetails />
          </div>
          {convexUser?.role === 'coach' && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Teachers:</span>
              <span>{teacherCount} / {teacherLimit}</span>
              <div className="w-32">
                <Progress value={teacherProgress} />
              </div>
            </div>
          )}
        </div>
        {/* Usage warnings and upgrade prompts */}
        <AIUsageWarning />
        {convexUser?.role === 'coach' && (isNearTeacherLimit || isAtTeacherLimit) && (
          <div className={`mb-6 p-4 rounded border ${isAtTeacherLimit ? 'border-red-300 bg-red-50 text-red-800' : 'border-orange-200 bg-orange-50 text-orange-800'}`}>
            {isAtTeacherLimit ? (
              <>
                <strong>Teacher Limit Reached:</strong> You have added all {teacherLimit} teachers allowed on your plan. <Link href="/billing" className="underline font-semibold">Upgrade to Coach Pro</Link> to add more.
              </>
            ) : (
              <>
                <strong>Few Teacher Slots Remaining:</strong> You have {teacherLimit - teacherCount} teacher slot{teacherLimit - teacherCount === 1 ? '' : 's'} left this month.
              </>
            )}
          </div>
        )}

        <div className="mt-8 space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className={`flex items-center space-x-2 ${step === 'role-detection' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'role-detection' ? 'bg-primary text-white' : 'bg-muted'}`}>
                1
              </div>
              <span className="text-sm font-medium">Role Setup</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className={`flex items-center space-x-2 ${step === 'coaching-setup' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'coaching-setup' ? 'bg-primary text-white' : step === 'complete' ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                {step === 'complete' ? <CheckCircle className="h-4 w-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">Coaching Setup</span>
            </div>
          </div>

          {/* Step Content */}
          {step === 'role-detection' && (
            <Card className="mx-auto max-w-2xl">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Users className="h-6 w-6" />
                  You&apos;re Set Up as a Coach
                </CardTitle>
                <CardDescription>
                  We&apos;ve detected that you&apos;re signing up as an instructional coach. You&apos;ll be able to:
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
                    <strong>Free Coach Starter Plan</strong> - Start with up to 5 teachers and 20 AI feedback generations per month. Upgrade anytime when you need more.
                  </p>
                </div>
                <Button 
                  onClick={() => setStep('coaching-setup')} 
                  className="w-full"
                  size="lg"
                >
                  Continue Setup
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'coaching-setup' && (
            <Card className="mx-auto max-w-2xl">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Building className="h-6 w-6" />
                  Set Up Your Coaching
                </CardTitle>
                <CardDescription>
                  Set up your coaching dashboard to manage your teacher relationships
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="text-lg font-medium">
                    Your coaching dashboard will be named:
                    <span className="text-primary font-semibold block mt-1">
                      {user.firstName || user.fullName || 'Coach'}&apos;s Coaching
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    This will be your personal coaching space where you can invite teachers directly, conduct walkthroughs, and manage feedback.
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

          {step === 'complete' && (
            <Card className="mx-auto max-w-2xl">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Welcome to EdCoach AI!
                </CardTitle>
                <CardDescription>
                  {convexUser.role === 'teacher' 
                    ? "You're all set up as a teacher. Your coach can now conduct walkthroughs and provide feedback."
                    : "Your coaching setup is ready. You can now invite teachers and start conducting walkthroughs."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 justify-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Account setup complete</span>
                    </div>
                    {convexUser.role === 'coach' && (
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
      </div>
    </div>
  );
} 