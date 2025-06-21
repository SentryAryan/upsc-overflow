import { NextRequest, NextResponse as res } from "next/server";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import Answer from "@/db/models/answer.model";
import { z } from "zod";
import dbConnect from "@/db/dbConnect";
import mongoose from "mongoose";
import { auth } from "@clerk/nextjs/server";

const answerSchema = z.object({
  content: z
    .string({ message: "Content must be a string" })
    .trim()
    .nonempty({ message: "Content is required" })
    .refine(
      (html: string) => {
        // Check if there are any images in the HTML
        const hasImages = /<img[^>]*>/i.test(html);

        // Remove all HTML tags to get plain text
        const plainText = html.replace(/<[^>]*>/g, "");

        // Check for other media elements
        const hasMedia = /<(video|audio|iframe)[^>]*>/i.test(html);

        // Replace HTML entities like &nbsp; with spaces and trim
        const cleanText = plainText
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .trim();

        // Valid if either has meaningful text OR has images
        return cleanText.length > 0 || hasImages || hasMedia;
      },
      {
        message:
          "Description must contain either text content(atleast 1 character) or atleast 1 media(image, video, audio) or a non-empty table or non-empty code block",
      }
    ),
  question: z
    .string({ message: "Question must be a string" })
    .trim()
    .nonempty({ message: "Question is required" })
    .min(1, { message: "Question is required" }),
  answerer: z
    .string({ message: "Answerer must be a string" })
    .trim()
    .nonempty({ message: "Answerer is required" })
    .min(1, { message: "Answerer is required" }),
  answerId: z
    .string({ message: "Answer ID must be a string" })
    .trim()
    .nonempty({ message: "Answer ID is required" })
    .min(1, { message: "Answer ID is required" }),
});

export const PATCH = errorHandler(async (req: NextRequest) => {
  const validatedData = answerSchema.parse(await req.json());
  const { content, question, answerer, answerId } = validatedData;

  if (!mongoose.Types.ObjectId.isValid(question)) {
    throw generateApiError(400, "Invalid question ID", ["Invalid question ID"]);
  }

  if (!mongoose.Types.ObjectId.isValid(answerId)) {
    throw generateApiError(400, "Invalid answer ID", ["Invalid answer ID"]);
  }

  const { userId } = await auth();

  if (!userId) {
    throw generateApiError(401, "Unauthorized", ["Unauthorized"]);
  }

  await dbConnect();

  const answer = await Answer.findById(answerId);

  if (answer.answerer.toString() !== answerer) {
    throw generateApiError(403, "Forbidden", ["Forbidden"]);
  }

  if (answer.answerer.toString() !== userId) {
    throw generateApiError(403, "Forbidden", ["Forbidden"]);
  }

  if (answer.question.toString() !== question) {
    throw generateApiError(403, "Forbidden", ["Forbidden"]);
  }

  answer.content = content;
  await answer.save();

  // const updatedAnswer = await Answer.findByIdAndUpdate(answerId, {
  //   content,
  //   question,
  //   answerer,
  // });

  return res.json(
    generateApiResponse(201, "Answer updated successfully", answer),
    {
      status: 201,
    }
  );
});
