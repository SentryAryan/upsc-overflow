import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const createTest = mutation({
  args: {
    questions: v.string(),
    answers: v.array(v.string()),
    review: v.string(),
    ai_model: v.string(),
    creator: v.string(),
    subject: v.string(),
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
    if (!args.questions || args.questions.trim() === "") {
      return {
        success: false,
        message: "Questions are required",
      };
    }
    if (!args.answers || args.answers.length === 0) {
      return {
        success: false,
        message: "Answers are required",
      };
    }
    if (!args.review || args.review.trim() === "") {
      return {
        success: false,
        message: "Review is required",
      };
    }
    if (!args.ai_model || args.ai_model.trim() === "") {
      return {
        success: false,
        message: "AI model is required",
      };
    }
    if (!args.creator || args.creator.trim() === "") {
      return {
        success: false,
        message: "Creator is required",
      };
    }
    if (!args.subject || args.subject.trim() === "") {
      return {
        success: false,
        message: "Subject is required",
      };
    }
    const id = await ctx.db.insert("tests", {
      ...args,
      creator: args.creator,
      subject: args.subject,
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
  handler: async (ctx, args) => {
    const test = await ctx.db.get(args.id);
    console.log("test =", test);
    return test;
  },
});

export const getAllTestsOfUser = query({
  args: {
    creator: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.creator) {
      return [];
    }
    const tests = await ctx.db
      .query("tests")
      .withIndex("by_creator_id", (q) => q.eq("creator", args.creator))
      .collect();
    return tests;
  },
});
