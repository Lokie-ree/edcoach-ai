"use client";

import { useFormContext } from "react-hook-form";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { CalendarInput } from "@/components/ui/calendar-input";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { WalkthroughFormData } from "../WalkthroughWizard";

interface Teacher {
  _id: string;
  name: string;
  email?: string;
  department?: string;
  gradeLevel?: string;
  status?: string;
  createdBy?: string;
  createdAt: number;
  organization?: string;
}

interface BasicInfoStepProps {
  formData: WalkthroughFormData;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  canProceed: boolean;
}

export function BasicInfoStep({ onNext, canProceed }: BasicInfoStepProps) {
  const methods = useFormContext<WalkthroughFormData>();
  const teachers = (useQuery(api.teachers.list) ?? []) as Teacher[];

  return (
    <div className="space-y-6">
      {/* Teacher Selection */}
      <FormField
        control={methods.control}
        name="teacherId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">
              Select Teacher
            </FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={teachers.length === 0}
              >
                <SelectTrigger className="w-full h-12 text-base">
                  <SelectValue placeholder="Choose a teacher for this walkthrough" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.length === 0 ? (
                    <SelectItem value="__loading__" disabled>
                      Loading teachers...
                    </SelectItem>
                  ) : (
                    teachers.map((teacher: Teacher) => (
                      <SelectItem
                        key={teacher._id}
                        value={teacher._id}
                        className="py-3"
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{teacher.name}</span>
                          {teacher.department && (
                            <span className="text-sm text-muted-foreground">
                              {teacher.department}
                              {teacher.gradeLevel && ` • ${teacher.gradeLevel}`}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Date Selection */}
      <FormField
        control={methods.control}
        name="walkthroughDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">
              Walkthrough Date
            </FormLabel>
            <FormControl>
              <CalendarInput
                date={
                  field.value instanceof Date
                    ? field.value
                    : undefined
                }
                setDate={field.onChange}
                className="h-12"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Mobile-friendly action area */}
      <div className="pt-6">
        <div className="flex flex-col space-y-3 md:hidden">
          <p className="text-sm text-muted-foreground text-center">
            Select a teacher and date to continue
          </p>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex justify-end">
          <Button
            onClick={onNext}
            disabled={!canProceed}
            size="lg"
            className="min-w-32"
          >
            Next Step
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Teacher count info for coaches */}
      {teachers.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4 mt-6">
          <p className="text-sm text-muted-foreground">
            <strong>{teachers.length}</strong> teacher{teachers.length !== 1 ? 's' : ''} available for walkthroughs
          </p>
        </div>
      )}
    </div>
  );
}