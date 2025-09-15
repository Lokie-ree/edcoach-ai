"use client";

import React from "react";
import { FormField as ShadcnFormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { FORM_PATTERNS, RESPONSIVE_PATTERNS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { Control, FieldPath, FieldValues, ControllerRenderProps } from "react-hook-form";

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  description?: string;
  children: React.ReactNode | ((props: { field: ControllerRenderProps<TFieldValues, TName> }) => React.ReactNode);
  className?: string;
  required?: boolean;
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  children,
  className,
  required = false
}: FormFieldProps<TFieldValues, TName>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-3", FORM_PATTERNS.field.spacing, className)}>
          <FormLabel className={cn(
            "text-sm font-medium",
            RESPONSIVE_PATTERNS.text.body,
            required && "after:content-['*'] after:ml-1 after:text-destructive"
          )}>
            {label}
          </FormLabel>
          {description && (
            <FormDescription className={cn("text-xs text-muted-foreground", RESPONSIVE_PATTERNS.text.body)}>
              {description}
            </FormDescription>
          )}
          <FormControl>
            {typeof children === 'function' 
              ? children({ field })
              : children
            }
          </FormControl>
          <FormMessage className="text-sm" />
        </FormItem>
      )}
    />
  );
}
