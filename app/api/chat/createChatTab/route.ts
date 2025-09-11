import { NextRequest, NextResponse as res } from "next/server";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import dbConnect from "@/db/dbConnect";
import { ChatTabTypeSchema } from "@/db/models/chatTab.model";
import ChatTab from "@/db/models/chatTab.model";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const chatTabSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
});

export const POST = errorHandler(async (req: NextRequest) => {
  const { name } = chatTabSchema.parse(await req.json());
  const { userId } = await auth();

  if (!userId) {
    throw generateApiError(401, "Unauthorized", ["Unauthorized"]);
  }

  await dbConnect();

  const chatTab: ChatTabTypeSchema[] = await ChatTab.create({
    name,
    chatter: userId,
  });
  const chatTabs: ChatTabTypeSchema[] = await ChatTab.find({ chatter: userId });

  return res.json(
    generateApiResponse(201, "Chat tab created successfully", chatTabs),
    {
      status: 201,
    }
  );
});
