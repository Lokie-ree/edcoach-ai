import { toast } from "@/components/ui/toast";

// Define error categories
export enum ErrorCategory {
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  NOT_FOUND = "not_found",
  RATE_LIMIT = "rate_limit",
  SERVER = "server",
  UNKNOWN = "unknown",
}

// Error mapping for user-friendly messages
const errorMessages: Record<ErrorCategory, string> = {
  [ErrorCategory.VALIDATION]: "Please check your inputs and try again.",
  [ErrorCategory.AUTHENTICATION]: "You need to be signed in to perform this action.",
  [ErrorCategory.AUTHORIZATION]: "You don't have permission to perform this action.",
  [ErrorCategory.NOT_FOUND]: "The requested resource could not be found.",
  [ErrorCategory.RATE_LIMIT]: "Too many requests. Please try again later.",
  [ErrorCategory.SERVER]: "Something went wrong on our end. Please try again later.",
  [ErrorCategory.UNKNOWN]: "An unexpected error occurred. Please try again.",
};

// Custom error class with category
export class AppError extends Error {
  category: ErrorCategory;
  
  constructor(message: string, category: ErrorCategory = ErrorCategory.UNKNOWN) {
    super(message);
    this.category = category;
    this.name = "AppError";
  }
}

// Function to determine error category from error message
export function categorizeError(error: unknown): ErrorCategory {
  if (error instanceof AppError) {
    return error.category;
  }
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  if (errorMessage.includes("Not authenticated") || errorMessage.includes("sign in")) {
    return ErrorCategory.AUTHENTICATION;
  }
  
  if (errorMessage.includes("permission") || errorMessage.includes("don't have access")) {
    return ErrorCategory.AUTHORIZATION;
  }
  
  if (errorMessage.includes("not found") || errorMessage.includes("does not exist")) {
    return ErrorCategory.NOT_FOUND;
  }
  
  if (errorMessage.includes("rate limit") || errorMessage.includes("too many requests")) {
    return ErrorCategory.RATE_LIMIT;
  }
  
  if (errorMessage.includes("validation") || errorMessage.includes("invalid")) {
    return ErrorCategory.VALIDATION;
  }
  
  return ErrorCategory.UNKNOWN;
}

// Centralized error handling function
export function handleError(error: unknown, customMessage?: string): string {
  // Log the full error for debugging
  console.error("Error occurred:", error);
  
  // Determine error category
  const category = categorizeError(error);
  
  // Get user-friendly message
  const userMessage = customMessage || errorMessages[category];
  
  // Show toast notification
  toast({
    title: "Error",
    description: userMessage,
    variant: "destructive",
  });
  
  return userMessage;
}

// Function to handle form errors in React Hook Form
export function handleFormError(error: unknown): Record<string, { message: string }> {
  console.error("Form error:", error);
  
  // Default to unknown error
  return {
    root: {
      message: "An error occurred while submitting the form. Please try again.",
    },
  };
} 