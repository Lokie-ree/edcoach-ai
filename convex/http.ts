import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";

const http = httpRouter();

// Single Clerk webhook endpoint for all events
http.route({
  path: "/api/webhooks/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Error occurred", { status: 400 });
    }
    
    console.log("Received Clerk webhook:", event.type);
    
    try {
      switch (event.type) {
        // User events
        case "user.created":
        case "user.updated":
          await ctx.runMutation(internal.clerk.upsertUser, {
            data: event.data,
          });
          break;

        case "user.deleted": {
          const clerkUserId = event.data.id!;
          await ctx.runMutation(internal.clerk.deleteUser, { clerkUserId });
          break;
        }
        
        // Organization events
        case "organization.created":
          await ctx.runMutation(internal.clerk.handleOrganizationCreated, {
            data: event.data,
          });
          break;
          
        case "organizationMembership.created":
        case "organizationMembership.updated":
          await ctx.runMutation(internal.clerk.handleOrgMembership, {
            data: event.data,
          });
          break;
          
        case "organizationMembership.deleted":
          await ctx.runMutation(internal.clerk.handleOrgMembershipDeleted, {
            data: event.data,
          });
          break;
        
        // Billing events (using string matching for potential future events)
        default: {
          const eventType = (event as any).type;
          if (eventType?.startsWith("billing.")) {
            switch (eventType) {
              case "billing.subscription.created":
              case "billing.subscription.updated":
                // TODO: Implement billing webhook handlers
                console.log("Billing subscription change:", eventType);
                break;
                
              case "billing.subscription.deleted":
                // TODO: Implement billing webhook handlers  
                console.log("Billing subscription cancelled:", eventType);
                break;
                
              default:
                console.log("Ignored billing webhook event", eventType);
            }
          } else {
            console.log("Ignored webhook event", event.type);
          }
          break;
        }
      }
      
      return new Response(null, { status: 200 });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response("Internal server error", { status: 500 });
    }
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