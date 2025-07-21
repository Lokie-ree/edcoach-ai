import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { ReactNode } from "react";

interface InsightCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function InsightCard({ title, icon, children, footer, className }: InsightCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center gap-2 border-b border-border pb-2">
        {icon && <span className="text-xl">{icon}</span>}
        <CardTitle className="text-lg font-semibold text-foreground flex-1">{title}</CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="border-t border-border pt-2">{footer}</CardFooter>
      )}
    </Card>
  );
} 