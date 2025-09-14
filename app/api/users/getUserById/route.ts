import { NextResponse as res, NextRequest } from "next/server";
import getClerkUserById from "@/lib/helpers/getClerkUserById";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";

export const GET = errorHandler(async (request: NextRequest) => {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    throw generateApiError(400, "UserId is required", ["UserId is required"]);
  }
  const user = await getClerkUserById(userId);
  return res.json(generateApiResponse(200, "User fetched successfully", user), {
    status: 200,
  });
});
