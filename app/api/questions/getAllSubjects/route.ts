import Question from "@/db/models/question.model";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { NextRequest, NextResponse as res } from "next/server";
import dbConnect from "@/db/dbConnect";

export const GET = errorHandler(async (req: NextRequest) => {
  await dbConnect();

  const uniqueSubjects: string[] = await Question.distinct("subject");

  return res.json(
    generateApiResponse(200, "Subjects fetched successfully", uniqueSubjects)
  );
});
