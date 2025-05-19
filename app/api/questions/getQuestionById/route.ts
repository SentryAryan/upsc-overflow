import dbConnect from "@/db/dbConnect";
import Answer from "@/db/models/answer.model";
import Comment from "@/db/models/comment.model";
import Like from "@/db/models/like.model";
import Question from "@/db/models/question.model";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import getClerkUserById from "@/lib/helpers/getClerkUserById";
import mongoose from "mongoose";
import { NextRequest, NextResponse as res } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const GET = errorHandler(async (req: NextRequest) => {
  const questionId = req.nextUrl.searchParams.get("questionId");
  console.log("This is the questionId in the route", questionId);
  const { userId } = await auth();

  if (!mongoose.Types.ObjectId.isValid(questionId || "")) {
    throw generateApiError(400, "Invalid question ID");
  }

  await dbConnect();
  const question = await Question.findById(questionId);
  const user = await getClerkUserById(question.asker);
  const answers = await Answer.find({ question: questionId });
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
    liker: userId,
    isLiked: true,
  }))
    ? true
    : false;
  const isDislikedByLoggedInUser = (await Like.findOne({
    question: questionId,
    liker: userId,
    isLiked: false,
  }))
    ? true
    : false;
  const answersWithUsers = await Promise.all(
    answers.map(async (answer) => {
      try {
        const user = await getClerkUserById(answer.answerer);
        const answerLikes = await Like.countDocuments({
          answer: answer._id,
          isLiked: true,
        });
        const answerDislikes = await Like.countDocuments({
          answer: answer._id,
          isLiked: false,
        });
        const isLikedByLoggedInUser = (await Like.findOne({
          answer: answer._id,
          liker: userId,
          isLiked: true,
        }))
          ? true
          : false;
        const isDislikedByLoggedInUser = (await Like.findOne({
          answer: answer._id,
          liker: userId,
          isLiked: false,
        }))
          ? true
          : false;
        return {
          ...answer._doc,
          user,
          answerLikes,
          answerDislikes,
          isLikedByLoggedInUser,
          isDislikedByLoggedInUser,
        };
      } catch (error: any) {
        console.log("This is the error", error.message);
        return {
          ...answer._doc,
          answerLikes: 0,
          answerDislikes: 0,
          isLikedByLoggedInUser: false,
          isDislikedByLoggedInUser: false,
          user: {
            firstName: "Anonymous",
            lastName: "",
            imageUrl: null,
          },
        };
      }
    })
  );

  const answersWithCommentsAndUsers = await Promise.all(
    answersWithUsers.map(async (answer) => {
      try {
        const comments = await Comment.find({ answer: answer._id });
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
                commentLikes: 0,
                commentDislikes: 0,
                isLikedByLoggedInUser: false,
                isDislikedByLoggedInUser: false,
                user: {
                  firstName: "Anonymous",
                  lastName: "",
                  imageUrl: null,
                },
              };
            }
          })
        );
        return {
          ...answer,
          comments: commentsWithUsers,
        };
      } catch (error: any) {
        console.log("This is the error", error.message);
        return {
          ...answer,
          comments: [],
        };
      }
    })
  );

  const questionWithUserAndAnswers = {
    ...question._doc,
    user,
    questionLikes,
    questionDislikes,
    isLikedByLoggedInUser,
    isDislikedByLoggedInUser,
    answersWithCommentsAndUsers,
  };

  return res.json(
    generateApiResponse(
      200,
      "Question fetched successfully",
      questionWithUserAndAnswers
    )
  );
});
