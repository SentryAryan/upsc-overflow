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
import { RootState } from "../../lib/redux/store";

const formSchema = z.object({
  title: z
    .string({ message: "Title is required" })
    .min(2, {
      message: "Title must be at least 2 characters.",
    })
    .trim(),
  description: z
    .string({ message: "Description is required" })
    .min(2, {
      message: "Description must be at least 2 characters.",
    })
    .trim(),
  subject: z
    .string({ message: "Subject is required" })
    .min(2, {
      message: "Subject must be at least 2 characters.",
    })
    .trim(),
});

export function AskQuestionFormTA({
  userId,
  isLoading,
  setIsLoading,
}: {
  userId: string | null;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
    },
    mode: "all",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tag, setTag] = useState<string>("");
  const dispatch = useDispatch();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const question = await axios.post("/api/questions/ask-question", {
        ...values,
        asker: userId,
        tags: tags,
      });
      console.log(question);
      toast.success("Question created successfully");
      dispatch(setQuestions([]));
    } catch (error: any) {
      console.log(error);
      const errors = error.response.data.errors.map(
        (error: any) => error.message
      );
      toast.error("Failed to create question", {
        description: errors.join(", "),
      });
    } finally {
      setIsLoading(false);
      form.reset();
      setTags([]);
      setTag("");
    }
  }

  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full p-6 border-3 border-secondary! dark:border-border! card-shadow rounded-md space-y-6 transition-all duration-300 ease-in-out group"
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
        <Button type="submit" variant="default" className="cursor-pointer">
          Submit
        </Button>
      </form>
    </Form>
  );
}
