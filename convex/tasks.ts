import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { Reaction } from "./schema";

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

export const reactToMessage = mutation({
  args: {
    messageId: v.id("messages"),
    reaction: v.union(
      v.literal(Reaction.LIKE),
      v.literal(Reaction.LOVE),
      v.literal(Reaction.PARTY),
      v.literal(Reaction.LAUGH),
      v.literal(Reaction.WOW),
      v.literal(Reaction.SAD),
      v.literal(Reaction.ANGRY),
      v.literal(Reaction.SCARED),
      v.literal(Reaction.SURPRISED),
      v.literal(Reaction.CONFUSED),
      v.literal(Reaction.DISLIKE),
      v.literal(Reaction.BORED),
      v.literal(Reaction.TIRED),
      v.literal(Reaction.EXCITED),
      v.literal(Reaction.HUNDRED)
    ),
    liker: v.object({
      id: v.string(),
      firstName: v.string(),
      lastName: v.string(),
      fullName: v.string(),
      imageUrl: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reactions", {
      messageId: args.messageId,
      liker: args.liker,
      reaction: args.reaction,
    });
  },
});

export const toggleReaction = mutation({
  args: {
    reactionId: v.id("reactions"),
    reaction: v.union(
      v.literal(Reaction.LIKE),
      v.literal(Reaction.LOVE),
      v.literal(Reaction.PARTY),
      v.literal(Reaction.LAUGH),
      v.literal(Reaction.WOW),
      v.literal(Reaction.SAD),
      v.literal(Reaction.ANGRY),
      v.literal(Reaction.SCARED),
      v.literal(Reaction.SURPRISED),
      v.literal(Reaction.CONFUSED),
      v.literal(Reaction.DISLIKE),
      v.literal(Reaction.BORED),
      v.literal(Reaction.TIRED),
      v.literal(Reaction.EXCITED),
      v.literal(Reaction.HUNDRED)
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.reactionId, {
      reaction: args.reaction,
    });
  },
});

export const getMessageReactions = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reactions")
      .withIndex("by_message_id", (q) => q.eq("messageId", args.messageId))
      .collect();
  },
});

export const deleteReaction = mutation({
  args: {
    reactionId: v.id("reactions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.reactionId);
  },
});
