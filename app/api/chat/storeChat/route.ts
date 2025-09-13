import dbConnect from "@/db/dbConnect";
import Chat from "@/db/models/chat.model";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { UIMessage } from "ai";
import mongoose from "mongoose";
import { NextRequest, NextResponse as res } from "next/server";
import { z } from "zod";

const chatSchema = z.object({
  chatTab: z.string().nonempty({ message: "Chat Tab is required" }),
  message: z.custom<UIMessage>(),
  ai_model: z.string().nonempty({ message: "AI Model is required" }),
});

export const POST = errorHandler(async (req: NextRequest) => {
  const validatedData = chatSchema.parse(await req.json());
  let { message, chatTab, ai_model } = validatedData;

  if (!mongoose.Types.ObjectId.isValid(chatTab)) {
    throw generateApiError(400, "Invalid chat ID", ["Invalid chat ID"]);
  }

  await dbConnect();

  const createdChat = await Chat.create({
    chatTab,
    message,
    ai_model,
  });

  return res.json(
    generateApiResponse(201, "Chat created successfully", createdChat),
    {
      status: 201,
    }
  );
});
