import { action } from "./_generated/server";

/**
 * Returns a short-lived URL the client can POST a file to. The resulting
 * storage ID is saved on the profile via profiles.upsert.
 */
export const generateUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});
