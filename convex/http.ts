import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";

const http = httpRouter();

// Clerk user webhooks (existing + enhanced)
http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Error occurred", { status: 400 });
    }
    
    switch (event.type) {
      case "user.created":
      case "user.updated":
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        });
        break;

      case "user.deleted": {
        const clerkUserId = event.data.id!;
        await ctx.runMutation(internal.users.deleteFromClerk, { clerkUserId });
        break;
      }
      
      default:
        console.log("Ignored user webhook event", event.type);
    }

    return new Response(null, { status: 200 });
  }),
});

// Clerk organization webhooks (NEW)
http.route({
  path: "/clerk-organizations-webhook", 
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Error occurred", { status: 400 });
    }
    
    switch (event.type) {
      case "organization.created":
        console.log("Organization created:", event.data.id);
        break;
        
      case "organizationMembership.created":
        await ctx.runMutation(internal.users.handleOrgMembershipCreated, {
          data: event.data,
        });
        break;
        
      case "organizationMembership.updated":
        await ctx.runMutation(internal.users.handleOrgMembershipUpdated, {
          data: event.data,
        });
        break;
        
      case "organizationMembership.deleted":
        await ctx.runMutation(internal.users.handleOrgMembershipDeleted, {
          data: event.data,
        });
        break;
        
      default:
        console.log("Ignored organization webhook event", event.type);
    }

    return new Response(null, { status: 200 });
  }),
});

// Clerk billing webhooks (NEW)
http.route({
  path: "/clerk-billing-webhook",
  method: "POST", 
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Error occurred", { status: 400 });
    }
    
    // Handle billing events using string matching since they may not be in WebhookEvent types
    const eventType = (event as any).type;
    
    switch (eventType) {
      case "billing.subscription.created":
      case "billing.subscription.updated":
        await ctx.runMutation(internal.users.handleSubscriptionChange, {
          data: (event as any).data,
        });
        break;
        
      case "billing.subscription.deleted":
        await ctx.runMutation(internal.users.handleSubscriptionCancelled, {
          data: (event as any).data,
        });
        break;
        
      default:
        console.log("Ignored billing webhook event", eventType);
    }

    return new Response(null, { status: 200 });
  }),
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook event", error);
    return null;
  }
}

export default http;