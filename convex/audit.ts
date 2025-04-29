import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export type AuditAction =
  | "user_login"
  | "user_logout"
  | "observation_create"
  | "observation_update" 
  | "observation_delete"
  | "teacher_create"
  | "teacher_update"
  | "teacher_delete" 
  | "access_denied"
  | "rate_limit_exceeded";

export type AuditSeverity = "info" | "warning" | "critical";

export const createAuditLog = internalMutation({
  args: {
    userId: v.optional(v.id("users")),
    action: v.string(),
    resourceType: v.optional(v.string()),
    resourceId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    severity: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),
  },
  handler: async (ctx, args) => {
    // Create audit log entry
    const logEntry = await ctx.db.insert("auditLogs", {
      userId: args.userId,
      action: args.action,
      resourceType: args.resourceType,
      resourceId: args.resourceId,
      metadata: args.metadata,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      severity: args.severity,
      timestamp: Date.now(),
    });

    // For critical security events, we could add additional actions
    // like sending alerts to administrators
    if (args.severity === "critical") {
      // Future enhancement: notify security team via webhooks or email
      console.error("CRITICAL SECURITY EVENT:", args);
    }

    return logEntry;
  },
}); 