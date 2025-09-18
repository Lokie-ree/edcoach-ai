import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Pencil } from "lucide-react";
import { ICONS, STATUS_COLORS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface TeacherStatsCardProps {
  total: number;
  active: number;
  needsDetails: number;
  pending: number;
}

export default function TeacherStatsCard({ total, active, needsDetails, pending }: TeacherStatsCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div>
          <CardTitle className="text-foreground">Teacher Overview</CardTitle>
          <p className="text-sm text-muted-foreground">
            Summary of your teaching staff
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className={cn(ICONS.semantic.header, "text-primary")} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{total}</div>
              <p className="text-sm text-muted-foreground">Total Teachers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", STATUS_COLORS.success.bg)}>
              <GraduationCap className={cn(ICONS.semantic.header, STATUS_COLORS.success.text)} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{active}</div>
              <p className="text-sm text-muted-foreground">Active Teachers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", STATUS_COLORS.warning.bg)}>
              <Pencil className={cn(ICONS.semantic.header, STATUS_COLORS.warning.text)} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{needsDetails + pending}</div>
              <p className="text-sm text-muted-foreground">Need Details</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 