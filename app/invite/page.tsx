import { Suspense } from "react";
import InvitePageContent from "./InvitePageContent";

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <InvitePageContent />
    </Suspense>
  );
} 