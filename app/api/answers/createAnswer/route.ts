import { NextRequest, NextResponse as res } from "next/server";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import Answer from "@/db/models/answer.model";
import { z } from "zod";
import dbConnect from "@/db/dbConnect";
import mongoose from "mongoose";

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
          .replace(/&apos;/g, "'")
          .replace(/&copy;/g, "©")
          .replace(/&reg;/g, "®")
          .replace(/&trade;/g, "™")
          .replace(/&euro;/g, "€")
          .replace(/&pound;/g, "£")
          .replace(/&yen;/g, "¥")
          .trim();

        // Valid if either has meaningful text OR has images
        return cleanText.length > 0 || hasImages || hasMedia;
      },
      {
        message:
          "Content must contain either text content(atleast 1 character) or atleast 1 media(image, video, audio) or a non-empty table or non-empty code block",
      }
    ),
  question: z
    .string({ message: "Question must be a string" })
    .trim()
    .nonempty({ message: "Question is required" })
    .min(1, { message: "Question must be at least 1 character" }),
  answerer: z
    .string({ message: "Answerer must be a string" })
    .trim()
    .nonempty({ message: "Answerer is required" })
    .min(1, { message: "Answerer must be at least 1 character" }),
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
