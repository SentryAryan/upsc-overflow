import { NextRequest, NextResponse as res } from "next/server";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import Answer from "@/db/models/answer.model";
import { z } from "zod";
import dbConnect from "@/db/dbConnect";
import mongoose from "mongoose";

const answerSchema = z.object({
  content: z.string().min(1, { message: "Content is required" }),
  question: z.string().min(1, { message: "Question is required" }),
  answerer: z.string().min(1, { message: "Answerer is required" }),
});

export const POST = errorHandler(async (req: NextRequest) => {
  const validatedData = answerSchema.parse(await req.json());
  const { content, question, answerer } = validatedData;

  if (!mongoose.Types.ObjectId.isValid(question)) {
    throw generateApiError(400, "Invalid question ID", ["Invalid question ID"]);
  }

  await dbConnect();

  const createdAnswer = await Answer.create({
    content,
    question,
    answerer,
  });

  return res.json(
    generateApiResponse(201, "Answer created successfully", {
      answer: createdAnswer,
    }),
    {
      status: 201,
    }
  );
});
