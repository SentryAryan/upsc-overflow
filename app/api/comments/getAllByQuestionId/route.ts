import { NextRequest, NextResponse as res } from "next/server";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import Comment from "@/db/models/comment.model";
import Like from "@/db/models/like.model";
import dbConnect from "@/db/dbConnect";
import mongoose from "mongoose";
import getClerkUserById from "@/lib/helpers/getClerkUserById";
import { auth } from "@clerk/nextjs/server";

export const GET = errorHandler(async (req: NextRequest) => {
  const questionId = req.nextUrl.searchParams.get("questionId");
  if (!questionId) {
    throw generateApiError(400, "Question ID is required", [
      "Question ID is required",
    ]);
  }
  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    throw generateApiError(400, "Invalid question ID", ["Invalid question ID"]);
  }

  await dbConnect();

  const { userId } = await auth();
  const comments = await Comment.find({ question: questionId });
  const commentsWithUsersAndVotes = await Promise.all(
    comments.map(async (comment) => {
      const user = await getClerkUserById(comment.commenter);
      const commentLikes = await Like.countDocuments({
        comment: comment._id,
        isLiked: true,
      });
      const commentDislikes = await Like.countDocuments({
        comment: comment._id,
        isLiked: false,
      });
      const isLikedByLoggedInUser = (await Like.findOne({
        comment: comment._id,
        liker: userId,
        isLiked: true,
      }))
        ? true
        : false;
      const isDislikedByLoggedInUser = (await Like.findOne({
        comment: comment._id,
        liker: userId,
        isLiked: false,
      }))
        ? true
        : false;
      return {
        ...comment._doc,
        user,
        commentLikes,
        commentDislikes,
        isLikedByLoggedInUser,
        isDislikedByLoggedInUser,
      };
    })
  );

  return res.json(
    generateApiResponse(200, "Comments fetched successfully", {
      comments: commentsWithUsersAndVotes,
    }),
    {
      status: 200,
    }
  );
});
