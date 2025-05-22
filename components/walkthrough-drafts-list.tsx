"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export function WalkthroughDraftsList() {
  const drafts = useQuery(api.walkthroughs.listDraftWalkthroughs, {}) ?? [];
  const router = useRouter();

  if (drafts.length === 0) {
    return <div>No drafts found.</div>;
  }

  return (
    <div className="space-y-4">
      {drafts.map((draft) => (
        <Card key={draft._id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <span>
                Teacher: {draft.teacherId} | Date: {new Date(draft.walkthroughDate).toLocaleDateString()}
              </span>
              <Button
                onClick={() => router.push(`/walkthrough/${draft._id}`)}
                variant="secondary"
              >
                Resume
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <strong>Evidence:</strong> {draft.evidenceSummary}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}