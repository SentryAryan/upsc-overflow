"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AnswerWithUser } from "@/app/question/[questionId]/page";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import axios from "axios";
import { toast } from "sonner";
import { useState } from "react";
import TinyMCEFormField from "./TinyMCEFormField";
import { User } from "@clerk/nextjs/server";

const formSchema = z.object({
  content: z.string().min(2, {
    message: "Content must be at least 2 characters.",
  }),
});

export function AnswerForm({
  userId,
  setIsLoadingAnswers,
  questionId,
  setAnswers,
  answers,
}: {
  userId: string;
  setIsLoadingAnswers: (isLoading: boolean) => void;
  questionId: string;
  setAnswers: (answers: AnswerWithUser[]) => void;
  answers: AnswerWithUser[];
}) {
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
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full p-6 border rounded-md space-y-6"
      >
        <TinyMCEFormField
          control={form.control}
          description="Enter your answer"
          name="content"
          label="Answer"
          placeholder="Enter your answer"
        />

        <Button type="submit" className="btn-auth">
          Submit
        </Button>
      </form>
    </Form>
  );
}
