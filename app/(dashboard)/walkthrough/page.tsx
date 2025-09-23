"use client";

// Force dynamic rendering to avoid prerendering issues with Clerk hooks
export const dynamic = 'force-dynamic';

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getIndicatorName } from "@/lib/IndicatorUtils";
import WalkthroughList from "@/components/dashboard/WalkthroughList";
import { Id } from "@/convex/_generated/dataModel";

export default function WalkthroughsPage() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const teacherId = searchParams.get("teacherId") as Id<"teachers"> | null;

  // Use the getMyWalkthroughs query which handles both coach and teacher cases
  const walkthroughData = useQuery(api.walkthroughs.getMyWalkthroughs, {
    searchTerm: undefined,
    statusFilter: undefined,
    teacherId: teacherId || undefined,
  });

  if (!isLoaded || !user || !walkthroughData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { walkthroughs, isCoach } = walkthroughData;

  return (
    <div className="py-3 md:py-4 space-y-4">
      <PageHeader
        title={teacherId ? "Teacher Walkthroughs" : "Walkthroughs"}
        description={
          teacherId
            ? "View classroom observations for this specific teacher"
            : isCoach
            ? "Manage and review classroom observations for your teachers"
            : "View your classroom observations and feedback"
        }
        gradient={true}
        rightContent={
          isCoach && (
            <Link href={teacherId ? `/walkthrough/new?teacherId=${teacherId}` : "/walkthrough/new"}>
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                New Walkthrough
              </Button>
            </Link>
          )
        }
      />
      {/* Walkthroughs List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {teacherId ? "Teacher Walkthroughs" : isCoach ? "All Walkthroughs" : "My Walkthroughs"}
          </h2>
          <div className="text-sm text-muted-foreground">
            {walkthroughs.length} walkthrough
            {walkthroughs.length !== 1 ? "s" : ""}
          </div>
        </div>
        <WalkthroughList
          walkthroughs={walkthroughs}
          isCoach={isCoach}
          getIndicatorName={getIndicatorName}
        />
      </div>
    </div>
  );
}
