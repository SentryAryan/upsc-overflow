import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export enum Reaction {
  LIKE = "👍",
  LOVE = "❤️",
  PARTY = "🎉",
  LAUGH = "😂",
  WOW = "🤯",
  SAD = "😢",
  ANGRY = "😠",
  SCARED = "😨",
  SURPRISED = "😲",
  CONFUSED = "😕",
  DISLIKE = "👎",
  BORED = "😴",
  TIRED = "😫",
  EXCITED = "🤩",
  HUNDRED = "💯",
}

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
  reactions: defineTable({
    messageId: v.id("messages"),
    liker: v.object({
      id: v.string(),
      firstName: v.string(),
      lastName: v.string(),
      fullName: v.string(),
      imageUrl: v.string(),
    }),
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
  }).index("by_message_id", ["messageId"]),
  tests: defineTable({
    questions: v.string(),
    answers: v.array(v.string()),
    review: v.string(),
    ai_model: v.string(),
    creator: v.string(),
  }).index("by_creator_id", ["creator"]),
});
