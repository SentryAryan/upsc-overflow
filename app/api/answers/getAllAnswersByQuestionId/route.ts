import { NextRequest, NextResponse as res } from "next/server";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import Answer from "@/db/models/answer.model";
import dbConnect from "@/db/dbConnect";
import mongoose from "mongoose";
import getClerkUserById from "@/lib/helpers/getClerkUserById";
import Comment from "@/db/models/comment.model";

export const GET = errorHandler(async (req: NextRequest) => {
  const questionId = req.nextUrl.searchParams.get("questionId");
  console.log("This is the questionId", questionId);
  if (!mongoose.Types.ObjectId.isValid(questionId || "")) {
    throw generateApiError(400, "Invalid question ID");
  }

  await dbConnect();
  const answers = await Answer.find({ question: questionId });

  const answersWithUsers = await Promise.all(
    answers.map(async (answer) => {
      const user = await getClerkUserById(answer.answerer);
      return {
        ...answer._doc,
        user,
      };
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
              return {
                ...comment._doc,
                user,
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

  return res.json(
    generateApiResponse(200, "Answers fetched successfully", {
      answersWithCommentsAndUsers,
    }),
    {
      status: 200,
    }
  );
});
