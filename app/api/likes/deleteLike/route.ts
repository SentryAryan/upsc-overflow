import { NextRequest, NextResponse as res } from "next/server";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import Like, { LikeTypeSchema } from "@/db/models/like.model";
import dbConnect from "@/db/dbConnect";

export const DELETE = errorHandler(async (req: NextRequest) => {
  const questionId = req.nextUrl.searchParams.get("questionId");
  const answerId = req.nextUrl.searchParams.get("answerId");
  const commentId = req.nextUrl.searchParams.get("commentId");
  const liker = req.nextUrl.searchParams.get("liker");

  if (!questionId && !answerId && !commentId) {
    throw generateApiError(400, "Question, answer or comment ID is required");
  }

  if (!liker) {
    throw generateApiError(400, "Liker ID is required");
  }

  await dbConnect();
  let like: LikeTypeSchema | null = null;
  let likesInfo = null;

  if (questionId) {
    like = await Like.findOneAndDelete({ question: questionId, liker });

    if (!like) {
      throw generateApiError(400, "Like not found");
    }

    const questionLikes = await Like.countDocuments({
      question: questionId,
      isLiked: true,
    });
    const questionDislikes = await Like.countDocuments({
      question: questionId,
      isLiked: false,
    });
    const isLikedByLoggedInUser = (await Like.findOne({
      question: questionId,
      liker,
      isLiked: true,
    }))
      ? true
      : false;
    const isDislikedByLoggedInUser = (await Like.findOne({
      question: questionId,
      liker,
      isLiked: false,
    }))
      ? true
      : false;
    likesInfo = {
      questionLikes,
      questionDislikes,
      isLikedByLoggedInUser,
      isDislikedByLoggedInUser,
    };
  }

  if (answerId) {
    like = await Like.findOneAndDelete({ answer: answerId, liker });

    if (!like) {
      throw generateApiError(400, "Like not found");
    }
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
      liker,
      isLiked: true,
    }))
      ? true
      : false;
    const isDislikedByLoggedInUser = (await Like.findOne({
      answer: answerId,
      liker,
      isLiked: false,
    }))
      ? true
      : false;
    likesInfo = {
      answerLikes,
      answerDislikes,
      isLikedByLoggedInUser,
      isDislikedByLoggedInUser,
    };
  }

  if (commentId) {
    like = await Like.findOneAndDelete({ comment: commentId, liker });

    if (!like) {
      throw generateApiError(400, "Like not found");
    }
    const commentLikes = await Like.countDocuments({
      comment: commentId,
      isLiked: true,
    });
    const commentDislikes = await Like.countDocuments({
      comment: commentId,
      isLiked: false,
    });
    const isLikedByLoggedInUser = (await Like.findOne({
      comment: commentId,
      liker,
      isLiked: true,
    }))
      ? true
      : false;
    const isDislikedByLoggedInUser = (await Like.findOne({
      comment: commentId,
      liker,
      isLiked: false,
    }))
      ? true
      : false;
    likesInfo = {
      commentLikes,
      commentDislikes,
      isLikedByLoggedInUser,
      isDislikedByLoggedInUser,
    };
  }

  return res.json(
    generateApiResponse(200, "Like deleted successfully", likesInfo),
    {
      status: 200,
    }
  );
});
