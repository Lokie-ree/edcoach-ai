"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { ANIMATIONS, SPACING, STATUS_COLORS, RESPONSIVE_PATTERNS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "muted" | "success" | "warning" | "error";
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6", 
  lg: "w-8 h-8",
  xl: "w-12 h-12"
};

const variantClasses = {
  default: "text-foreground",
  primary: "text-primary",
  muted: "text-muted-foreground",
  success: STATUS_COLORS.success.text,
  warning: STATUS_COLORS.warning.text,
  error: STATUS_COLORS.error.text
};

export function LoadingSpinner({ 
  size = "md", 
  variant = "default", 
  text,
  className,
  fullScreen = false
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3",
      fullScreen && "min-h-screen",
      className
    )}>
      <Loader2 
        className={cn(
          "animate-spin",
          sizeClasses[size],
          variantClasses[variant],
          ANIMATIONS.classes.normal
        )} 
      />
      {text && (
        <p className={cn(
          "text-sm font-medium",
          variantClasses[variant],
          RESPONSIVE_PATTERNS.text.body
        )}>
          {text}
        </p>
      )}
    </div>
  );

  return spinner;
}

// Pre-configured variants for common use cases
export const LoadingSpinnerVariants = {
  // Small inline spinner
  Inline: (props: Omit<LoadingSpinnerProps, 'size' | 'text'>) => (
    <LoadingSpinner {...props} size="sm" />
  ),
  
  // Medium spinner with text
  WithText: (props: Omit<LoadingSpinnerProps, 'size'>) => (
    <LoadingSpinner {...props} size="md" />
  ),
  
  // Large centered spinner
  Centered: (props: Omit<LoadingSpinnerProps, 'size' | 'fullScreen'>) => (
    <LoadingSpinner {...props} size="lg" fullScreen />
  ),
  
  // Full screen loading
  FullScreen: (props: Omit<LoadingSpinnerProps, 'size' | 'fullScreen'>) => (
    <LoadingSpinner {...props} size="xl" fullScreen />
  )
} as const;
