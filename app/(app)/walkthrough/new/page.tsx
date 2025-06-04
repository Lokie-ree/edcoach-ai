"use client";

import { WalkthroughForm } from "@/components/walkthrough-form";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";


export default function NewObservationPage() {
  const { user } = useUser();
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );
  const coachId = convexUser?._id as Id<'users'> | undefined;

  return (
    <div className="relative">
      {/* Background gradient effect */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-background to-card/30" />
      </div>

      {/* Content */}
      <div className="container max-w-4xl py-8 relative">
        {coachId && <WalkthroughForm coachId={coachId} />}
      </div>
    </div>
  );
} 