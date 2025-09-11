import { NextRequest, NextResponse as res } from "next/server";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import dbConnect from "@/db/dbConnect";
import { ChatTabTypeSchema } from "@/db/models/chatTab.model";
import ChatTab from "@/db/models/chatTab.model";
import { z } from "zod";
import mongoose from "mongoose";

const chatTabSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  id: z.string().nonempty({ message: "ID is required" }),
});

export const PATCH = errorHandler(async (req: NextRequest) => {
  const { id, name } = chatTabSchema.parse(await req.json());

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw generateApiError(400, "Invalid chat tab ID", ["Invalid chat tab ID"]);
  }

  await dbConnect();

  const chatTab: ChatTabTypeSchema[] | null = await ChatTab.findByIdAndUpdate(
    id,
    { name },
    { new: true }
  );

  if (!chatTab) {
    throw generateApiError(404, "Chat tab not found", ["Chat tab not found"]);
  }

  return res.json(
    generateApiResponse(201, "Chat tab created successfully", chatTab),
    {
      status: 201,
    }
  );
});
