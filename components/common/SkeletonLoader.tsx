"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ANIMATIONS, SPACING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  variant?: "card" | "list" | "form" | "table" | "text" | "custom";
  lines?: number;
  className?: string;
  children?: React.ReactNode;
}

export function SkeletonLoader({ 
  variant = "card", 
  lines = 3,
  className,
  children
}: SkeletonLoaderProps) {
  const variants = {
    card: (
      <div className={cn("space-y-4 p-6", className)}>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    ),
    
    list: (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </div>
    ),
    
    form: (
      <div className={cn("space-y-6", className)}>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    ),
    
    table: (
      <div className={cn("space-y-3", className)}>
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    ),
    
    text: (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn(
              "h-4",
              i === 0 ? "w-3/4" : i === lines - 1 ? "w-1/2" : "w-full"
            )} 
          />
        ))}
      </div>
    ),
    
    custom: children
  };

  return (
    <div className={cn(
      "animate-pulse",
      ANIMATIONS.classes.normal
    )}>
      {variants[variant]}
    </div>
  );
}

// Pre-configured skeleton variants for common use cases
export const SkeletonLoaderVariants = {
  // Card skeleton
  Card: (props: Omit<SkeletonLoaderProps, 'variant'>) => (
    <SkeletonLoader {...props} variant="card" />
  ),
  
  // List skeleton
  List: (props: Omit<SkeletonLoaderProps, 'variant'>) => (
    <SkeletonLoader {...props} variant="list" />
  ),
  
  // Form skeleton
  Form: (props: Omit<SkeletonLoaderProps, 'variant'>) => (
    <SkeletonLoader {...props} variant="form" />
  ),
  
  // Table skeleton
  Table: (props: Omit<SkeletonLoaderProps, 'variant'>) => (
    <SkeletonLoader {...props} variant="table" />
  ),
  
  // Text skeleton
  Text: (props: Omit<SkeletonLoaderProps, 'variant'>) => (
    <SkeletonLoader {...props} variant="text" />
  )
} as const;
