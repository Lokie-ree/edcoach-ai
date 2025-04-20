import DashboardLayout from "../dashboard/layout";

export default function ManagePlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
} 