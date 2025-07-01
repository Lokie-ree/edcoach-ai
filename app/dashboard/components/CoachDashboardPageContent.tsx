"use client";

import React, { useState, useEffect } from "react";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConvexUser, ClerkUser } from "../types";
import TeacherStatusOverview from "./TeacherStatusOverview";
import RecentFeedbackHighlights from "./RecentFeedbackHighlights";
import CoachDashboardHeaderStats from "./CoachDashboardHeaderStats";
import { AIUsageBadge, AIUsageWarning } from "@/components/ui/ai-usage-badge";
import CoachTutorial from "@/components/onboarding/coach-tutorial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ChartSpline, ClipboardPlus, Settings, Lock, Crown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FeatureProtect } from "@/components/ui/feature-protect";
import { usePlanDetection } from "@/lib/usePlanDetection";

interface CoachDashboardPageContentProps {
  user: ClerkUser;
  convexUser: ConvexUser;
  clerkOrganizationId: string;
}

export default function CoachDashboardPageContent({ 
  user, 
  convexUser,
  clerkOrganizationId
}: CoachDashboardPageContentProps) {
  const [showTutorial, setShowTutorial] = useState(false);

  // Get AI usage - we'll let the server-side middleware handle plan detection
  const aiUsage = useQuery(api.plans.getAIUsageThisMonth, { hasProPlan: true }); // Server will determine actual plan
  
  // Get AI usage for starter users to check if warning should be shown
  const starterAiUsage = useQuery(api.plans.getAIUsageThisMonth, { hasProPlan: false });

  // Show tutorial for new coaches (created within last 5 minutes and first time on dashboard)
  useEffect(() => {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    const isNewUser = convexUser.createdAt > fiveMinutesAgo;
    
    // Check if tutorial was already shown
    const tutorialShown = localStorage.getItem(`coach-tutorial-shown-${convexUser._id}`);
    
    if (isNewUser && !tutorialShown) {
      setShowTutorial(true);
    }
  }, [convexUser]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem(`coach-tutorial-shown-${convexUser._id}`, 'true');
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    localStorage.setItem(`coach-tutorial-shown-${convexUser._id}`, 'true');
  };

  // Use personal plan detection instead of organization-level checks
  const planDetection = usePlanDetection();
  const hasProPlan = planDetection.isProPlan;

  // Check if user can create new walkthroughs based on their actual plan
  const currentAiUsage = hasProPlan ? aiUsage : starterAiUsage;
  const canCreateWalkthrough = !currentAiUsage?.isOverLimit;
  
  // Check if AI usage warning should be shown (same logic as StarterUsageWarning)
  const shouldShowAIWarning = starterAiUsage && 
    (starterAiUsage.walkthroughsRemaining <= 2 || starterAiUsage.isOverLimit);

  return (
    <>
      <div className="space-y-6 relative">
        {/* Main Header */}
        <PageHeader
          title="Dashboard"
          description={
            <>
              Welcome back, <AnimatedGradientText className="font-semibold">{user?.firstName || user?.fullName || "Coach"}</AnimatedGradientText>! Ready to support your teachers&apos; professional growth?
            </>
          }
          gradient={true}
          rightContent={
            <div className="flex items-center gap-4">
              <AIUsageBadge showDetails />
              <CoachDashboardHeaderStats organizationId={clerkOrganizationId} />
            </div>
          }
        />

        {/* AI Usage Warning */}
        <AIUsageWarning />

        {/* Upgrade Prompt for Non-Pro Users - Only show when AI warning is NOT displayed */}
        {!shouldShowAIWarning && (
          <FeatureProtect 
            plan="coach_pro"
            fallback={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Crown className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                        Unlock Your Full Coaching Potential
                      </h3>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Upgrade to Coach Pro for 100 walkthroughs/month, 25 teachers, and advanced analytics
                      </p>
                    </div>
                  </div>
                  <Link href="/billing">
                    <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
                      Upgrade to Pro
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
            }
          >
            {/* Pro users see nothing here - no upgrade prompt */}
            <div />
          </FeatureProtect>
        )}

        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Navigation</CardTitle>
              <p className="text-sm text-muted-foreground">
                Access key coaching features and management tools
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Teachers */}
                <Link href="/teachers">
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-center p-4 space-y-2 w-full"
                  >
                    <Users className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium">Teachers</span>
                  </Button>
                </Link>

                {/* New Walkthrough */}
                {canCreateWalkthrough ? (
                  <Link href="/walkthrough/new">
                    <Button
                      variant="outline"
                      className="h-auto flex-col items-center p-4 space-y-2 w-full"
                    >
                      <ClipboardPlus className="h-6 w-6 text-primary" />
                      <span className="text-sm font-medium">New Walkthrough</span>
                    </Button>
                  </Link>
                ) : (
                  <Link href="/billing">
                  <Button
                    variant="outline"
                      className="h-auto flex-col items-center p-4 space-y-2 w-full border-orange-300 bg-orange-50 hover:bg-orange-100 dark:border-orange-700 dark:bg-orange-950/20 dark:hover:bg-orange-950/30"
                  >
                      <Lock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Upgrade to Create</span>
                  </Button>
                  </Link>
                )}

                {/* Analytics */}
                <Link href="/analytics">
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-center p-4 space-y-2 w-full"
                  >
                    <ChartSpline className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium">Analytics</span>
                  </Button>
                </Link>

                {/* Organization */}
                <Link href="/org">
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-center p-4 space-y-2 w-full"
                  >
                    <Settings className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium">Organization</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Teacher Status Overview */}
        <TeacherStatusOverview organizationId={clerkOrganizationId} />

        {/* Recent Feedback Highlights */}
        <RecentFeedbackHighlights organizationId={clerkOrganizationId} />
      </div>

      {/* Coach Tutorial Modal */}
      {showTutorial && (
        <CoachTutorial
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}
    </>
  );
} 