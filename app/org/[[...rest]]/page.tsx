// This file should be moved to app/org/[[...rest]]/page.tsx for Clerk catch-all routing support.
"use client";
import { OrganizationProfile, useOrganization, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function OrganizationPage() {
  const { organization } = useOrganization();
  const { setActive } = useClerk();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isSettingActive, setIsSettingActive] = useState(false);

  // Get user's Convex record to check for organization ID
      const convexUser = useQuery(
      api.users.current,
      user && isLoaded ? {} : "skip"
    );

  // Try to set active organization if user has one but it's not active
  useEffect(() => {
    const trySetActiveOrg = async () => {
      if (
        convexUser?.clerkOrganizationId && 
        !organization && 
        !isSettingActive &&
        setActive
      ) {
        console.log('User has organization ID but no active org, attempting to set active:', convexUser.clerkOrganizationId);
        setIsSettingActive(true);
        try {
          await setActive({ organization: convexUser.clerkOrganizationId });
          console.log('Successfully set active organization from Convex record');
        } catch (error) {
          console.warn('Failed to set active organization:', error);
        } finally {
          setIsSettingActive(false);
        }
      }
    };

    trySetActiveOrg();
  }, [convexUser, organization, setActive, isSettingActive]);

  if (!isLoaded || !user || convexUser === undefined || isSettingActive) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Organization Management"
          description="Manage your organization members, settings, and billing"
          gradient={true}
        />
        <div className="flex justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading organization...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Management"
        description="Manage your organization members, settings, and billing"
        gradient={true}
      />
      
      <div className="flex justify-center">
        {organization ? (
          <OrganizationProfile
            routing="path"
            path="/org" 
          />
        ) : (
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">No Organization Found</h3>
              <p className="text-muted-foreground mb-4">
                You need to complete your onboarding to access organization management.
              </p>
              <Button 
                onClick={() => router.push('/onboarding')} 
                className="w-full"
              >
                Complete Setup
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 