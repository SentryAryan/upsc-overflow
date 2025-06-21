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
  title: z
    .string({ message: "Title must be a string" })
    .trim()
    .nonempty({ message: "Title is required" })
    .min(2, { message: "Title must be at least 2 characters." }),
  description: z
    .string({ message: "Description must be a string" })
    .trim()
    .nonempty({ message: "Description is required" })
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
          "Description must contain either text content(atleast 1 character) or atleast 1 media(image, video, audio) or a non-empty table or non-empty code block",
      }
    ),
  subject: z.enum(SUBJECT_ENUM, {
    message: "Subject must be a valid subject",
  }),
  tags: z.optional(
    z.array(
      z
        .string({ message: "Tag must be a string" })
        .trim()
        .nonempty({ message: "Tag is required" }),
      {
        message: "Tags must be an array of strings",
      }
    )
  ),
  asker: z
    .string({ message: "Asker must be a string" })
    .trim()
    .nonempty({ message: "Asker is required" })
    .min(1, { message: "Asker must be at least 1 character" }),
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
