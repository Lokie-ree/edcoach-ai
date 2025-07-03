"use client";

import React, { useState, useEffect } from "react";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConvexUser, ClerkUser } from "../types";
import TeacherStatusOverview from "./TeacherStatusOverview";
import RecentFeedbackHighlights from "./RecentFeedbackHighlights";
import CoachDashboardHeaderStats from "./CoachDashboardHeaderStats";
import { AIUsageWarning } from "@/components/ui/ai-usage-badge";
import CoachTutorial from "@/components/onboarding/coach-tutorial";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FeatureProtect } from "@/components/ui/feature-protect";
import { usePlanDetection } from "@/lib/usePlanDetection";


interface CoachDashboardPageContentProps {
  user: ClerkUser;
  convexUser: ConvexUser;
}

export default function CoachDashboardPageContent({ 
  user, 
  convexUser,
}: CoachDashboardPageContentProps) {
  const [showTutorial, setShowTutorial] = useState(false);

  // Use personal plan detection instead of organization-level checks
  const planDetection = usePlanDetection();
  const hasProPlan = planDetection.isProPlan;
  // Get AI usage for the correct plan
  const aiUsage = useQuery(api.plans.getAIUsageThisMonth, { hasProPlan });
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
            <CoachDashboardHeaderStats aiUsage={aiUsage} hasProPlan={hasProPlan} />
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

        {/* Dashboard Stats and Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teacher Status Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <TeacherStatusOverview />
          </motion.div>

          {/* Recent Feedback Highlights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <RecentFeedbackHighlights />
          </motion.div>
        </div>
      </div>

      {/* Coach Tutorial */}
      {showTutorial && (
        <CoachTutorial
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}
    </>
  );
} 