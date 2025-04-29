import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes a string input to prevent XSS attacks
 * @param input - The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string | null | undefined): string {
  if (input === null || input === undefined) {
    return '';
  }
  
  return DOMPurify.sanitize(input, {
    USE_PROFILES: { html: false }, // Disallow HTML
    ALLOWED_TAGS: [], // No tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
  });
}

/**
 * Sanitizes all string values in an object (deep)
 * @param obj - The object with values to sanitize
 * @returns A new object with sanitized values
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj) as unknown as T;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }

  const result = {} as T;
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      (result as Record<string, unknown>)[key] = sanitizeString(value);
    } else if (value !== null && typeof value === 'object') {
      (result as Record<string, unknown>)[key] = sanitizeObject(value);
    } else {
      (result as Record<string, unknown>)[key] = value;
    }
  }

  return result;
}

/**
 * Custom sanitizer for markdown content that preserves safe markdown syntax
 * but removes potentially dangerous HTML/scripts
 * @param markdown - The markdown string to sanitize
 * @returns Sanitized markdown string
 */
export function sanitizeMarkdown(markdown: string | null | undefined): string {
  if (markdown === null || markdown === undefined) {
    return '';
  }
  
  return DOMPurify.sanitize(markdown, {
    ALLOWED_TAGS: [], // No HTML tags allowed, only text
    ALLOWED_ATTR: [],
  });
} 