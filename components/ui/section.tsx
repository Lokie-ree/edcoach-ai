import React, { forwardRef, ElementType } from "react";
import { cn } from "@/lib/utils";

export type SectionVariant = "default" | "full-bleed" | "offset";
export type SectionSpacing = "default" | "compact" | "spacious" | "hero" | "landing";
export type SectionBackground = "none" | "subtle" | "gradient" | "dark";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?: SectionVariant;
  spacing?: SectionSpacing;
  background?: SectionBackground;
  as?: ElementType;
}

export const Section = forwardRef<HTMLElement, SectionProps>(({
  children,
  variant = "default",
  spacing = "default",
  background = "none",
  as: Component = "section",
  className,
  ...props
}, ref) => {
  // Width classes based on variant
  const widthClasses = {
    default: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8",
    "full-bleed": "w-full",
    offset: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  };

  // Spacing classes based on spacing
  const spacingClasses = {
    default: "py-12 md:py-16 lg:py-24",
    compact: "py-8 md:py-12",
    spacious: "py-16 md:py-24 lg:py-32",
    hero: "py-16 md:py-20 lg:py-24", // Optimized for hero sections
    landing: "py-12 md:py-16", // Consistent spacing for landing page sections
  };

  // Background classes based on background
  const backgroundClasses = {
    none: "bg-background",
    subtle: "bg-muted/50",
    gradient: "bg-gradient-to-br from-background via-muted/20 to-muted/30",
    dark: "bg-muted",
  };

  return (
    <Component
      ref={ref}
      className={cn(
        // Base styles
        "relative w-full",
        // Background styles
        backgroundClasses[background],
        // Spacing styles
        variant !== "full-bleed" ? spacingClasses[spacing] : "",
        className
      )}
      {...props}
    >
      {variant === "full-bleed" ? (
        <div className={spacingClasses[spacing]}>
          {children}
        </div>
      ) : (
        <div className={widthClasses[variant]}>
          {children}
        </div>
      )}
    </Component>
  );
})

Section.displayName = "Section"; 