"use client";

import {
  AnswerWithUser,
  CommentWithUser,
} from "@/app/question/[questionId]/page";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import TextAreaFormField from "./TextAreaFormField";
import HugeRTEFormField from "./HugeRTEFormField2";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../lib/redux/store";
import { setQuestionUpdate } from "../../lib/redux/slices/questionUpdate.slice";

const formSchema = z.object({
  content: z.string().min(2, {
    message: "Content must be at least 2 characters.",
  }),
});

export function CommentFormTA({
  userId,
  questionId,
  setAnswers,
  answers,
  answerId,
  isCommentLoading,
  setIsCommentLoading,
  questionComments,
  setQuestionComments,
  isQuestionCommentLoading,
  setIsQuestionCommentLoading,
}: {
  userId: string;
  isCommentLoading: string;
  setIsCommentLoading: (isLoading: string) => void;
  questionId: string;
  setAnswers?: (answers: AnswerWithUser[]) => void;
  answers?: AnswerWithUser[];
  answerId?: string;
  questionComments?: CommentWithUser[];
  setQuestionComments?: (comments: CommentWithUser[]) => void;
  isQuestionCommentLoading: boolean;
  setIsQuestionCommentLoading: (isLoading: boolean) => void;
}) {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const dispatch = useDispatch();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
    mode: "all",
  });

  async function createAnswerComment(values: z.infer<typeof formSchema>) {
    if (answerId && setAnswers && answers) {
      try {
        setIsCommentLoading(answerId);
        const comment = await axios.post("/api/comments/createComment", {
          ...values,
          answer: answerId,
          commenter: userId,
        });
        console.log("This is the comment", comment);

        const answersResponse = await axios.get(
          `/api/answers/getAnswerById?answerId=${answerId}`
        );

        // Create a new array with the updated answer replacing the old one
        const updatedAnswers = answers.map((answer) =>
          answer._id === answerId
            ? answersResponse.data.data.answerWithCommentsAndUsers
            : answer
        );

        setAnswers(updatedAnswers);
        toast.success("Comment created successfully");
      } catch (error: any) {
        console.log(error);
        const errors = error.response.data.errors.map(
          (error: any) => error.message
        );
        toast.error("Failed to create comment", {
          description: errors.join(", "),
        });
      } finally {
        setIsCommentLoading("");
        form.reset();
        dispatch(setQuestionUpdate(true));
      }
    }
  }

  async function createQuestionComment(values: z.infer<typeof formSchema>) {
    if (setQuestionComments && questionComments) {
      try {
        setIsQuestionCommentLoading(true);
        const response = await axios.post("/api/comments/createComment", {
          ...values,
          question: questionId,
          commenter: userId,
        });
        console.log("This is the comment", response);

        setQuestionComments([...questionComments, response.data.data.comment]);
        toast.success("Comment created successfully");
      } catch (error: any) {
        console.log(error);
        const errors = error.response.data.errors.map(
          (error: any) => error.message
        );
        toast.error("Failed to create comment", {
          description: errors.join(", "),
        });
      } finally {
        setIsQuestionCommentLoading(false);
        form.reset();
        dispatch(setQuestionUpdate(true));
      }
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (answerId) {
      await createAnswerComment(values);
    } else {
      await createQuestionComment(values);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full p-2 rounded-md space-y-6"
      >
        {/* <TextAreaFormField
          control={form.control}
          description="Enter your comment"
          name="content"
          label="Comment"
          placeholder="Enter your comment"
        /> */}
        <HugeRTEFormField
          control={form.control}
          name="content"
          label="Comment"
          placeholder="Enter your comment"
          isDarkMode={isDarkMode}
        />

        <Button
          type="submit"
          disabled={isQuestionCommentLoading || isCommentLoading === answerId}
          title="Submit comment"
          className="cursor-pointer"
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}
