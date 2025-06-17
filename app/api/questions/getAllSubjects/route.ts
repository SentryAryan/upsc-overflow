import { subjects } from "@/db/models/question.model";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { NextRequest, NextResponse as res } from "next/server";

export const GET = errorHandler(async (req: NextRequest) => {
  return res.json(
    generateApiResponse(200, "Subjects fetched successfully", subjects)
  );
});
