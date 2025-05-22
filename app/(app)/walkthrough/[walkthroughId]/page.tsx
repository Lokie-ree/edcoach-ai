"use client";

import { WalkthroughForm } from "@/components/walkthrough-form";
import { Id } from "@/convex/_generated/dataModel";
import React from "react";

export default function EditWalkthroughPage({ params }: { params: Promise<{ walkthroughId: string }> }) {
  const { walkthroughId } = React.use(params);
  return (
    <div className="relative">
      {/* Background gradient effect */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-background to-card/30" />
      </div>
      <div className="container max-w-4xl py-8 relative">
        <h1 className="text-2xl font-bold mb-4">Edit Walkthrough Draft</h1>
        <WalkthroughForm walkthroughId={walkthroughId as Id<"walkthroughs">} />
      </div>
    </div>
  );
}
