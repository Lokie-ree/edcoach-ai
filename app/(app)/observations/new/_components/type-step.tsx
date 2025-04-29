"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormContext } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPE_OPTIONS = [
  { value: "formal", label: "Formal Observation" },
  { value: "walkthrough", label: "Informal Walkthrough" },
];

export function TypeStep({
  selectedType,
  onSelectType,
}: {
  selectedType: string | null;
  onSelectType: (type: string) => void;
}) {
  const { setValue } = useFormContext();

  const handleTypeChange = (value: string) => {
    setValue("type", value);
    onSelectType(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Observation Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select the type of observation
            </label>
            <Select
              value={selectedType || undefined}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select observation type" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
