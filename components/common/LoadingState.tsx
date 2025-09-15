"use client";

import React from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { SkeletonLoader } from "./SkeletonLoader";
import { ANIMATIONS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  skeleton?: boolean;
  skeletonVariant?: "card" | "list" | "form" | "table" | "text" | "custom";
  spinner?: boolean;
  spinnerText?: string;
  spinnerSize?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LoadingState({
  isLoading,
  children,
  fallback,
  skeleton = true,
  skeletonVariant = "card",
  spinner = false,
  spinnerText,
  spinnerSize = "md",
  className
}: LoadingStateProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (skeleton) {
    return (
      <SkeletonLoader 
        variant={skeletonVariant}
        className={cn("transition-all", ANIMATIONS.classes.normal, className)}
      />
    );
  }

  if (spinner) {
    return (
      <LoadingSpinner 
        size={spinnerSize}
        text={spinnerText}
        className={cn("transition-all", ANIMATIONS.classes.normal, className)}
      />
    );
  }

  return <>{children}</>;
}

// Pre-configured loading state variants
export const LoadingStateVariants = {
  // Card loading with skeleton
  Card: (props: Omit<LoadingStateProps, 'skeleton' | 'skeletonVariant'>) => (
    <LoadingState {...props} skeleton skeletonVariant="card" />
  ),
  
  // List loading with skeleton
  List: (props: Omit<LoadingStateProps, 'skeleton' | 'skeletonVariant'>) => (
    <LoadingState {...props} skeleton skeletonVariant="list" />
  ),
  
  // Form loading with skeleton
  Form: (props: Omit<LoadingStateProps, 'skeleton' | 'skeletonVariant'>) => (
    <LoadingState {...props} skeleton skeletonVariant="form" />
  ),
  
  // Table loading with skeleton
  Table: (props: Omit<LoadingStateProps, 'skeleton' | 'skeletonVariant'>) => (
    <LoadingState {...props} skeleton skeletonVariant="table" />
  ),
  
  // Spinner loading
  Spinner: (props: Omit<LoadingStateProps, 'spinner'>) => (
    <LoadingState {...props} spinner />
  ),
  
  // Inline spinner loading
  InlineSpinner: (props: Omit<LoadingStateProps, 'spinner' | 'spinnerSize'>) => (
    <LoadingState {...props} spinner spinnerSize="sm" />
  )
} as const;
