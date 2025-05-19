import { NextRequest, NextResponse as res } from "next/server";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import Comment from "@/db/models/comment.model";
import { z } from "zod";
import dbConnect from "@/db/dbConnect";
import mongoose from "mongoose";
import getClerkUserById from "../../../../lib/helpers/getClerkUserById";
import Like from "../../../../db/models/like.model";
import { auth } from "@clerk/nextjs/server";
const commentSchema = z.object({
  content: z.string().min(1, { message: "Content is required" }),
  answer: z.string().optional(),
  question: z.string().optional(),
  commenter: z.string().min(1, { message: "Commenter is required" }),
});

export const POST = errorHandler(async (req: NextRequest) => {
  const validatedData = commentSchema.parse(await req.json());
  const { content, answer, question, commenter } = validatedData;

  if (!answer && !question) {
    throw generateApiError(400, "Answer or question ID is required", [
      "Answer or question ID is required",
    ]);
  }
  if (answer && !mongoose.Types.ObjectId.isValid(answer)) {
    throw generateApiError(400, "Invalid answer ID", ["Invalid answer ID"]);
  }
  if (question && !mongoose.Types.ObjectId.isValid(question)) {
    throw generateApiError(400, "Invalid question ID", ["Invalid question ID"]);
  }

  await dbConnect();

  const { userId } = await auth();
  const createdComment = answer
    ? await Comment.create({
        content,
        answer,
        commenter,
      })
    : await Comment.create({
        content,
        question,
        commenter,
      });
  const user = await getClerkUserById(createdComment.commenter);
  const commentLikes = await Like.countDocuments({
    comment: createdComment._id,
    isLiked: true,
  });
  const commentDislikes = await Like.countDocuments({
    comment: createdComment._id,
    isLiked: false,
  });
  const isLikedByLoggedInUser = (await Like.findOne({
    comment: createdComment._id,
    liker: userId,
    isLiked: true,
  }))
    ? true
    : false;
  const isDislikedByLoggedInUser = (await Like.findOne({
    comment: createdComment._id,
    liker: userId,
    isLiked: false,
  }))
    ? true
    : false;
  return res.json(
    generateApiResponse(201, "Comment created successfully", {
      comment: {
        ...createdComment._doc,
        user,
        commentLikes,
        commentDislikes,
        isLikedByLoggedInUser,
        isDislikedByLoggedInUser,
      },
    }),
    {
      status: 201,
    }
  );
});
