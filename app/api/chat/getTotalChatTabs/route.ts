import { NextRequest, NextResponse as res } from "next/server";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import dbConnect from "@/db/dbConnect";
import { ChatTabTypeSchema } from "@/db/models/chatTab.model";
import ChatTab from "@/db/models/chatTab.model";
import { auth } from "@clerk/nextjs/server";

export const GET = errorHandler(async (req: NextRequest) => {
  const { userId } = await auth();

  if (!userId) {
    throw generateApiError(401, "Unauthorized", ["Unauthorized"]);
  }

  await dbConnect();

  const totalChatTabs: number = await ChatTab.countDocuments({
    chatter: userId,
  });

  if (totalChatTabs === 0) {
    throw generateApiError(404, "No chat tabs found", ["No chat tabs found"]);
  }

  return res.json(
    generateApiResponse(201, "Chat tabs fetched successfully", totalChatTabs),
    {
      status: 201,
    }
  );
});
