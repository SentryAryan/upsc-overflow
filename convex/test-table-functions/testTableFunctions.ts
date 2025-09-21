import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const createTest = mutation({
  args: {
    questions: v.string(),
    answers: v.array(v.string()),
    review: v.string(),
    ai_model: v.string(),
    creator: v.string(),
  },
  returns: v.union(
    v.object({
      success: v.boolean(),
      message: v.string(),
      _id: v.id("tests"),
    }),
    v.object({ success: v.boolean(), message: v.string() })
  ),
  handler: async (ctx, args) => {
    if (!args.questions) {
      return {
        success: false,
        message: "Questions are required",
      };
    }
    if (!args.answers) {
      return {
        success: false,
        message: "Answers are required",
      };
    }
    if (!args.review) {
      return {
        success: false,
        message: "Review is required",
      };
    }
    if (!args.ai_model) {
      return {
        success: false,
        message: "AI model is required",
      };
    }
    if (!args.creator) {
      return {
        success: false,
        message: "Creator is required",
      };
    }
    const id = await ctx.db.insert("tests", {
      ...args,
      creator: args.creator,
    });
    return {
      success: true,
      message: "Test created successfully",
      _id: id,
    };
  },
});

export const getTestById = query({
  args: {
    id: v.id("tests"),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    test: v.union(
      v.object({
        _id: v.id("tests"),
        _creationTime: v.number(),
        questions: v.string(),
        answers: v.array(v.string()),
        review: v.string(),
        ai_model: v.string(),
        creator: v.string(),
      }),
      v.null()
    ),
  }),
  handler: async (ctx, args) => {
    const test = await ctx.db.get(args.id);
    return {
      success: test ? true : false,
      message: test ? "Test fetched successfully" : "Test not found",
      test: test || null,
    };
  },
});
