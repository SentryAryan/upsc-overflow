import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { NextRequest, NextResponse as res } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import Save from "@/db/models/save.model";
import dbConnect from "@/db/dbConnect";

export const GET = errorHandler(async (req: NextRequest) => {
  const { userId } = await auth();

  if (!userId) {
    throw generateApiError(
      400,
      "User ID is required, kindly login to continue",
      ["User ID is required, kindly login to continue"]
    );
  }
  
  await dbConnect();

  const savedQuestions = await Save.find({
    saver: userId,
  }).populate("question");

  const uniqueSavedSubjects = [
    ...new Set(
      savedQuestions.map((savedQuestion) => savedQuestion.question.subject)
    ),
  ];

  return res.json(
    generateApiResponse(
      200,
      "Subjects fetched successfully",
      uniqueSavedSubjects
    )
  );
});
