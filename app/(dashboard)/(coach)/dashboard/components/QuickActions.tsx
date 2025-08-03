"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, UserPlus, BarChart3, ChevronRight } from "lucide-react";
import Link from "next/link";
import { TeacherInvitationForm } from "@/app/(dashboard)/(coach)/teachers/components/TeacherInvitationForm";
import { Badge } from "@/components/ui/badge";

// Mobile-first quick action card component
function QuickActionCard({
  title,
  icon: Icon,
  href,
  action,
  variant = "default",
  notification,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  variant?: "default" | "primary";
  notification?: number;
}) {
  const cardContent = (
    <Card
      className={`h-20 cursor-pointer transition-all hover:shadow-md active:scale-95 ${
        variant === "primary" ? "bg-primary text-primary-foreground" : ""
      }`}
    >
      <CardContent className="flex items-center justify-between p-4 h-full">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              variant === "primary" ? "bg-primary-foreground/20" : "bg-muted"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <span className="font-medium text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {notification && (
            <Badge variant="secondary" className="text-xs">
              {notification}
            </Badge>
          )}
          <ChevronRight className="h-4 w-4 opacity-60" />
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return <div onClick={action}>{cardContent}</div>;
}

interface QuickActionsProps {
  isMobile: boolean;
}

export function QuickActions({ isMobile }: QuickActionsProps) {
  if (isMobile) {
    return (
      <div className="lg:hidden">
        <QuickActionCard
          title="Start Walkthrough"
          icon={Plus}
          href="/walkthrough/new"
          variant="primary"
        />
        <div className="mt-4">
          <TeacherInvitationForm
            trigger={
              <div className="w-full">
                <QuickActionCard
                  title="Invite Teacher"
                  icon={UserPlus}
                  action={() => {}}
                />
              </div>
            }
          />
        </div>
        <div className="mt-4">
          <QuickActionCard
            title="View Analytics"
            icon={BarChart3}
            href="/analytics"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <Link href="/walkthrough/new" className="flex-1">
        <Button className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Start Walkthrough
        </Button>
      </Link>
      <div className="flex-1">
        <TeacherInvitationForm
          trigger={
            <Button variant="outline" className="w-full" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Teacher
            </Button>
          }
        />
      </div>
      <Link href="/analytics" className="flex-1">
        <Button variant="outline" className="w-full" size="sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          View Analytics
        </Button>
      </Link>
    </div>
  );
}