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
import type * as audit from "../audit.js";
import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as indicatorQueries from "../indicatorQueries.js";
import type * as migrations from "../migrations.js";
import type * as myFunctions from "../myFunctions.js";
import type * as observations from "../observations.js";
import type * as organizations from "../organizations.js";
import type * as rubricIndicators from "../rubricIndicators.js";
import type * as rubrics from "../rubrics.js";
import type * as teachers from "../teachers.js";
import type * as users from "../users.js";
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
  audit: typeof audit;
  auth: typeof auth;
  http: typeof http;
  indicatorQueries: typeof indicatorQueries;
  migrations: typeof migrations;
  myFunctions: typeof myFunctions;
  observations: typeof observations;
  organizations: typeof organizations;
  rubricIndicators: typeof rubricIndicators;
  rubrics: typeof rubrics;
  teachers: typeof teachers;
  users: typeof users;
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
