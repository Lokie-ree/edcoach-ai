import DashboardLayout from "../dashboard/layout";

export default function TeachersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
} 