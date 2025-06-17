"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { setQuestions } from "@/lib/redux/slices/questions.slice";
import axios from "axios";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import InputFormField from "./InputFormField";
import SelectFormField from "./SelectFormField";
import TagsInput from "./TagsInput";
import TextAreaFormField from "./TextAreaFormField";
import TiptapFormField from "./TiptapFormField";
import HugeRTEFormField from "./HugeRTEFormField2";
import TinyMCEFormField from "./TinyMCEFormField";
import { QuestionType } from "@/db/models/question.model";
import { RootState } from "../../lib/redux/store";

const formSchema = z.object({
  title: z
    .string({message: "Title is required"})
    .min(2, {
      message: "Title must be at least 2 characters.",
    })
    .trim(),
  description: z
    .string({message: "Description is required"})
    .min(2, {
      message: "Description must be at least 2 characters.",
    })
    .trim(),
  subject: z
    .string({message: "Subject is required"})
    .min(2, {
      message: "Subject must be at least 2 characters.",
    })
    .trim(),
});

export function UpdateQuestionForm({
  userId,
  id,
  title,
  description,
  subject,
  currentTags,
  question,
  setIsLoading,
  setQuestion,
}: {
  userId: string | null;
  id: string;
  title: string;
  description: string;
  subject: string;
  currentTags: string[];
  question: QuestionType;
  setIsLoading: (isLoading: boolean) => void;
  setQuestion: (question: QuestionType) => void;
}) {
  console.log("UpdateQuestionForm.tsx");
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title,
      description,
      subject,
    },
    mode: "all",
  });
  const [tags, setTags] = useState<string[]>(currentTags);
  const [tag, setTag] = useState<string>("");
  const dispatch = useDispatch();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const response = await axios.patch("/api/questions/update", {
        id: id,
        ...values,
        asker: userId,
        tags: tags,
      });
      console.log("question in UpdateQuestionForm.tsx", question);
      console.log(
        "response.data.data in UpdateQuestionForm.tsx",
        response.data.data
      );
      const updatedQuestion = {
        ...question,
        ...response.data.data,
      };
      console.log("updatedQuestion in UpdateQuestionForm.tsx", updatedQuestion);
      setQuestion(updatedQuestion);
      toast.success("Question updated successfully");
      dispatch(setQuestions([]));
    } catch (error: any) {
      console.log(error);
      const errors = error.response.data.errors.map(
        (error: any) => error.message
      );
      toast.error("Failed to update question", {
        description: errors.join(", "),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full p-6 border-4 border-border rounded-md space-y-6"
      >
        <InputFormField
          control={form.control}
          name="title"
          label="Question"
          placeholder="Enter your question"
        />
        {/* <TextAreaFormField
          control={form.control}
          name="description"
          label="Question Description"
          placeholder="Enter your question description"
          description="Enter your description"
        /> */}
        {/* <TiptapFormField
          control={form.control}
          name="description"
          label="Description"
          placeholder="Enter your content..."
        /> */}
        <HugeRTEFormField
          control={form.control}
          name="description"
          label="Description"
          placeholder="Enter your content..."
          isDarkMode={isDarkMode}
        />
        {/* <TinyMCEFormField
          control={form.control}
          name="description"
          label="Description"
          placeholder="Enter your content..."
        /> */}
        <SelectFormField
          control={form.control}
          name="subject"
          label="Subject"
          placeholder="Select your subject"
          options={[
            "science",
            "math",
            "english",
            "physics",
            "chemistry",
            "biology",
            "history",
            "geography",
            "other",
          ]}
          isDarkMode={isDarkMode}
        />
        <TagsInput tags={tags} setTags={setTags} tag={tag} setTag={setTag} />
        <Button
          type="submit"
          className="cursor-pointer"
          title="Submit question"
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}
