"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ANIMATIONS, SPACING, FORM_PATTERNS, RESPONSIVE_PATTERNS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outlined" | "ghost";
}

export function FormSection({
  title,
  description,
  children,
  className,
  variant = "outlined"
}: FormSectionProps) {
  const variants = {
    default: "bg-background",
    outlined: "border border-border bg-card",
    ghost: "bg-muted/50"
  };

  return (
    <Card className={cn(
      "transition-all",
      ANIMATIONS.classes.normal,
      variants[variant],
      className
    )}>
      <CardHeader className={cn("space-y-2", SPACING.component.md)}>
        <CardTitle className={cn("text-lg font-semibold", RESPONSIVE_PATTERNS.text.subheading)}>
          {title}
        </CardTitle>
        {description && (
          <CardDescription className={cn("text-sm", RESPONSIVE_PATTERNS.text.body)}>
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className={cn("space-y-6", SPACING.component.md)}>
        {children}
      </CardContent>
    </Card>
  );
}
