/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiFeedback from "../aiFeedback.js";
import type * as aiFeedbackMutations from "../aiFeedbackMutations.js";
import type * as analytics from "../analytics.js";
import type * as audit from "../audit.js";
import type * as auth from "../auth.js";
import type * as billing from "../billing.js";
import type * as clerk from "../clerk.js";
import type * as http from "../http.js";
import type * as indicatorQueries from "../indicatorQueries.js";
import type * as invitationActions from "../invitationActions.js";
import type * as invitations from "../invitations.js";
import type * as migrations from "../migrations.js";
import type * as onboarding from "../onboarding.js";
import type * as plans from "../plans.js";
import type * as rubricIndicators from "../rubricIndicators.js";
import type * as rubrics from "../rubrics.js";
import type * as sendEmails from "../sendEmails.js";
import type * as teachers from "../teachers.js";
import type * as users from "../users.js";
import type * as validation_walkthroughDraftSchema from "../validation/walkthroughDraftSchema.js";
import type * as validation_walkthroughFinalSchema from "../validation/walkthroughFinalSchema.js";
import type * as walkthroughEntries from "../walkthroughEntries.js";
import type * as walkthroughs from "../walkthroughs.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

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
  invitationActions: typeof invitationActions;
  invitations: typeof invitations;
  migrations: typeof migrations;
  onboarding: typeof onboarding;
  plans: typeof plans;
  rubricIndicators: typeof rubricIndicators;
  rubrics: typeof rubrics;
  sendEmails: typeof sendEmails;
  teachers: typeof teachers;
  users: typeof users;
  "validation/walkthroughDraftSchema": typeof validation_walkthroughDraftSchema;
  "validation/walkthroughFinalSchema": typeof validation_walkthroughFinalSchema;
  walkthroughEntries: typeof walkthroughEntries;
  walkthroughs: typeof walkthroughs;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  resend: {
    lib: {
      cancelEmail: FunctionReference<
        "mutation",
        "internal",
        { emailId: string },
        null
      >;
      get: FunctionReference<"query", "internal", { emailId: string }, any>;
      getStatus: FunctionReference<
        "query",
        "internal",
        { emailId: string },
        {
          complained: boolean;
          errorMessage: string | null;
          opened: boolean;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced";
        }
      >;
      handleEmailEvent: FunctionReference<
        "mutation",
        "internal",
        { event: any },
        null
      >;
      sendEmail: FunctionReference<
        "mutation",
        "internal",
        {
          from: string;
          headers?: Array<{ name: string; value: string }>;
          html?: string;
          options: {
            apiKey: string;
            initialBackoffMs: number;
            onEmailEvent?: { fnHandle: string };
            retryAttempts: number;
            testMode: boolean;
          };
          replyTo?: Array<string>;
          subject: string;
          text?: string;
          to: string;
        },
        string
      >;
    };
  };
};
