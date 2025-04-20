import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Handle Clerk webhooks
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payload = await request.json();
    await ctx.runAction(api.auth.handleClerkWebhook, { payload });
    return new Response(null, { status: 200 });
  }),
});

export default http; 