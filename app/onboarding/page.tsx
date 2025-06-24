"use client";

import { useEffect, useState } from "react";
import { useUser, useOrganization, useClerk } from "@clerk/nextjs";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Building, ArrowRight, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { toast } from "sonner";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const { organization } = useOrganization();
  const { setActive } = useClerk();
  const router = useRouter();

  const [step, setStep] = useState<'role-detection' | 'organization' | 'complete'>('role-detection');
  const [loading, setLoading] = useState(false);
  const [completingOnboarding, setCompletingOnboarding] = useState(false);

  // Get current user data
  const convexUser = useQuery(
    api.users.current,
    user && isLoaded ? {} : "skip"
  );

  const createOrganization = useAction(api.onboarding.createCoachOrganization);
  const completeOnboarding = useMutation(api.onboarding.complete);

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
    if (!convexUser || !isLoaded || loading || completingOnboarding) return;

    // If already onboarded, don't change step (let redirect effect handle it)
    if (convexUser.onboardingComplete) {
      return;
    }

    // If user has pending teacher record, they're a teacher - complete immediately
    if (convexUser.role === 'teacher') {
      setStep('complete');
      return;
    }

    // Coach flow - check organization status
    if (convexUser.role === 'coach') {
      if (!convexUser.clerkOrganizationId && !organization) {
        setStep('organization');
      } else if (convexUser.clerkOrganizationId || organization) {
        setStep('complete');
      }
    }
  }, [convexUser, organization, isLoaded, loading, completingOnboarding]);

  const handleCreateOrganization = async () => {
    if (!user) return;
    
    setLoading(true);
    setCompletingOnboarding(true);
    
    try {
      const orgName = `${user.firstName || user.fullName || 'Coach'}'s Team`;
      console.log('Creating organization with name:', orgName);
      
      const result = await createOrganization({
        organizationName: orgName
      });
      
      console.log('Organization creation result:', result);
      
      if (result.success && result.organizationId) {
        console.log('Organization created successfully:', result.organizationId);
        
        // Set the newly created organization as active in Clerk
        try {
          console.log('Setting active organization...');
          await new Promise(resolve => setTimeout(resolve, 500));
          await setActive({ organization: result.organizationId });
          console.log('Set active organization:', result.organizationId);
        } catch (setActiveError) {
          console.warn('Failed to set active organization, but continuing:', setActiveError);
        }
        
        // Organization creation automatically completes onboarding in backend
        console.log('Organization creation complete, showing success message');
        toast.success("Welcome to EdCoach AI! Your coaching organization is ready.");
        
        // Wait a moment for backend to complete, then redirect
        console.log('Waiting for backend to complete onboarding...');
        setTimeout(() => {
          console.log('Redirecting to dashboard');
          router.replace('/dashboard');
        }, 1500);
        
      } else {
        throw new Error("Failed to create organization");
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
      toast.error("Failed to create organization. Please try again.");
      setCompletingOnboarding(false);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <PageHeader
          title="Welcome to EdCoach AI"
          description="Let's set up your coaching platform in just a few steps"
          gradient={true}
        />

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
            <div className={`flex items-center space-x-2 ${step === 'organization' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'organization' ? 'bg-primary text-white' : step === 'complete' ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                {step === 'complete' ? <CheckCircle className="h-4 w-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">Organization</span>
            </div>
          </div>

          {/* Step Content */}
          {step === 'role-detection' && (
            <Card className="mx-auto max-w-2xl">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Users className="h-6 w-6" />
                  You&#39;re Set Up as a Coach
                </CardTitle>
                <CardDescription>
                  We&#39;ve detected that you&#39;re signing up as an instructional coach. You&#39;ll be able to:
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
                  onClick={() => setStep('organization')} 
                  className="w-full"
                  size="lg"
                >
                  Continue Setup
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'organization' && (
            <Card className="mx-auto max-w-2xl">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Building className="h-6 w-6" />
                  Create Your Organization
                </CardTitle>
                <CardDescription>
                  Set up your coaching organization to manage your teacher team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="text-lg font-medium">
                    Your organization will be named: 
                    <span className="text-primary font-semibold block mt-1">
                      {user.firstName || user.fullName || 'Coach'}&#39;s Team
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    This will be your coaching workspace where you can invite teachers, 
                    conduct walkthroughs, and manage feedback.
                  </p>
                </div>
                <Button 
                  onClick={handleCreateOrganization}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Organization...
                    </>
                  ) : (
                    <>
                      <Building className="h-4 w-4 mr-2" />
                      Create Organization
                    </>
                  )}
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
                    ? "You&#39;re all set up as a teacher. Your coach can now conduct walkthroughs and provide feedback."
                    : "Your coaching organization is ready. You can now invite teachers and start conducting walkthroughs."
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
                          <span>Organization created</span>
                        </div>
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