"use client";

import { useFormContext } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Label } from "@/components/ui/label";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";

const SUBJECT_OPTIONS = [
  { value: "Math", label: "Math" },
  { value: "Science", label: "Science" },
  { value: "Social Studies", label: "Social Studies" },
  { value: "ELA", label: "ELA" },
  { value: "Elective", label: "Elective" },
];

const GRADE_LEVEL_OPTIONS = [
  { value: "K", label: "Kindergarten" },
  { value: "1", label: "1st Grade" },
  { value: "2", label: "2nd Grade" },
  { value: "3", label: "3rd Grade" },
  { value: "4", label: "4th Grade" },
  { value: "5", label: "5th Grade" },
  { value: "6", label: "6th Grade" },
  { value: "7", label: "7th Grade" },
  { value: "8", label: "8th Grade" },
  { value: "9", label: "9th Grade" },
  { value: "10", label: "10th Grade" },
  { value: "11", label: "11th Grade" },
  { value: "12", label: "12th Grade" },
];

function GradeLevelsMultiSelect() {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name="gradeLevels"
      render={({ field }) => (
        <FormItem>
          <Label>Grade Levels</Label>
          <FormControl>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {field.value && field.value.length > 0
                    ? field.value.map(
                        (v: string) => GRADE_LEVEL_OPTIONS.find((o) => o.value === v)?.label
                      ).join(", ")
                    : "Select grade levels"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                {GRADE_LEVEL_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      checked={field.value?.includes(option.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([...(field.value || []), option.value]);
                        } else {
                          field.onChange((field.value || []).filter((v: string) => v !== option.value));
                        }
                      }}
                      id={option.value}
                    />
                    <Label htmlFor={option.value}>{option.label}</Label>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function DetailsStep() {
  const { watch, setValue, control } = useFormContext();
  const teachers = useQuery(api.teachers.list);

  const teacherOptions =
    teachers?.map((teacher) => ({
      value: teacher._id,
      label: teacher.name,
    })) || [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="teacherId">Teacher</Label>
        <Select
          value={watch("teacherId")}
          onValueChange={(value) => setValue("teacherId", value)}
        >
          <SelectTrigger id="teacherId">
            <SelectValue placeholder="Select a teacher" />
          </SelectTrigger>
          <SelectContent>
            {teacherOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Select
          value={watch("subject")}
          onValueChange={(value) => setValue("subject", value)}
        >
          <SelectTrigger id="subject">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {SUBJECT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <GradeLevelsMultiSelect />

      <FormField
        control={control}
        name="observationDate"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-2">
            <Label>Observation Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
