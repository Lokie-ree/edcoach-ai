"use client";

import { OrganizationSwitcher, useOrganization, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export default function OrganizationSelectPage() {
  const { organization } = useOrganization();
  const { user } = useUser();
  const upsertOrg = useMutation(api.organizations.storeMetadata);

  useEffect(() => {
    if (organization && user) {
      upsertOrg({
        clerkOrgId: organization.id,
        name: organization.name,
        // Optionally add type/additionalInfo here
      });
    }
  }, [organization, user, upsertOrg]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>Select or Create an Organization</h1>
      <OrganizationSwitcher afterSelectOrganizationUrl="/dashboard" />
    </div>
  );
} 