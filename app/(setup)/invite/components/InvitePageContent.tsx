"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Mail,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useUser, SignInButton } from "@clerk/nextjs";
import { ICONS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export default function InvitePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const [isAccepting, setIsAccepting] = useState(false);

  const token = searchParams.get("token");

  const invitation = useQuery(
    api.invitations.getInvitationByToken,
    token ? { token } : "skip",
  );

  const acceptInvitation = useMutation(api.invitations.acceptInvitation);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid invitation link");
      router.push("/");
    }
  }, [token, router]);

  // If user is not loaded yet, show loader
  if (!userLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className={cn(ICONS.sizes.md, "animate-spin")} />
          Loading...
        </div>
      </div>
    );
  }

  // If user is not signed in, show sign-in prompt with button
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <UserCheck className={cn(ICONS.sizes.xl, "text-blue-500 mx-auto mb-4")} />
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              To accept this teaching invitation from{" "}
              {invitation?.coachName || "your coach"}, you must sign in with the
              email address that received this invitation. This will create your
              account and allow you to join the team.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <Mail className={cn(ICONS.semantic.inline, "inline mr-1")} />
                {invitation?.teacherEmail || "(invited email)"}
              </p>
              {invitation?.coachName && (
                <p className="text-sm font-medium mt-1">
                  Coach: {invitation.coachName}
                </p>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Please sign in with the same email address that received this
              invitation.
            </p>
            <SignInButton mode="modal">
              <Button className="w-full">
                <Mail className={cn(ICONS.semantic.inline, "mr-2")} />
                Sign In to Accept Invitation
              </Button>
            </SignInButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAcceptInvitation = async () => {
    if (!token || !user) return;

    setIsAccepting(true);
    try {
      const result = await acceptInvitation({ token });

      if (result.success) {
        toast.success("Welcome to the team!", {
          description: result.message,
        });
        router.push("/onboarding");
      } else {
        toast.error("Failed to accept invitation", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error("An error occurred", {
        description: "Failed to accept invitation. Please try again.",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  if (invitation === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className={cn(ICONS.sizes.md, "animate-spin")} />
          Loading invitation...
        </div>
      </div>
    );
  }

  if (invitation === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className={cn(ICONS.sizes.xl, "text-red-500 mx-auto mb-4")} />
            <CardTitle>Invitation Not Found</CardTitle>
            <CardDescription>
              This invitation link is invalid or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push("/")} variant="outline">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitation.status === "expired" || invitation.isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Clock className={cn(ICONS.sizes.xl, "text-yellow-500 mx-auto mb-4")} />
            <CardTitle>Invitation Expired</CardTitle>
            <CardDescription>
              This invitation from {invitation.coachName} has expired. Please
              contact them for a new invitation.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <Mail className={cn(ICONS.semantic.inline, "inline mr-1")} />
                {invitation.teacherEmail}
              </p>
            </div>
            <Button onClick={() => router.push("/")} variant="outline">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitation.status === "accepted") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className={cn(ICONS.sizes.xl, "text-green-500 mx-auto mb-4")} />
            <CardTitle>Already Accepted</CardTitle>
            <CardDescription>
              This invitation has already been accepted. You can access your
              dashboard to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <UserCheck className={cn(ICONS.sizes.xl, "text-blue-500 mx-auto mb-4")} />
          <CardTitle>Teacher Invitation</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join {invitation.coachName}&apos;s
            coaching team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Coach:</span>
                <span className="text-sm">{invitation.coachName}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium">Your Email:</span>
                <span className="text-sm">{invitation.teacherEmail}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant="outline">
                  <Clock className={cn(ICONS.sizes.xs, "mr-1")} />
                  Pending
                </Badge>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                What happens next?
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>
                  • You&apos;ll join {invitation.coachName}&apos;s coaching team
                </li>
                <li>• Complete your teacher profile setup</li>
                <li>• Start creating classroom observation walkthroughs</li>
                <li>• Receive AI-powered feedback on your teaching</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleAcceptInvitation}
              disabled={isAccepting}
              className="w-full"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle className={cn(ICONS.semantic.inline, "mr-2")} />
                  Accept Invitation
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              disabled={isAccepting}
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
