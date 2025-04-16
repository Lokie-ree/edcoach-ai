import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Endpoint for Clerk webhooks
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Verify the webhook signature (in production, you'd verify the CLERK_WEBHOOK_SECRET)
    // For now, we'll just process the webhook without verification

    try {
      const payload = await request.json();
      const { type } = payload;

      // Call our action to handle the webhook
      await ctx.runAction(api.auth.handleClerkWebhook, {
        payload,
        type,
      });

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response(
        JSON.stringify({ success: false, error: (error as Error).message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  }),
});

export default http; 