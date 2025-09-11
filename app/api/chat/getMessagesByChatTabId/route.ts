import dbConnect from "@/db/dbConnect";
import Chat, { ChatTypeSchema } from "@/db/models/chat.model";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { NextRequest, NextResponse as res } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const GET = errorHandler(async (req: NextRequest) => {
  const chatTab = req.nextUrl.searchParams.get("chatTab");
  const { userId } = await auth();

  if (!userId) {
    throw generateApiError(401, "Unauthorized", ["Unauthorized"]);
  }

  await dbConnect();

  const chats: ChatTypeSchema[] = await Chat.find({ chatTab });

  if (chats && chats.length === 0) {
    throw generateApiError(404, "No chats found for this chat tab", [
      "No chats found for this chat tab",
    ]);
  }

  return res.json(
    generateApiResponse(201, "Chats fetched successfully", chats),
    {
      status: 201,
    }
  );
});
