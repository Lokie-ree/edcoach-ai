import { forwardRef, ElementType } from "react";
import { cn } from "@/lib/utils";
import { SPACING, RESPONSIVE_PATTERNS } from "@/lib/design-tokens";

// Standardized container sizes
export const CONTAINER_SIZES = {
  sm: "max-w-3xl",     // Forms, narrow content
  md: "max-w-5xl",     // Standard page content  
  lg: "max-w-6xl",     // Dashboard layouts
  xl: "max-w-7xl",     // Analytics, wide tables
  full: "max-w-[1400px]", // Maximum application width
} as const;

// Standardized spacing scale - using design tokens
export const SPACING_SCALE = {
  none: "",
  xs: SPACING.component.xs,
  sm: SPACING.component.sm,
  md: SPACING.component.md, 
  lg: SPACING.component.lg,
  xl: SPACING.component.xl,
  "2xl": SPACING.component["2xl"]
} as const;

// Responsive padding for consistent mobile-first approach - using design tokens
export const RESPONSIVE_PADDING = {
  compact: RESPONSIVE_PATTERNS.padding.compact,
  normal: RESPONSIVE_PATTERNS.padding.container,
  spacious: RESPONSIVE_PATTERNS.padding.page
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

/** Full-width application container (replaces MaxWidthWrapper) */
const AppContainer = forwardRef<HTMLElement, Omit<ContainerProps, 'size' | 'padding'>>((props, ref) => (
  <Container ref={ref} size="full" padding="compact" {...props} />
));
AppContainer.displayName = "Container.App";

/** Standard page content container */
const PageContainer = forwardRef<HTMLElement, Omit<ContainerProps, 'size' | 'padding'>>((props, ref) => (
  <Container ref={ref} size="lg" padding="normal" {...props} />
));
PageContainer.displayName = "Container.Page";

/** Narrow form container */
const FormContainer = forwardRef<HTMLElement, Omit<ContainerProps, 'size' | 'spacing'>>((props, ref) => (
  <Container ref={ref} size="sm" spacing="md" {...props} />
));
FormContainer.displayName = "Container.Form";

/** Wide dashboard container */
const DashboardContainer = forwardRef<HTMLElement, Omit<ContainerProps, 'size'>>((props, ref) => (
  <Container ref={ref} size="xl" {...props} />
));
DashboardContainer.displayName = "Container.Dashboard";

export const ContainerVariants = {
  App: AppContainer,
  Page: PageContainer,
  Form: FormContainer,
  Dashboard: DashboardContainer,
} as const;