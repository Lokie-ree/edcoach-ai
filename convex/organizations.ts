import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Create a new organization
export const createOrganization = mutation({
  args: {
    name: v.string(),
    type: v.optional(v.string()),
    adminId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const organizationId = await ctx.db.insert("organizations", {
      name: args.name,
      type: args.type,
      adminId: args.adminId,
      createdAt: Date.now(),
    });

    // If an admin ID was provided, update the user's organization
    if (args.adminId) {
      await ctx.db.patch(args.adminId, {
        organization: args.name,
      });
    }

    return { organizationId };
  },
});

// Get an organization by ID
export const getOrganization = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId);
    return organization;
  },
});

// List all organizations
export const listOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const organizations = await ctx.db.query("organizations").collect();
    return organizations;
  },
});

// Update an organization
export const updateOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    adminId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { organizationId, ...updates } = args;

    // Define the type for the keys we expect in updates
    type UpdateKeys = keyof Omit<typeof args, 'organizationId'>;
    
    // Define the type for the filtered updates object
    type FilteredUpdates = Partial<{
      name?: string;
      type?: string;
      adminId?: Id<"users">;
    }>;

    const filteredUpdates: FilteredUpdates = {};

    // Build updates object only with defined values, handling types
    (Object.keys(updates) as UpdateKeys[]).forEach((key) => {
      const value = updates[key];
      if (value !== undefined) {
        // Explicitly cast the value based on the key
        if (key === 'name' || key === 'type') {
          filteredUpdates[key] = value as string;
        } else if (key === 'adminId') {
          filteredUpdates[key] = value as Id<"users">;
        }
      }
    });

    // Only update if there are changes
    if (Object.keys(filteredUpdates).length === 0) {
      return { success: false, message: "No updates provided" };
    }

    await ctx.db.patch(organizationId, filteredUpdates);
    return { success: true };
  },
});

// Delete an organization
export const deleteOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    // Check if organization exists
    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      return { success: false, message: "Organization not found" };
    }

    // Delete the organization
    await ctx.db.delete(args.organizationId);
    
    return { success: true };
  },
}); 