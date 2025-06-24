/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as aiFeedback from "../aiFeedback.js";
import type * as aiFeedbackMutations from "../aiFeedbackMutations.js";
import type * as analytics from "../analytics.js";
import type * as audit from "../audit.js";
import type * as auth from "../auth.js";
import type * as billing from "../billing.js";
import type * as clerk from "../clerk.js";
import type * as http from "../http.js";
import type * as indicatorQueries from "../indicatorQueries.js";
import type * as migrations from "../migrations.js";
import type * as onboarding from "../onboarding.js";
import type * as rubricIndicators from "../rubricIndicators.js";
import type * as rubrics from "../rubrics.js";
import type * as teachers from "../teachers.js";
import type * as users from "../users.js";
import type * as validation_walkthroughDraftSchema from "../validation/walkthroughDraftSchema.js";
import type * as validation_walkthroughFinalSchema from "../validation/walkthroughFinalSchema.js";
import type * as walkthroughEntries from "../walkthroughEntries.js";
import type * as walkthroughs from "../walkthroughs.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  aiFeedback: typeof aiFeedback;
  aiFeedbackMutations: typeof aiFeedbackMutations;
  analytics: typeof analytics;
  audit: typeof audit;
  auth: typeof auth;
  billing: typeof billing;
  clerk: typeof clerk;
  http: typeof http;
  indicatorQueries: typeof indicatorQueries;
  migrations: typeof migrations;
  onboarding: typeof onboarding;
  rubricIndicators: typeof rubricIndicators;
  rubrics: typeof rubrics;
  teachers: typeof teachers;
  users: typeof users;
  "validation/walkthroughDraftSchema": typeof validation_walkthroughDraftSchema;
  "validation/walkthroughFinalSchema": typeof validation_walkthroughFinalSchema;
  walkthroughEntries: typeof walkthroughEntries;
  walkthroughs: typeof walkthroughs;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
