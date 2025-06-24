"use client";

import { AnswerWithUser } from "@/app/question/[questionId]/page";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";
import { setQuestionUpdate } from "../../lib/redux/slices/questionUpdate.slice";
import { RootState } from "../../lib/redux/store";
import HugeRTEFormField from "./HugeRTEFormField2";

const formSchema = z.object({
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
});

export function UpdateAnswerForm({
  userId,
  setIsLoadingAnswers,
  isLoadingAnswers,
  questionId,
  setAnswers,
  answers,
  answerId,
  currentContent,
}: {
  userId: string;
  setIsLoadingAnswers: (isLoading: boolean) => void;
  isLoadingAnswers: boolean;
  questionId: string;
  setAnswers: Dispatch<SetStateAction<AnswerWithUser[]>>;
  answers: AnswerWithUser[];
  answerId: string;
  currentContent: string;
}) {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const dispatch = useDispatch();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: currentContent,
    },
    mode: "all",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoadingAnswers(true);
      const answerUpdateResponse = await axios.patch(
        "/api/answers/updateAnswer",
        {
          ...values,
          question: questionId,
          answerer: userId,
          answerId: answerId,
        }
      );
      console.log("This is the updated answer", answerUpdateResponse);
      const answerResponse = await axios.get(
        `/api/answers/getAnswerById?answerId=${answerUpdateResponse.data.data._id}`
      );
      setAnswers((currentAnswers: AnswerWithUser[]) =>
        currentAnswers.map((answer: AnswerWithUser) =>
          answer._id === answerId
            ? answerResponse.data.data.answerWithCommentsAndUsers
            : answer
        )
      );
      toast.success("Answer updated successfully");
    } catch (error: any) {
      console.log(error);
      const errors = error.response.data.errors.map(
        (error: any) => error.message
      );
      toast.error("Failed to update answer", {
        description: errors.join(", "),
      });
    } finally {
      setIsLoadingAnswers(false);
      form.reset();
      dispatch(setQuestionUpdate(true));
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full p-6 rounded-md space-y-6"
      >
        {/* <TextAreaFormField
          control={form.control}
          description="Enter your answer"
          name="content"
          label="Answer"
          placeholder="Enter your answer"
        /> */}

        <HugeRTEFormField
          control={form.control}
          name="content"
          label="Answer"
          placeholder="Enter your answer"
          isDarkMode={isDarkMode}
        />

        <Button
          type="submit"
          disabled={isLoadingAnswers}
          title="Submit answer"
          className="cursor-pointer"
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}
