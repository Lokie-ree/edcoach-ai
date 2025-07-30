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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { WalkthroughFormData } from "../WalkthroughWizard";
import { useState } from "react";

interface Indicator {
  indicator_code: string;
  indicator_name: string;
  overview?: string | string[] | Record<string, string>;
  key_terms?: string | string[] | Record<string, string>;
  effective_practice?: string | string[] | Record<string, string>;
  development_evidence?: string | string[] | Record<string, string>;
  student_centered_evidence?: string | string[] | Record<string, string>;
  domain?: string;
}

interface IndicatorSelectionStepProps {
  formData: WalkthroughFormData;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  canProceed: boolean;
}

export function IndicatorSelectionStep({
  canProceed,
}: IndicatorSelectionStepProps) {
  const methods = useFormContext<WalkthroughFormData>();
  const [selectedReinforcementDetails, setSelectedReinforcementDetails] =
    useState<Indicator | null>(null);
  const [selectedRefinementDetails, setSelectedRefinementDetails] =
    useState<Indicator | null>(null);

  const rubricData = useQuery(api.rubrics.listRubricWithIndicators);
  const indicators: Indicator[] = rubricData
    ? rubricData.domains.flatMap(
        (domain: { indicators: Indicator[] }) => domain.indicators,
      )
    : [];

  // Find indicator object by code
  const getIndicatorByCode = (code: string): Indicator | undefined =>
    indicators.find((i) => i.indicator_code === code);

  const normalizeIndicatorField = (val: unknown): string => {
    if (!val) return "";

    if (Array.isArray(val)) {
      return val.filter((item) => item && typeof item === "string").join("; ");
    }

    if (typeof val === "object" && val !== null) {
      const values = Object.values(val as Record<string, unknown>);
      return values
        .filter((item) => item && typeof item === "string")
        .join("; ");
    }

    return (val as string) || "";
  };

  const handleReinforcementChange = (value: string) => {
    const indicator = getIndicatorByCode(value);
    setSelectedReinforcementDetails(indicator || null);
  };

  const handleRefinementChange = (value: string) => {
    const indicator = getIndicatorByCode(value);
    setSelectedRefinementDetails(indicator || null);
  };

  // Debug values
  const reinforcementValue = methods.watch("reinforcementIndicator");
  const refinementValue = methods.watch("refinementIndicator");

  return (
    <div className="space-y-6">
      {/* Debug info - remove in production */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">Debug Info:</h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <div>Indicators loaded: {indicators.length}</div>
          <div>Reinforcement selected: {reinforcementValue || "none"}</div>
          <div>Refinement selected: {refinementValue || "none"}</div>
          <div>Can proceed: {canProceed ? "Yes" : "No"}</div>
          <div>Form errors: {JSON.stringify(methods.formState.errors)}</div>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">
              Select Your Focus Indicators
            </p>
            <p className="text-blue-700">
              Choose one indicator to <strong>reinforce</strong> (what the
              teacher is doing well) and one to <strong>refine</strong> (area
              for growth).
            </p>
          </div>
        </div>
      </div>

      {/* Reinforcement Indicator */}
      <div className="space-y-4">
        <FormField
          control={methods.control}
          name="reinforcementIndicator"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium flex items-center gap-2">
                Reinforcement Indicator
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700"
                >
                  Strengths
                </Badge>
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleReinforcementChange(value);
                  }}
                  disabled={indicators.length === 0}
                >
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="Select what the teacher is doing well" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {indicators.length === 0 ? (
                      <SelectItem value="__loading__" disabled>
                        Loading indicators...
                      </SelectItem>
                    ) : (
                      indicators.map((indicator: Indicator) => (
                        <SelectItem
                          key={`reinforcement-${indicator.indicator_code}`}
                          value={indicator.indicator_code}
                          className="py-3"
                        >
                          <div className="flex flex-col items-start w-full">
                            <span className="font-medium">
                              {indicator.indicator_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {indicator.indicator_code}
                              {indicator.domain && ` • ${indicator.domain}`}
                            </span>
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

        {/* Reinforcement Indicator Details */}
        {selectedReinforcementDetails && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-sm text-green-800">
                {selectedReinforcementDetails.indicator_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-green-700 space-y-2">
              {selectedReinforcementDetails.overview && (
                <div>
                  <strong>Overview:</strong>{" "}
                  {normalizeIndicatorField(
                    selectedReinforcementDetails.overview,
                  )}
                </div>
              )}
              {selectedReinforcementDetails.key_terms && (
                <div>
                  <strong>Key Terms:</strong>{" "}
                  {normalizeIndicatorField(
                    selectedReinforcementDetails.key_terms,
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Refinement Indicator */}
      <div className="space-y-4">
        <FormField
          control={methods.control}
          name="refinementIndicator"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium flex items-center gap-2">
                Refinement Indicator
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-700"
                >
                  Growth Area
                </Badge>
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleRefinementChange(value);
                  }}
                  disabled={indicators.length === 0}
                >
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="Select an area for growth" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {indicators.length === 0 ? (
                      <SelectItem value="__loading__" disabled>
                        Loading indicators...
                      </SelectItem>
                    ) : (
                      indicators.map((indicator: Indicator) => (
                        <SelectItem
                          key={`refinement-${indicator.indicator_code}`}
                          value={indicator.indicator_code}
                          className="py-3"
                        >
                          <div className="flex flex-col items-start w-full">
                            <span className="font-medium">
                              {indicator.indicator_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {indicator.indicator_code}
                              {indicator.domain && ` • ${indicator.domain}`}
                            </span>
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

        {/* Refinement Indicator Details */}
        {selectedRefinementDetails && (
          <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="text-sm text-orange-800">
                {selectedRefinementDetails.indicator_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-orange-700 space-y-2">
              {selectedRefinementDetails.overview && (
                <div>
                  <strong>Overview:</strong>{" "}
                  {normalizeIndicatorField(selectedRefinementDetails.overview)}
                </div>
              )}
              {selectedRefinementDetails.development_evidence && (
                <div>
                  <strong>Development Evidence:</strong>{" "}
                  {normalizeIndicatorField(
                    selectedRefinementDetails.development_evidence,
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <div className="pt-6">
        {/* Mobile navigation hint */}
        <div className="md:hidden text-center mb-4">
          <p className="text-sm text-muted-foreground">
            {canProceed
              ? "Ready to continue"
              : "Select both indicators to proceed"}
          </p>
        </div>
      </div>
    </div>
  );
}
