"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugUserPage() {
  const { user, isLoaded } = useUser();
  const convexUser = useQuery(api.users.current, user && isLoaded ? {} : "skip");
  const createOrSyncUser = useMutation(api.users.createOrSyncFromClerk);

  const handleCreateUser = async () => {
    try {
      const result = await createOrSyncUser({});
      console.log("Create user result:", result);
      alert(`${result.message} - Success: ${result.success}`);
    } catch (error) {
      console.error("Error creating user:", error);
      alert(`Error: ${error}`);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Debug User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Clerk User:</h3>
            <pre className="bg-muted p-2 rounded text-xs overflow-auto">
              {JSON.stringify(user ? {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                emailAddresses: user.emailAddresses.map(e => e.emailAddress),
                imageUrl: user.imageUrl
              } : null, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold">Convex User:</h3>
            <pre className="bg-muted p-2 rounded text-xs overflow-auto">
              {JSON.stringify(convexUser, null, 2)}
            </pre>
          </div>

          <Button onClick={handleCreateUser} className="w-full">
            Create/Sync User in Convex
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 