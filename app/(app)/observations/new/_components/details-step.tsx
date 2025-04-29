"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormContext } from "react-hook-form";
import { Select } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { DatePicker } from "@/components/ui/date-picker";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

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

export function DetailsStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { register, watch, setValue } = useFormContext();
  const teachers = useQuery(api.teachers.list);

  const teacherOptions =
    teachers?.map((teacher) => ({
      value: teacher._id,
      label: teacher.name,
    })) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Observation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Teacher</label>
            <Select
              options={teacherOptions}
              value={watch("teacherId")}
              onChange={(value) => setValue("teacherId", value)}
              placeholder="Select a teacher"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Select
              options={SUBJECT_OPTIONS}
              value={watch("subject")}
              onChange={(value) => setValue("subject", value)}
              placeholder="Select a subject"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Grade Levels</label>
            <MultiSelect
              options={GRADE_LEVEL_OPTIONS}
              value={watch("gradeLevels") || []}
              onChange={(value) => setValue("gradeLevels", value)}
              placeholder="Select grade levels"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Observation Date</label>
            <DatePicker
              value={watch("observationDate")}
              onChange={(date) => setValue("observationDate", date)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}
