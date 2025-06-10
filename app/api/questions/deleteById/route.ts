import dbConnect from "@/db/dbConnect";
import Question from "@/db/models/question.model";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { NextRequest, NextResponse as res } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { generateApiError } from "../../../../lib/helpers/api-error.helper";
import mongoose from "mongoose";
import Comment from "@/db/models/comment.model";
import Like from "../../../../db/models/like.model";
import Answer from "../../../../db/models/answer.model";

export const DELETE = errorHandler(async (req: NextRequest) => {
  await dbConnect();
  const { userId } = await auth();
  const questionId = req.nextUrl.searchParams.get("questionId");

  if (!userId) {
    throw generateApiError(401, "Unauthorized", ["Unauthorized"]);
  }

  if (!questionId) {
    throw generateApiError(400, "Question ID is required", [
      "Question ID is required",
    ]);
  }

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    throw generateApiError(400, "Invalid question ID", ["Invalid question ID"]);
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const question = await Question.findById(questionId).session(session);

    if (!question) {
      throw generateApiError(404, "Question not found", ["Question not found"]);
    }

    if (question.asker.toString() !== userId) {
      throw generateApiError(403, "Forbidden", ["Forbidden"]);
    }

    const questionComments = await Comment.find({ question: questionId }).session(session);
    const questionCommentsIds = questionComments.map((comment) => comment._id);
    const answers = await Answer.find({ question: questionId }).session(session);
    const answersIds = answers.map((answer) => answer._id);
    for (const answer of answers) {
      const comments = await Comment.find({ answer: answer._id }).session(session);
      const commentsIds = comments.map((comment) => comment._id);
      await Like.deleteMany({ comment: { $in: commentsIds } }).session(session);
      await Comment.deleteMany({ answer: answer._id }).session(session);
    }

    await Like.deleteMany({ question: questionId }).session(session);
    await Like.deleteMany({ comment: { $in: questionCommentsIds } }).session(session);
    await Like.deleteMany({ answer: { $in: answersIds } }).session(session);
    await Comment.deleteMany({ question: questionId }).session(session);
    await Answer.deleteMany({ question: questionId }).session(session);
    await Question.findByIdAndDelete(questionId).session(session);
    await session.commitTransaction();

    return res.json(
      generateApiResponse(200, "Questions deleted successfully", question)
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});
