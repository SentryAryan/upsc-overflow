import { NextRequest, NextResponse as res } from "next/server";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import Save, { SaveTypeSchema } from "@/db/models/save.model";
import dbConnect from "@/db/dbConnect";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";

export const GET = errorHandler(async (req: NextRequest) => {
  const questionId = req.nextUrl.searchParams.get("questionId");
  const { userId } = await auth();

  if (!questionId) {
    throw generateApiError(400, "Question ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(questionId || "")) {
    throw generateApiError(400, "Invalid question ID");
  }

  if (!userId) {
    throw generateApiError(400, "User ID is required");
  }

  await dbConnect();
  const save: SaveTypeSchema | null = await Save.findOne({
    question: questionId,
    saver: userId,
  });

  return res.json(
    generateApiResponse(
      200,
      `${save ? "Question is saved" : "Question is not saved"}`,
      save ? true : false
    ),
    {
      status: 200,
    }
  );
});
