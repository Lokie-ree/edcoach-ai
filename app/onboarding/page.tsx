"use client";

import { useEffect, useState } from "react";
import { useUser, useOrganization, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, CreditCard, Building, ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { toast } from "sonner";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const { organization } = useOrganization();
  const { setActive } = useClerk();
  const router = useRouter();

  
  const [step, setStep] = useState<'role-detection' | 'subscription' | 'organization' | 'complete'>('role-detection');
  const [loading, setLoading] = useState(false);
  const [createdOrganizationId, setCreatedOrganizationId] = useState<string | null>(null);

  // Get current user data
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user && isLoaded ? { clerkId: user.id } : "skip"
  );

  const completeOnboarding = useMutation(api.users.completeSimplifiedOnboarding);
  const createOrganization = useAction(api.users.createCoachOrganization);
  const activateTrialSubscription = useMutation(api.users.activateTrialSubscription);

  // Redirect if already onboarded
  useEffect(() => {
    if (convexUser?.onboardingComplete) {
      router.push('/dashboard');
    }
  }, [convexUser, router]);

  // Determine initial step based on user state
  useEffect(() => {
    if (!convexUser || !isLoaded) return;

    // If user has pending teacher record, redirect to teacher flow
    if (convexUser.role === 'teacher') {
      router.push('/dashboard');
      return;
    }

    // Coach flow - check subscription and organization status
    if (convexUser.role === 'coach') {
      if (!convexUser.subscriptionPlan || convexUser.subscriptionPlan === 'free') {
        setStep('subscription');
      } else if (!convexUser.clerkOrganizationId && !organization) {
        setStep('organization');
      } else {
        setStep('complete');
      }
    }
  }, [convexUser, organization, router, isLoaded]);

  const handleSubscriptionComplete = async () => {
    // This would typically be handled by Clerk Billing webhooks
    // For now, we'll simulate the subscription completion by updating the user's subscription plan
    setLoading(true);
    try {
      // In a real implementation, this would redirect to Clerk Billing checkout
      // For now, we'll simulate by marking the user as having a pro subscription
      await activateTrialSubscription();
      setStep('organization');
      toast.success("Free trial started! You can now create your organization.");
    } catch (error) {
      console.error('Failed to process subscription:', error);
      toast.error("Failed to start trial. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const orgName = `${user.firstName || user.fullName || 'Coach'}'s Team`;
      console.log('Creating organization with name:', orgName);
      
      const result = await createOrganization({
        organizationName: orgName
      });
      
      console.log('Organization creation result:', result);
      
      if (result.success && result.organizationId) {
        setCreatedOrganizationId(result.organizationId);
        console.log('Stored organization ID:', result.organizationId);
        
        // Set the newly created organization as active in Clerk
        try {
          // Add a small delay to ensure the organization is fully created
          await new Promise(resolve => setTimeout(resolve, 500));
          await setActive({ organization: result.organizationId });
          console.log('Set active organization:', result.organizationId);
        } catch (setActiveError) {
          console.warn('Failed to set active organization, but continuing:', setActiveError);
        }
        
        toast.success("Your coaching organization has been set up successfully.");
        setStep('complete');
      } else {
        throw new Error(result.error || "Failed to create organization");
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
      toast.error("Failed to create organization. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      const orgId = createdOrganizationId || organization?.id;
      console.log('Completing onboarding with organization ID:', orgId);
      console.log('Current organization context:', organization);
      console.log('Created organization ID:', createdOrganizationId);
      
      const result = await completeOnboarding({
        clerkOrganizationId: orgId
      });
      
      console.log('Onboarding completion result:', result);
      
      if (result.success) {
        toast.success("Welcome to EdCoach AI! Your account has been set up successfully.");
        
        // If we have a created organization ID but no current organization context,
        // try to set it as active before redirecting
        if (createdOrganizationId && !organization) {
          console.log('Attempting to set active organization before redirect...');
          try {
            await setActive({ organization: createdOrganizationId });
            console.log('Successfully set active organization');
            // Wait a bit longer for the context to update
            await new Promise(resolve => setTimeout(resolve, 1500));
          } catch (setActiveError) {
            console.warn('Failed to set active organization:', setActiveError);
          }
        }
        
        // Add a small delay to allow the user data to propagate
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        throw new Error("Failed to complete onboarding");
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      toast.error("Failed to complete setup. Please try again.");
    } finally {
      setLoading(false);
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
            <div className={`flex items-center space-x-2 ${step === 'subscription' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'subscription' ? 'bg-primary text-white' : step === 'organization' || step === 'complete' ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                {step === 'organization' || step === 'complete' ? <CheckCircle className="h-4 w-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">Subscription</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className={`flex items-center space-x-2 ${step === 'organization' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'organization' ? 'bg-primary text-white' : step === 'complete' ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                {step === 'complete' ? <CheckCircle className="h-4 w-4" /> : '3'}
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
                  You're Set Up as a Coach
                </CardTitle>
                <CardDescription>
                  We've detected that you're signing up as an instructional coach. You'll be able to:
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
                <Button 
                  onClick={() => setStep('subscription')} 
                  className="w-full"
                  size="lg"
                >
                  Continue Setup
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'subscription' && (
            <Card className="mx-auto max-w-2xl">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <CreditCard className="h-6 w-6" />
                  Choose Your Plan
                </CardTitle>
                <CardDescription>
                  Select a subscription plan to activate your coach features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">Coach Plan</h3>
                      <p className="text-muted-foreground">Everything you need to support your teachers</p>
                    </div>
                    <Badge variant="secondary">Recommended</Badge>
                  </div>
                  <div className="text-3xl font-bold">$29<span className="text-base font-normal text-muted-foreground">/month</span></div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Unlimited teacher accounts
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      AI-powered feedback generation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Advanced analytics dashboard
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Priority support
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <Button 
                    onClick={handleSubscriptionComplete}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Starting Trial...
                      </>
                    ) : (
                      'Start 14-Day Free Trial'
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    No credit card required for trial. Cancel anytime.
                  </p>
                </div>
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
                      {user.firstName || user.fullName || 'Coach'}'s Team
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
                  Setup Complete!
                </CardTitle>
                <CardDescription>
                  Your coaching platform is ready to use
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="text-lg">
                    Welcome to <span className="font-semibold text-primary">EdCoach AI</span>! 
                    Your account is now fully set up.
                  </div>
                  <div className="grid gap-3 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Coach account activated</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Organization created</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Free trial started</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleCompleteOnboarding}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Finalizing Setup...
                    </>
                  ) : (
                    <>
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 