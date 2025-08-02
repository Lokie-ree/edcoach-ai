import { forwardRef, ElementType } from "react";
import { cn } from "@/lib/utils";

// Standardized container sizes
export const CONTAINER_SIZES = {
  sm: "max-w-3xl",     // Forms, narrow content
  md: "max-w-5xl",     // Standard page content  
  lg: "max-w-6xl",     // Dashboard layouts
  xl: "max-w-7xl",     // Analytics, wide tables
  full: "max-w-[1400px]", // Maximum application width
} as const;

// Standardized spacing scale
export const SPACING_SCALE = {
  none: "",
  xs: "p-3",
  sm: "p-4",
  md: "p-6", 
  lg: "p-8",
  xl: "p-12",
  "2xl": "p-16"
} as const;

// Responsive padding for consistent mobile-first approach
export const RESPONSIVE_PADDING = {
  compact: "px-3 sm:px-4 lg:px-6",    // Tight spacing for mobile
  normal: "px-4 sm:px-6 lg:px-8",     // Standard responsive padding
  spacious: "px-6 sm:px-8 lg:px-12",  // Extra spacing for hero sections
} as const;

export type ContainerSize = keyof typeof CONTAINER_SIZES;
export type ContainerSpacing = keyof typeof SPACING_SCALE;
export type ContainerPadding = keyof typeof RESPONSIVE_PADDING;

interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Maximum width constraint */
  size?: ContainerSize;
  /** Internal padding */
  spacing?: ContainerSpacing;
  /** Responsive horizontal padding */
  padding?: ContainerPadding;
  /** Center the container */
  center?: boolean;
  /** HTML element to render as */
  as?: ElementType;
  /** Apply full height */
  fullHeight?: boolean;
}

/**
 * Unified Container component that replaces MaxWidthWrapper and Section inconsistencies.
 * 
 * Features:
 * - Standardized sizing system
 * - Mobile-first responsive padding
 * - Accessible by default
 * - TypeScript-first API
 * 
 * @example
 * ```tsx
 * // Replace MaxWidthWrapper usage
 * <Container size="full" padding="compact">
 *   <DashboardContent />
 * </Container>
 * 
 * // Replace Section component for standard layouts
 * <Container size="lg" padding="normal" spacing="md">
 *   <PageContent />
 * </Container>
 * ```
 */
export const Container = forwardRef<HTMLElement, ContainerProps>(
  ({
    children,
    size = "lg",
    spacing = "none",
    padding = "normal",
    center = true,
    as: Component = "div",
    fullHeight = false,
    className,
    ...props
  }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          // Base styles
          "w-full",
          // Size constraints
          CONTAINER_SIZES[size],
          // Centering
          center && "mx-auto",
          // Responsive padding
          RESPONSIVE_PADDING[padding],
          // Internal spacing
          spacing !== "none" && SPACING_SCALE[spacing],
          // Full height option
          fullHeight && "min-h-screen",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Container.displayName = "Container";

/**
 * Pre-configured container variants for common use cases
 */
export const ContainerVariants = {
  /** Full-width application container (replaces MaxWidthWrapper) */
  App: forwardRef<HTMLElement, Omit<ContainerProps, 'size' | 'padding'>>((props, ref) => (
    <Container ref={ref} size="full" padding="compact" {...props} />
  )),
  
  /** Standard page content container */
  Page: forwardRef<HTMLElement, Omit<ContainerProps, 'size' | 'padding'>>((props, ref) => (
    <Container ref={ref} size="lg" padding="normal" {...props} />
  )),
  
  /** Narrow form container */
  Form: forwardRef<HTMLElement, Omit<ContainerProps, 'size' | 'spacing'>>((props, ref) => (
    <Container ref={ref} size="sm" spacing="md" {...props} />
  )),
  
  /** Wide dashboard container */
  Dashboard: forwardRef<HTMLElement, Omit<ContainerProps, 'size'>>((props, ref) => (
    <Container ref={ref} size="xl" {...props} />
  )),
} as const;

// Add display names for dev tools
ContainerVariants.App.displayName = "Container.App";
ContainerVariants.Page.displayName = "Container.Page"; 
ContainerVariants.Form.displayName = "Container.Form";
ContainerVariants.Dashboard.displayName = "Container.Dashboard";