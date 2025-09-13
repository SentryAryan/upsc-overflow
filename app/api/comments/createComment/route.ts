import { NextRequest, NextResponse as res } from "next/server";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import Comment from "@/db/models/comment.model";
import { z } from "zod";
import dbConnect from "@/db/dbConnect";
import mongoose from "mongoose";
import getClerkUserById from "../../../../lib/helpers/getClerkUserById";
import Like from "../../../../db/models/like.model";
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
  answer: z.string({ message: "Answer must be a string" }).trim().optional(),
  question: z
    .string({ message: "Question must be a string" })
    .trim()
    .optional(),
  commenter: z
    .string({ message: "Commenter must be a string" })
    .trim()
    .nonempty({ message: "Commenter is required" })
    .min(1, { message: "Commenter must be at least 1 character" }),
});

export const POST = errorHandler(async (req: NextRequest) => {
  // const { content: testContent } = await req.json();
  // console.log("This is the test content", testContent);

  const validatedData = commentSchema.parse(await req.json());
  const { content, answer, question, commenter } = validatedData;

  if (!answer && !question) {
    throw generateApiError(400, "Answer or question ID is required", [
      "Answer or question ID is required",
    ]);
  }
  if (answer && !mongoose.Types.ObjectId.isValid(answer)) {
    throw generateApiError(400, "Invalid answer ID", ["Invalid answer ID"]);
  }
  if (question && !mongoose.Types.ObjectId.isValid(question)) {
    throw generateApiError(400, "Invalid question ID", ["Invalid question ID"]);
  }

  await dbConnect();

  const { userId } = await auth();
  const createdComment = answer
    ? await Comment.create({
        content,
        answer,
        commenter,
      })
    : await Comment.create({
        content,
        question,
        commenter,
      });
  const user = await getClerkUserById(createdComment.commenter);
  const commentLikes = await Like.countDocuments({
    comment: createdComment._id,
    isLiked: true,
  });
  const commentDislikes = await Like.countDocuments({
    comment: createdComment._id,
    isLiked: false,
  });
  const isLikedByLoggedInUser = (await Like.findOne({
    comment: createdComment._id,
    liker: userId,
    isLiked: true,
  }))
    ? true
    : false;
  const isDislikedByLoggedInUser = (await Like.findOne({
    comment: createdComment._id,
    liker: userId,
    isLiked: false,
  }))
    ? true
    : false;
  return res.json(
    generateApiResponse(201, "Comment created successfully", {
      comment: {
        ...createdComment._doc,
        user,
        commentLikes,
        commentDislikes,
        isLikedByLoggedInUser,
        isDislikedByLoggedInUser,
      },
    }),
    {
      status: 201,
    }
  );
});
