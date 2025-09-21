import dbConnect from "@/db/dbConnect";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { NextRequest, NextResponse as res } from "next/server";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import Test from "@/db/models/test.model";
import { z } from "zod";

const testSchema = z.object({
  questions: z.string().nonempty({ message: "Questions are required" }),
  answers: z.array(z.string()).nonempty({ message: "Answers are required" }),
  review: z.string().nonempty({ message: "Review is required" }),
  creator: z.string().nonempty({ message: "Creator is required" }),
  ai_model: z.string().nonempty({ message: "AI model is required" }),
});

export const POST = errorHandler(async (req: NextRequest) => {
  const { questions, answers, review, ai_model, creator } = testSchema.parse(
    await req.json()
  );

  await dbConnect();

  const test = await Test.create({
    questions,
    answers,
    review,
    ai_model,
    creator,
  });

  return res.json(generateApiResponse(201, "Test stored successfully", test));
});
