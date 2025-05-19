import { NextRequest, NextResponse as res } from "next/server";
import { generateApiResponse } from "./api-response.helper";
import { ApiResponse } from "./api-response.helper";

export const errorHandler =
  (
    routeHandler: (req: NextRequest) => Promise<res<ApiResponse>>
  ): ((req: NextRequest) => Promise<res<ApiResponse>>) =>
  async (req: NextRequest): Promise<res<ApiResponse>> => {
    try {
      return await routeHandler(req);
    } catch (error: any) {
      console.log(error);
      console.log(error.message);
      console.log(error.errors);
      return res.json(
        generateApiResponse(
          error.statusCode || 500,
          error.message || "Internal Server Error",
          {},
          error.errors || [error.message || "Internal Server Error"]
        ),
        {
          status: error.statusCode || 500,
        }
      );
    }
  };
