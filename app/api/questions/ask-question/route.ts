import { NextRequest, NextResponse as res } from "next/server";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import Question from "@/db/models/question.model";
import { z } from "zod";
import dbConnect from "@/db/dbConnect";

const SUBJECT_ENUM = [
  "science",
  "math",
  "english",
  "physics",
  "chemistry",
  "biology",
  "history",
  "geography",
  "other",
] as const;

const questionSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).trim(),
  description: z.string().min(1, { message: "Description is required" }).trim(),
  subject: z.enum(SUBJECT_ENUM, {
    message: "Subject must be a valid subject",
  }),
  tags: z.optional(
    z.array(z.string({ message: "Tag must be a string" }), {
      message: "Tags must be an array of strings",
    })
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
