import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const sendMessage = mutation({
  args: {
    content: v.string(),
    sender: v.object({
      id: v.string(),
      firstName: v.string(),
      lastName: v.string(),
      fullName: v.string(),
      imageUrl: v.string(),
    }),
    receiver: v.object({
      id: v.string(),
      firstName: v.string(),
      lastName: v.string(),
      fullName: v.string(),
      imageUrl: v.string(),
    }),
  },
  returns: v.union(
    v.object({
      success: v.boolean(),
      message: v.string(),
      _id: v.id("messages"),
    }),
    v.object({ success: v.boolean(), message: v.string() })
  ),
  handler: async (ctx, args) => {
    if (!args.sender.id) {
      return {
        success: false,
        message: "Sender ID is required",
      };
    }
    if (!args.receiver.id) {
      return {
        success: false,
        message: "Receiver ID is required",
      };
    }
    if (!args.content) {
      return {
        success: false,
        message: "Content is required",
      };
    }
    const conversationId =
      args.sender.id < args.receiver.id
        ? `${args.sender.id}::${args.receiver.id}`
        : `${args.receiver.id}::${args.sender.id}`;
    const id = await ctx.db.insert("messages", {
      ...args,
      conversationId,
    });
    return {
      success: true,
      message: "Message sent successfully",
      _id: id,
    };
  },
});

export const getConversationMessages = query({
  args: {
    conversationId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation_id", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
