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
import { Users, ChartSpline, ClipboardPlus, Settings } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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
                <Link href="/walkthrough/new">
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-center p-4 space-y-2 w-full"
                  >
                    <ClipboardPlus className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium">New Walkthrough</span>
                  </Button>
                </Link>

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