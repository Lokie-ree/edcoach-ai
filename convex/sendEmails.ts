import { components } from "./_generated/api";
import { Resend } from "@convex-dev/resend";

export const resend = new Resend(components.resend, {
  // Optionally add onEmailEvent or testMode here
});

export async function sendEmail(
  ctx: any,
  from: string,
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  return resend.sendEmail(ctx, from, to, subject, html, text);
} 