import { NextRequest, NextResponse as res } from "next/server";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import Question from "@/db/models/question.model";
import { z } from "zod";
import dbConnect from "@/db/dbConnect";

const questionSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  subject: z.string().min(1, { message: "Subject is required" }),
  tags: z.array(
    z.string({ invalid_type_error: "Tags must be an array of strings" }),
    {
      invalid_type_error: "Tags must be an array of strings",
    }
  ),
  asker: z.string().min(1, { message: "Asker is required" }),
});

export const POST = errorHandler(async (req: NextRequest) => {
  const validatedData = questionSchema.parse(await req.json());
  let { title, description, subject, tags, asker } = validatedData;

  if (!title.endsWith("?")) {
    title = title + "?";
  }

  await dbConnect();

  const askedQuestion = await Question.create({
    title,
    description,
    subject,
    tags,
    asker,
  });

  return res.json(
    generateApiResponse(201, "Question asked successfully", {
      question: askedQuestion,
    }),
    {
      status: 201,
    }
  );
});
