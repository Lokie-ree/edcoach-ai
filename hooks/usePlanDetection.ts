import { useState, useEffect, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

// Only log in development environment
const isDevelopment = process.env.NODE_ENV === 'development';
const log = (...args: any[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

interface PlanDetectionResult {
  isProPlan: boolean;
  isStarterPlan: boolean;
  isFreePlan: boolean;
  planDetectionMethod:
    | "clerk_has"
    | "user_metadata"
    | "fallback"
    | "loading"
    | "error";
  isLoading: boolean;
  error: string | null;
  debugInfo: {
    clerkUserId: string | null | undefined;
    userMetadata: unknown;
    hasChecks: Record<string, boolean | undefined>;
  };
}

export function usePlanDetection(): PlanDetectionResult {
  const { has, userId } = useAuth();
  const { user } = useUser();

  const [result, setResult] = useState<PlanDetectionResult>({
    isProPlan: false,
    isStarterPlan: false,
    isFreePlan: false,
    planDetectionMethod: "loading",
    isLoading: true,
    error: null,
    debugInfo: {
      clerkUserId: undefined,
      userMetadata: null,
      hasChecks: {},
    },
  });

  const detectPlan = useCallback(() => {
    const checkUserMetadata = () => {
      log("👤 Checking user metadata for personal billing...");
      if (!user) {
        return {
          success: false,
          isProPlan: false,
          isStarterPlan: false,
          metadata: null,
        };
      }
      const metadata = {
        publicMetadata: user.publicMetadata,
        unsafeMetadata: user.unsafeMetadata,
      };
      // Check all possible locations for subscription info
      const subscriptionSources = [
        user.publicMetadata?.subscription,
        user.publicMetadata?.plan,
        user.unsafeMetadata?.subscription,
        user.unsafeMetadata?.plan,
      ];
      // Check nested subscription objects
      const userSubscription =
        user.publicMetadata?.subscription || user.unsafeMetadata?.subscription;
      if (typeof userSubscription === "object" && userSubscription) {
        subscriptionSources.push(
          (userSubscription as { plan: string }).plan,
          (userSubscription as { product: string }).product,
          (userSubscription as { name: string }).name,
          (userSubscription as { type: string }).type,
        );
      }
      const validSubscriptions = subscriptionSources.filter(Boolean);
      log("📋 Found subscription data:", validSubscriptions);

      const isProPlan = validSubscriptions.some(
        (sub) =>
          typeof sub === "string" &&
          (sub.toLowerCase().includes("pro") ||
            sub === "coach_pro" ||
            sub === "Coach Pro" ||
            sub === "CoachPro"),
      );

      const isStarterPlan = validSubscriptions.some(
        (sub) =>
          typeof sub === "string" &&
          (sub.toLowerCase().includes("starter") ||
            sub === "coach_starter" ||
            sub === "Coach Starter" ||
            sub === "CoachStarter"),
      );

      return {
        success: validSubscriptions.length > 0,
        isProPlan,
        isStarterPlan,
        metadata,
      };
    };

    const checkClerkHas = () => {
      log("🔐 Checking Clerk has() for personal billing...");
      if (!has) {
        return {
          success: false,
          isProPlan: false,
          isStarterPlan: false,
          checks: {},
        };
      }
      // Try various plan name variations
      const planVariations = [
        "coach_pro",
        "coach_starter",
        "pro",
        "starter",
        "Coach Pro",
        "Coach Starter",
        "CoachPro",
        "CoachStarter",
      ];
      const checks: Record<string, boolean | undefined> = {};
      let foundProPlan = false;
      let foundStarterPlan = false;
      for (const planName of planVariations) {
        try {
          // Try plan, permission, and role checks
          const planCheck = has({ plan: planName });
          const permissionCheck = has({ permission: planName });
          const roleCheck = has({ role: planName });
          checks[`plan:${planName}`] = planCheck;
          checks[`permission:${planName}`] = permissionCheck;
          checks[`role:${planName}`] = roleCheck;
          if (planCheck || permissionCheck || roleCheck) {
            log(`✅ Found subscription via has(): ${planName}`);
            if (planName.toLowerCase().includes("pro")) {
              foundProPlan = true;
            } else if (planName.toLowerCase().includes("starter")) {
              foundStarterPlan = true;
            }
          }
        } catch (error) {
          if (isDevelopment) {
            console.warn(`has() check failed for ${planName}:`, error);
          }
        }
      }
      const hasAnyPlan = Object.values(checks).some(Boolean);
      return {
        success: hasAnyPlan,
        isProPlan: foundProPlan,
        isStarterPlan: foundStarterPlan,
        checks,
      };
    };

    try {
      log("🔍 SIMPLIFIED Plan Detection: Personal billing only...");
      // METHOD 1: Check user metadata (most reliable for personal billing)
      const userMetadataResult = checkUserMetadata();
      // METHOD 2: Try Clerk has() calls (may work for personal billing)
      const clerkHasResult = checkClerkHas();
      // Determine final result (prioritize user metadata)
      let finalResult: PlanDetectionResult;
      if (userMetadataResult.success) {
        log("✅ Using user metadata for plan detection");
        finalResult = {
          isProPlan: userMetadataResult.isProPlan,
          isStarterPlan: userMetadataResult.isStarterPlan,
          isFreePlan:
            !userMetadataResult.isProPlan && !userMetadataResult.isStarterPlan,
          planDetectionMethod: "user_metadata",
          isLoading: false,
          error: null,
          debugInfo: {
            clerkUserId: userId,
            userMetadata: userMetadataResult.metadata,
            hasChecks: clerkHasResult.checks,
          },
        };
      } else if (clerkHasResult.success) {
        log("✅ Using Clerk has() for plan detection");
        finalResult = {
          isProPlan: clerkHasResult.isProPlan,
          isStarterPlan: clerkHasResult.isStarterPlan,
          isFreePlan:
            !clerkHasResult.isProPlan && !clerkHasResult.isStarterPlan,
          planDetectionMethod: "clerk_has",
          isLoading: false,
          error: null,
          debugInfo: {
            clerkUserId: userId,
            userMetadata: userMetadataResult.metadata,
            hasChecks: clerkHasResult.checks,
          },
        };
      } else {
        log("⚠️ No plan detected, defaulting to Free plan");
        finalResult = {
          isProPlan: false,
          isStarterPlan: false,
          isFreePlan: true,
          planDetectionMethod: "fallback",
          isLoading: false,
          error: null,
          debugInfo: {
            clerkUserId: userId,
            userMetadata: userMetadataResult.metadata,
            hasChecks: clerkHasResult.checks,
          },
        };
      }
      log("🎯 SIMPLIFIED Plan Detection Result:", {
        isProPlan: finalResult.isProPlan,
        method: finalResult.planDetectionMethod,
        userMetadata: userMetadataResult.metadata,
        hasChecks: clerkHasResult.checks,
      });
      setResult(finalResult);
    } catch (error) {
      if (isDevelopment) {
        console.error("❌ Plan Detection Error:", error);
      }
      setResult((prev) => ({
        ...prev,
        isLoading: false,
        error: `Plan detection failed: ${error}`,
        planDetectionMethod: "error",
      }));
    }
  }, [user, userId, has]);

  useEffect(() => {
    if (!userId || !user) {
      setResult((prev) => ({
        ...prev,
        isLoading: true,
        planDetectionMethod: "loading",
      }));
      return;
    }

    detectPlan();
  }, [userId, user, has]);

  return result;
}
