import { NextRequest, NextResponse as res } from "next/server";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import Answer from "@/db/models/answer.model";
import dbConnect from "@/db/dbConnect";
import mongoose from "mongoose";
import getClerkUserById from "@/lib/helpers/getClerkUserById";
import Comment from "@/db/models/comment.model";
import Like from "@/db/models/like.model";
import { auth } from "@clerk/nextjs/server";

export const GET = errorHandler(async (req: NextRequest) => {
  const answerId = req.nextUrl.searchParams.get("answerId");
  console.log("This is the answerId", answerId);
  if (!mongoose.Types.ObjectId.isValid(answerId || "")) {
    throw generateApiError(400, "Invalid answer ID");
  }

  await dbConnect();
  const answer = await Answer.findById(answerId);
  const { userId } = await auth();
  const user = await getClerkUserById(answer?.answerer);
  const answerLikes = await Like.countDocuments({
    answer: answerId,
    isLiked: true,
  });
  const answerDislikes = await Like.countDocuments({
    answer: answerId,
    isLiked: false,
  });
  const isLikedByLoggedInUser = (await Like.findOne({
    answer: answerId,
    liker: userId,
    isLiked: true,
  }))
    ? true
    : false;
  const isDislikedByLoggedInUser = (await Like.findOne({
    answer: answerId,
    liker: userId,
    isLiked: false,
  }))
    ? true
    : false;
  const comments = await Comment.find({ answer: answerId });
  const commentsWithUsers = await Promise.all(
    comments.map(async (comment) => {
      try {
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
      } catch (error: any) {
        console.log("This is the error", error.message);
        return {
          ...comment._doc,
          user: {
            firstName: "Anonymous",
            lastName: "",
            imageUrl: null,
          },
          commentLikes: 0,
          commentDislikes: 0,
          isLikedByLoggedInUser: false,
          isDislikedByLoggedInUser: false,
        };
      }
    })
  );
  const answerWithCommentsAndUsers = {
    ...answer?._doc,
    user,
    comments: commentsWithUsers,
    answerLikes,
    answerDislikes,
    isLikedByLoggedInUser,
    isDislikedByLoggedInUser,
  };

  return res.json(
    generateApiResponse(200, "Answer fetched successfully", {
      answerWithCommentsAndUsers,
    }),
    {
      status: 200,
    }
  );
});
