import { NextRequest, NextResponse as res } from "next/server";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import dbConnect from "@/db/dbConnect";
import { auth } from "@clerk/nextjs/server";
import getClerkUserById from "@/lib/helpers/getClerkUserById";
import Question from "@/db/models/question.model";
import Answer from "@/db/models/answer.model";
import Comment from "@/db/models/comment.model";
import Like from "@/db/models/like.model";

export const GET = errorHandler(async (req: NextRequest) => {
  const { userId } = await auth();

  if (!userId) {
    throw generateApiError(401, "Unauthorized", ["Unauthorized"]);
  }

  await dbConnect();

  const user = await getClerkUserById(userId);
  const questions = await Question.find({ asker: userId });
  const answers = await Answer.find({ answerer: userId });
  const comments = await Comment.find({ commenter: userId });
  const upvotes = await Like.countDocuments({ liker: userId, isLiked: true });
  const downvotes = await Like.countDocuments({
    liker: userId,
    isLiked: false,
  });

  return res.json(
    generateApiResponse(201, "User profile fetched successfully", {
      user,
      questions,
      answers,
      comments,
      upvotes,
      downvotes,
    }),
    {
      status: 201,
    }
  );
});
