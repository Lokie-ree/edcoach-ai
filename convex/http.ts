import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
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
          console.log(`Processing ${event.type} for user:`, event.data.id);
          await ctx.runMutation(internal.clerk.upsertUser, {
            data: event.data,
          });
          console.log(`✅ Successfully processed ${event.type}`);
          break;

        case "user.deleted": {
          const clerkUserId = event.data.id!;
          console.log("Processing user.deleted for user:", clerkUserId);
          await ctx.runMutation(internal.clerk.deleteUser, { clerkUserId });
          console.log("✅ Successfully processed user.deleted");
          break;
        }
        
        // Organization events
        case "organization.created":
          console.log("Processing organization.created for org:", event.data.id);
          await ctx.runMutation(internal.clerk.handleOrganizationCreated, {
            data: event.data,
          });
          console.log("✅ Successfully processed organization.created");
          break;
          
        case "organizationMembership.created":
        case "organizationMembership.updated":
          console.log(`📨 Processing ${event.type}`);
          console.log(`📨 Event data structure:`, JSON.stringify(event.data, null, 2));
          console.log(`📨 For user:`, event.data.public_user_data?.user_id, "org:", event.data.organization?.id, "role:", event.data.role);
          
          await ctx.runMutation(internal.clerk.handleOrgMembership, {
            data: event.data,
          });
          console.log(`✅ Successfully processed ${event.type}`);
          break;
          
        case "organizationMembership.deleted":
          console.log("Processing organizationMembership.deleted for user:", event.data.public_user_data?.user_id);
          await ctx.runMutation(internal.clerk.handleOrgMembershipDeleted, {
            data: event.data,
          });
          console.log("✅ Successfully processed organizationMembership.deleted");
          break;
        
        // Billing/Subscription events (NEW)
        case "subscription.created":
        case "subscription.updated":
        case "subscription.active":
        case "subscription.past_due":
        case "subscriptionItem.created":
        case "subscriptionItem.updated":
        case "subscriptionItem.active":
        case "subscriptionItem.canceled":
        case "subscriptionItem.upcoming":
        case "subscriptionItem.ended":
        case "subscriptionItem.abandoned":
        case "subscriptionItem.incomplete":
        case "subscriptionItem.past_due":
        case "paymentAttempt.created":
        case "paymentAttempt.updated": {
          console.log(`Processing billing event: ${event.type}`);
          await ctx.runMutation(internal.billing.handleSubscriptionEvent, {
            eventType: event.type,
            data: event.data,
          });
          console.log(`✅ Successfully processed billing event: ${event.type}`);
          break;
        }
        
        // Note: Clerk Billing doesn't send webhooks - subscription state is managed by Clerk
        
        // Fallback for other events
        default: {
          const eventType = (event as any).type;
          if (eventType?.startsWith("billing.")) {
            console.log("Ignored billing webhook event", eventType);
          } else {
            console.log("⚠️ UNHANDLED WEBHOOK EVENT:", event.type);
            console.log("Event data:", JSON.stringify(event.data, null, 2));
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

async function validateRequest(req: Request): Promise<any> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders);
  } catch (error) {
    console.error("Error verifying webhook event", error);
    return null;
  }
}

export default http;