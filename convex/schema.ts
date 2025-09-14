import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
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
    conversationId: v.string(),
  })
    .index("by_conversation_id", ["conversationId"])
    .index("by_sender_id", ["sender.id"])
    .index("by_receiver_id", ["receiver.id"]),
});
