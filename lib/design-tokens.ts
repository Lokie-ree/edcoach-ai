/**
 * Design Tokens for EdCoachAi
 * 
 * Centralized design system tokens to ensure consistency across components.
 * These tokens follow the mobile-first, accessibility-focused approach outlined
 * in the UI consistency audit.
 */

// ============================================================================
// ANIMATION TOKENS
// ============================================================================

export const ANIMATIONS = {
  durations: {
    fast: "150ms",
    normal: "250ms", 
    slow: "400ms",
    extended: "600ms"
  },
  easings: {
    ease: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  // Tailwind CSS classes for consistent animation usage
  classes: {
    fast: "duration-150",
    normal: "duration-250",
    slow: "duration-400",
    extended: "duration-[600ms]",
    ease: "ease-in-out"
  }
} as const;

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const SPACING = {
  // Touch targets (minimum 44px for accessibility)
  touchTarget: {
    minimum: "44px",
    comfortable: "48px",
    large: "56px"
  },
  
  // Component spacing
  component: {
    xs: "0.5rem",    // 8px
    sm: "0.75rem",   // 12px
    md: "1rem",      // 16px
    lg: "1.5rem",    // 24px
    xl: "2rem",      // 32px
    "2xl": "3rem",   // 48px
    "3xl": "4rem"    // 64px
  },
  
  // Layout spacing
  layout: {
    section: "4rem",      // 64px between major sections
    container: "1.5rem",  // 24px container padding
    card: "1.5rem",       // 24px card internal padding
    form: "1rem"          // 16px form field spacing
  }
} as const;

// ============================================================================
// RESPONSIVE BREAKPOINTS
// ============================================================================

export const BREAKPOINTS = {
  sm: "640px",
  md: "768px", 
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px"
} as const;

// Mobile-first responsive patterns
export const RESPONSIVE_PATTERNS = {
  // Grid patterns for consistent responsive behavior
  grid: {
    // Dashboard metrics: 1 col on mobile, 2 on tablet, 4+ on desktop
    metrics: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5",
    // Teacher cards: 1 col on mobile, 2 on tablet, 3 on desktop
    cards: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
    // Form fields: always single column for accessibility
    form: "grid-cols-1",
    // Analytics: responsive based on content complexity
    analytics: "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
  },
  
  // Padding patterns
  padding: {
    page: "px-4 sm:px-6 lg:px-8",
    container: "px-3 sm:px-4 lg:px-6", 
    card: "p-4 sm:p-6",
    compact: "px-3 py-2 sm:px-4 sm:py-3"
  },
  
  // Text sizing
  text: {
    heading: "text-2xl sm:text-3xl lg:text-4xl",
    subheading: "text-lg sm:text-xl",
    body: "text-sm sm:text-base",
    caption: "text-xs sm:text-sm"
  }
} as const;

// ============================================================================
// ACCESSIBILITY TOKENS
// ============================================================================

export const ACCESSIBILITY = {
  // Focus indicators
  focus: {
    ring: "focus:ring-2 focus:ring-primary/50 focus:outline-none",
    visible: "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
  },
  
  // Color contrast ratios (WCAG 2.1 AA compliant)
  contrast: {
    normal: "4.5:1",  // Normal text
    large: "3:1",     // Large text (18pt+ or 14pt+ bold)
    interactive: "3:1" // Interactive elements
  },
  
  // Screen reader support
  screenReader: {
    hidden: "sr-only",
    focusable: "sr-only focus:not-sr-only"
  }
} as const;

// ============================================================================
// ICON SIZING TOKENS
// ============================================================================

export const ICONS = {
  sizes: {
    xs: "w-3 h-3",     // 12px - tight spaces
    sm: "w-4 h-4",     // 16px - standard inline
    md: "w-5 h-5",     // 20px - buttons, headers
    lg: "w-6 h-6",     // 24px - prominent actions
    xl: "w-8 h-8",     // 32px - page headers
    "2xl": "w-12 h-12" // 48px - empty states
  },
  
  // Semantic sizing for consistency
  semantic: {
    inline: "w-4 h-4",
    button: "w-5 h-5", 
    header: "w-6 h-6",
    hero: "w-12 h-12"
  }
} as const;

// ============================================================================
// STATUS & FEEDBACK TOKENS  
// ============================================================================

export const STATUS_COLORS = {
  // Professional Growth Palette Integration
  success: {
    bg: "bg-green-50 dark:bg-green-950/20",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-200 dark:border-green-800",
    semantic: "Growth and achievement states"
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/20", 
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    semantic: "Attention and encouraging states"
  },
  error: {
    bg: "bg-red-50 dark:bg-red-950/20",
    text: "text-red-700 dark:text-red-300", 
    border: "border-red-200 dark:border-red-800",
    semantic: "Error and destructive actions"
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    semantic: "Professional information and guidance"
  },
  neutral: {
    bg: "bg-gray-50 dark:bg-gray-950/20",
    text: "text-gray-700 dark:text-gray-300",
    border: "border-gray-200 dark:border-gray-800",
    semantic: "Neutral states and disabled elements"
  },
  // EdCoach AI specific brand colors
  coach: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
    semantic: "Coach actions and primary interactions"
  },
  teacher: {
    bg: "bg-secondary/10", 
    text: "text-secondary",
    border: "border-secondary/20",
    semantic: "Teacher growth and progress states"
  }
} as const;

// ============================================================================
// FORM & INPUT TOKENS
// ============================================================================

export const FORM_PATTERNS = {
  // Consistent field spacing
  field: {
    spacing: "space-y-4",
    group: "space-y-6"
  },
  
  // Button layouts
  buttons: {
    // Single action (right-aligned)
    single: "flex justify-end",
    // Primary + secondary (right-aligned, gap)
    dual: "flex justify-end gap-3",
    // Mobile-friendly (full-width on small screens)
    responsive: "flex flex-col sm:flex-row gap-3 sm:justify-end",
    // Centered (for modal actions)
    centered: "flex justify-center gap-3"
  },
  
  // Input states
  validation: {
    error: "border-red-500 focus:border-red-500 focus:ring-red-500/20",
    success: "border-green-500 focus:border-green-500 focus:ring-green-500/20",
    default: "border-input focus:border-primary focus:ring-primary/20"
  }
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get animation class string for consistent timing
 */
export function getAnimationClass(duration: keyof typeof ANIMATIONS.durations = "normal"): string {
  return `transition-all ${ANIMATIONS.classes[duration]} ${ANIMATIONS.classes.ease}`;
}

/**
 * Get responsive grid pattern
 */
export function getGridPattern(type: keyof typeof RESPONSIVE_PATTERNS.grid): string {
  return `grid ${RESPONSIVE_PATTERNS.grid[type]}`;
}

/**
 * Get status color classes
 */
export function getStatusClasses(status: keyof typeof STATUS_COLORS): string {
  const colors = STATUS_COLORS[status];
  return `${colors.bg} ${colors.text} ${colors.border}`;
}

/**
 * Combine multiple design token classes
 */
export function combineTokens(...tokens: string[]): string {
  return tokens.filter(Boolean).join(" ");
}

// ============================================================================
// BRAND IDENTITY TOKENS
// ============================================================================

export const BRAND = {
  // Logo specifications
  logo: {
    // Minimum sizes for different contexts
    sizes: {
      minimum: "24px",      // Favicons, very small spaces
      mobile: "32px",       // Mobile app headers
      tablet: "40px",       // iPad coaching workflows
      desktop: "48px",      // Desktop navigation
      hero: "120px"         // Marketing hero sections
    },
    
    // Logo variations by context
    usage: {
      primary: "edcoach-ai-primary",        // Daily app usage (Variation 2)
      storytelling: "edcoach-ai-storytelling", // Marketing (Variation 1)  
      innovation: "edcoach-ai-innovation",  // Thought leadership (Variation 3)
      monogram: "edcoach-ai-monogram"       // Very constrained spaces
    }
  },
  
  // Typography system
  typography: {
    brand: {
      primary: "Cal Sans",   // Logo text, headings
      secondary: "Inter"     // Body text, taglines
    },
    weights: {
      logo: "600",          // Cal Sans Semibold for "EdCoach"
      tagline: "500",       // Inter Medium for taglines
      body: "400"           // Inter Regular for body
    }
  },
  
  // Professional Growth Palette
  colors: {
    // Primary brand color - Professional trust blue
    primary: {
      hex: "#3b82f6",
      oklch: "oklch(0.60 0.15 240)",
      semantic: "Trust, reliability, coach actions"
    },
    
    // Secondary brand color - Growth green  
    secondary: {
      hex: "#10b981",
      oklch: "oklch(0.68 0.18 130)", 
      semantic: "Growth, progress, teacher success"
    },
    
    // Accent color - Warm amber
    accent: {
      hex: "#f59e0b",
      oklch: "oklch(0.65 0.12 45)",
      semantic: "Approachable, encouraging, supportive"
    },
    
    // Contextual usage
    contexts: {
      coaching: "primary",     // Coach dashboard, walkthrough forms
      growth: "secondary",     // Teacher progress, achievements  
      support: "accent",       // Encouragement, guidance, tips
      system: "info"          // Notifications, information
    }
  }
} as const;

/**
 * Get brand color for specific context
 */
export function getBrandColor(context: keyof typeof BRAND.colors.contexts): string {
  const colorKey = BRAND.colors.contexts[context];
  return `text-${colorKey}`;
}

/**
 * Get logo size class for specific context
 */
export function getLogoSize(context: keyof typeof BRAND.logo.sizes): string {
  return `h-[${BRAND.logo.sizes[context]}]`;
}