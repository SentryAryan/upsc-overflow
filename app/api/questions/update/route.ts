import { NextRequest, NextResponse as res } from "next/server";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import Question from "@/db/models/question.model";
import { z } from "zod";
import dbConnect from "@/db/dbConnect";
import { auth, currentUser } from "@clerk/nextjs/server";
import mongoose from "mongoose";

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

const questionUpdateSchema = z.object({
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
  id: z.string().min(1, { message: "ID is required" }),
});

export const PATCH = errorHandler(async (req: NextRequest) => {
  const validatedData = questionUpdateSchema.parse(await req.json());
  let { title, description, subject, tags, asker, id } = validatedData;
  console.log(`${title}t`);
  const { userId } = await auth();

  if (!userId) {
    throw generateApiError(401, "Unauthorized", ["Unauthorized"]);
  }

  if (!title.endsWith("?")) {
    title = title + "?";
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw generateApiError(400, "Invalid question ID", ["Invalid question ID"]);
  }

  if (asker !== userId) {
    throw generateApiError(403, "Forbidden", ["Forbidden"]);
  }

  await dbConnect();

  const updatedQuestion = await Question.findByIdAndUpdate(
    id,
    {
      title,
      description,
      subject,
      tags,
      asker,
    },
    { new: true, runValidators: true }
  );

  if (!updatedQuestion) {
    throw generateApiError(404, "Question not found", ["Question not found"]);
  }

  return res.json(
    generateApiResponse(200, "Question updated successfully", updatedQuestion),
    {
      status: 200,
    }
  );
});
