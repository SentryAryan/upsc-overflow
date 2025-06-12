import dbConnect from "@/db/dbConnect";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { NextRequest, NextResponse as res } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateApiError } from "../../../../lib/helpers/api-error.helper";
import mongoose from "mongoose";
import Comment from "@/db/models/comment.model";
import Like from "../../../../db/models/like.model";

export const DELETE = errorHandler(async (req: NextRequest) => {
  const { userId } = await auth();
  const commentId = req.nextUrl.searchParams.get("commentId");

  if (!userId) {
    throw generateApiError(401, "Unauthorized", ["Unauthorized"]);
  }

  if (!commentId) {
    throw generateApiError(400, "Comment ID is required", [
      "Comment ID is required",
    ]);
  }

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw generateApiError(400, "Invalid comment ID", ["Invalid comment ID"]);
  }

  await dbConnect();
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const comment = await Comment.findById(commentId).session(session);

    if (!comment) {
      throw generateApiError(404, "Comment not found", ["Comment not found"]);
    }

    if (comment.commenter.toString() !== userId) {
      throw generateApiError(403, "Forbidden", ["Forbidden"]);
    }

    await Like.deleteMany({ comment: commentId }).session(session);
    await Comment.findByIdAndDelete(commentId).session(session);
    await session.commitTransaction();

    return res.json(
      generateApiResponse(200, "Comment deleted successfully", comment)
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});
