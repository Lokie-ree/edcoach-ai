"use client";

import { WalkthroughForm } from "@/app/(dashboard)/walkthrough/new/components/WalkthroughForm";
import { PageHeader } from "@/components/common/PageHeader";
import { Id } from "@/convex/_generated/dataModel";
import React from "react";
import MaxWidthWrapper from "@/components/common/MaxWidthWrapper";

export default function EditWalkthroughPage({ params }: { params: Promise<{ walkthroughId: string }> }) {
  const { walkthroughId } = React.use(params);
  return (
    <MaxWidthWrapper className="py-4 md:py-10 space-y-4">
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Edit Walkthrough"
          description="Update and complete your classroom observation walkthrough"
          gradient={true}
        />
        {/* Content */}
        <div className="container max-w-4xl relative">
          <WalkthroughForm walkthroughId={walkthroughId as Id<"walkthroughs">} />
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
