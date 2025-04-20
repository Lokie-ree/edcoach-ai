import { OrganizationList } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Select School - EdCoach AI",
  description: "Select or create your school organization",
};

export default function SelectOrganizationPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Select Your School</h1>
        <p className="text-muted-foreground mb-6">
          Choose an existing school or create a new one to get started with EdCoach AI.
        </p>
        <OrganizationList 
          hidePersonal
          afterSelectOrganizationUrl="/dashboard"
          afterCreateOrganizationUrl="/dashboard"
        />
      </div>
    </div>
  );
} 