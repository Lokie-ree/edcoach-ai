"use client";

import { WalkthroughForm } from "@/components/forms/WalkthroughForm";
import { PageHeader } from "@/components/common/PageHeader";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";


export default function NewObservationPage() {
  const { user } = useUser();
      const convexUser = useQuery(
      api.users.current,
      user ? {} : "skip"
    );
  const coachId = convexUser?._id as Id<'users'> | undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="New Walkthrough"
        description="Create a new classroom observation and provide feedback to support teacher growth"
        gradient={true}
      />

      {/* Content */}
      <div className="container max-w-4xl relative">
        {coachId && <WalkthroughForm coachId={coachId} />}
      </div>
    </div>
  );
} 