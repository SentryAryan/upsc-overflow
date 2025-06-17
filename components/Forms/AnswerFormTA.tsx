"use client";

import { AnswerWithUser } from "@/app/question/[questionId]/page";
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

export function AnswerFormTA({
  userId,
  setIsLoadingAnswers,
  isLoadingAnswers,
  questionId,
  setAnswers,
  answers,
}: {
  userId: string;
  setIsLoadingAnswers: (isLoading: boolean) => void;
  isLoadingAnswers: boolean;
  questionId: string;
  setAnswers: (answers: AnswerWithUser[]) => void;
  answers: AnswerWithUser[];
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoadingAnswers(true);
      const answer = await axios.post("/api/answers/createAnswer", {
        ...values,
        question: questionId,
        answerer: userId,
      });
      console.log("This is the answer", answer);
      const answerResponse = await axios.get(
        `/api/answers/getAnswerById?answerId=${answer.data.data.answer._id}`
      );
      setAnswers([...answers, answerResponse.data.data.answerWithCommentsAndUsers]);
      toast.success("Answer created successfully");
    } catch (error: any) {
      console.log(error);
      const errors = error.response.data.errors.map(
        (error: any) => error.message
      );
      toast.error("Failed to create answer", {
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
        className="w-full p-6 border rounded-md space-y-6"
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

        <Button type="submit" disabled={isLoadingAnswers} title="Submit answer" className="cursor-pointer">
          Submit
        </Button>
      </form>
    </Form>
  );
} 