import { NextRequest, NextResponse as res } from "next/server";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import Answer from "@/db/models/answer.model";
import Comment from "@/db/models/comment.model";
import { z } from "zod";
import dbConnect from "@/db/dbConnect";
import mongoose from "mongoose";
import { auth } from "@clerk/nextjs/server";

const commentSchema = z.object({
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
  question: z.optional(
    z
      .string({ message: "Question must be a string" })
      .trim()
      .nonempty({ message: "Question is required" })
      .min(1, { message: "Question must be at least 1 character" })
  ),
  answer: z.optional(
    z
      .string({ message: "Answer must be a string" })
      .trim()
      .nonempty({ message: "Answer is required" })
      .min(1, { message: "Answer must be at least 1 character" })
  ),
  commenter: z
    .string({ message: "Commenter must be a string" })
    .trim()
    .nonempty({ message: "Commenter is required" })
    .min(1, { message: "Commenter must be at least 1 character" }),
  commentId: z
    .string({ message: "Comment ID must be a string" })
    .trim()
    .nonempty({ message: "Comment ID is required" })
    .min(1, { message: "Answer ID must be at least 1 character" }),
});

export const PATCH = errorHandler(async (req: NextRequest) => {
  const validatedData = commentSchema.parse(await req.json());
  const { content, question, answer, commenter, commentId } = validatedData;

  if (question && !mongoose.Types.ObjectId.isValid(question)) {
    throw generateApiError(400, "Invalid question ID", ["Invalid question ID"]);
  }

  if (answer && !mongoose.Types.ObjectId.isValid(answer)) {
    throw generateApiError(400, "Invalid answer ID", ["Invalid answer ID"]);
  }

  const { userId } = await auth();

  if (!userId) {
    throw generateApiError(401, "Unauthorized", ["Unauthorized"]);
  }

  await dbConnect();

  const comment = await Comment.findById(commentId);

  if (comment.commenter.toString() !== userId) {
    throw generateApiError(403, "Forbidden", ["Forbidden"]);
  }

  if (comment.commenter.toString() !== commenter) {
    throw generateApiError(403, "Forbidden", ["Forbidden"]);
  }

  comment.content = content;
  await comment.save();

  // const updatedComment = await Comment.findByIdAndUpdate(commentId, {
  //   content,
  //   answer,
  //   question,
  //   commenter,
  // });

  return res.json(
    generateApiResponse(201, "Comment updated successfully", comment),
    {
      status: 201,
    }
  );
});
