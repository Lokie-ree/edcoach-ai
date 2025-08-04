"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { ReflectionCard } from "./components/ReflectionCard";
import FeedbackSection from "./components/FeedbackSection";
import { getIndicatorName } from "@/lib/IndicatorUtils";


export default function ViewWalkthroughPage({
  params,
}: {
  params: Promise<{ walkthroughId: string }>;
}) {
  const { walkthroughId } = React.use(params);
  const { user, isLoaded } = useUser();

  // Get all walkthrough view details from backend
  const viewDetails = useQuery(api.walkthroughs.getViewDetails, {
    walkthroughId: walkthroughId as Id<"walkthroughs">,
  });

  if (!isLoaded || (user && viewDetails === undefined)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !viewDetails) {
    return null;
  }

  if (!viewDetails.canView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-4">
          {viewDetails.walkthrough ? "Access Denied" : "Walkthrough Not Found"}
        </h2>
        <p className="text-muted-foreground mb-4">
          {viewDetails.walkthrough
            ? "You don't have permission to view this walkthrough."
            : "The walkthrough you're looking for doesn't exist."}
        </p>
        <Link href="/dashboard">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const { walkthrough, teacher, userRole, indicatorNames } =
    viewDetails;

  return (
    <div className="py-4 md:py-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Classroom Walkthrough"
        description={`Professional development observation for ${teacher?.name || "teacher"}`}
        gradient={true}
        rightContent={undefined}
      />
      {/* Reflection Section */}
      {walkthrough && teacher && (
        <section>
          <h2 className="text-lg font-semibold mb-2 mt-6">Reflection</h2>
          <ReflectionCard
            walkthroughId={walkthrough._id}
            teacherId={walkthrough.teacherId}
            userRole={userRole as "teacher" | "coach"}
          />
        </section>
      )}
      {/* Feedback Section */}
      {walkthrough && (
        <FeedbackSection
          walkthrough={walkthrough}
          indicatorNames={{
            reinforcementIndicatorName: getIndicatorName(indicatorNames.reinforcementIndicator),
            refinementIndicatorName: getIndicatorName(indicatorNames.refinementIndicator)
          }}
        />
      )}

    </div>
  );
}
