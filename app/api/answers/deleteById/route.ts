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
  const { userId } = await auth();
  const answerId = req.nextUrl.searchParams.get("answerId");

  if (!userId) {
    throw generateApiError(401, "Unauthorized", ["Unauthorized"]);
  }

  if (!answerId) {
    throw generateApiError(400, "Answer ID is required", [
      "Answer ID is required",
    ]);
  }

  if (!mongoose.Types.ObjectId.isValid(answerId)) {
    throw generateApiError(400, "Invalid answer ID", ["Invalid answer ID"]);
  }

  await dbConnect();
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const answer = await Answer.findById(answerId).session(session);

    if (!answer) {
      throw generateApiError(404, "Answer not found", ["Answer not found"]);
    }

    if (answer.answerer.toString() !== userId) {
      throw generateApiError(403, "Forbidden", ["Forbidden"]);
    }

    const answerComments = await Comment.find({ answer: answerId }).session(
      session
    );
    const answerCommentsIds = answerComments.map((comment) => comment._id);
    await Like.deleteMany({ comment: { $in: answerCommentsIds } }).session(
      session
    );
    await Comment.deleteMany({ answer: answerId }).session(session);
    await Like.deleteMany({ answer: answerId }).session(session);
    await Answer.findByIdAndDelete(answerId).session(session);
    await session.commitTransaction();

    return res.json(
      generateApiResponse(200, "Answer deleted successfully", answer)
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});
