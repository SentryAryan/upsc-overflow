import { NextRequest, NextResponse as res } from "next/server";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import Save, { SaveTypeSchema } from "@/db/models/save.model";
import dbConnect from "@/db/dbConnect";
import mongoose from "mongoose";

export const PUT = errorHandler(async (req: NextRequest) => {
  const { questionId, saver } = await req.json();

  if (!questionId) {
    throw generateApiError(400, "Question ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(questionId || "")) {
    throw generateApiError(400, "Invalid question ID");
  }

  if (!saver) {
    throw generateApiError(400, "Saver ID is required");
  }

  await dbConnect();
  let save: SaveTypeSchema | null | boolean = null;
  save = await Save.findOne({ question: questionId, saver });
  if (save) {
    await Save.deleteOne({ question: questionId, saver });
    save = false;
  } else {
    await Save.create({ question: questionId, saver });
    save = true;
  }

  return res.json(
    generateApiResponse(
      200,
      `${save ? "Saved" : "Unsaved"} successfully`,
      save
    ),
    {
      status: 200,
    }
  );
});
