import dbConnect from "@/db/dbConnect";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { NextRequest, NextResponse as res } from "next/server";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import Test from "@/db/models/test.model";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import mongoose from "mongoose";
import { auth } from "@clerk/nextjs/server";
import getClerkUserById from "@/lib/helpers/getClerkUserById";

export const GET = errorHandler(async (req: NextRequest) => {
  const testId = req.nextUrl.searchParams.get("testId");
  const { userId } = await auth();

  if (!userId) {
    throw generateApiError(401, "Unauthorized", ["Unauthorized"]);
  }

  if (!testId) {
    throw generateApiError(400, "Test ID is required", ["Test ID is required"]);
  }

  if (!mongoose.Types.ObjectId.isValid(testId)) {
    throw generateApiError(400, "Invalid test ID", ["Invalid test ID"]);
  }

  await dbConnect();

  const test = await Test.findOne({ _id: testId, creator: userId });

  if (!test) {
    throw generateApiError(404, "Test not found", ["Test not found"]);
  }

  return res.json(generateApiResponse(201, "Test fetched successfully", test));
});
