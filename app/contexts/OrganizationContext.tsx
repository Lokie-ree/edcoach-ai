"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";

interface OrganizationContextType {
  currentOrganization: any | null;
  isLoading: boolean;
  isDistrictAdmin: boolean;
  isSchoolLeader: boolean;
  isInstructionalCoach: boolean;
  isTeacher: boolean;
}

const OrganizationContext = createContext<OrganizationContextType>({
  currentOrganization: null,
  isLoading: true,
  isDistrictAdmin: false,
  isSchoolLeader: false,
  isInstructionalCoach: false,
  isTeacher: false,
});

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { isLoaded: orgListLoaded } = useOrganizationList();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(!orgLoaded || !orgListLoaded);
  }, [orgLoaded, orgListLoaded]);

  const isDistrictAdmin = organization?.publicMetadata?.role === "district_admin";
  const isSchoolLeader = organization?.publicMetadata?.role === "school_leader";
  const isInstructionalCoach = organization?.publicMetadata?.role === "instructional_coach";
  const isTeacher = organization?.publicMetadata?.role === "teacher";

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization: organization,
        isLoading,
        isDistrictAdmin,
        isSchoolLeader,
        isInstructionalCoach,
        isTeacher,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export const useOrganizationContext = () => useContext(OrganizationContext); 