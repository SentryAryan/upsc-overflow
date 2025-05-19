import { NextRequest, NextResponse as res } from "next/server";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiResponse } from "../../../lib/helpers/api-response.helper";

export const GET = errorHandler(async (req: NextRequest) => {
  return res.json(generateApiResponse(200, "Health check successful", {}), {
    status: 200,
  });
});
