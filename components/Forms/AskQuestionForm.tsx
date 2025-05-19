"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import InputFormField from "./InputFormField";
import SelectFormField from "./SelectFormField";
import CheckBoxFormField from "./CheckBoxFormField";
import axios from "axios";
import { toast } from "sonner";
import { useState } from "react";
import TagsInput from "./TagsInput";
import TextAreaFormField from "./TextAreaFormField";
import TinyMCEFormField from "./TinyMCEFormField";
import { setQuestions } from "@/lib/redux/slices/questions.slice";
import { useDispatch } from "react-redux";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  subject: z.string().min(2, {
    message: "Subject must be at least 2 characters.",
  }),
});

const tags = [
  {
    id: "science",
    label: "Science",
  },
  {
    id: "math",
    label: "Math",
  },
  {
    id: "english",
    label: "English",
  },
  {
    id: "physics",
    label: "Desktop",
  },
  {
    id: "chemistry",
    label: "Chemistry",
  },
  {
    id: "biology",
    label: "Biology",
  },
  {
    id: "history",
    label: "History",
  },
  {
    id: "geography",
    label: "Geography",
  },
  {
    id: "other",
    label: "Other",
  },
];

export function AskQuestionForm({
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-2xl p-6 border rounded-md space-y-6"
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
          label="Description"
          placeholder="Enter your description"
        /> */}
        <TinyMCEFormField
          control={form.control}
          description="Enter your description"
          name="description"
          label="Question Description"
          placeholder="Enter your question description"
        />
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
        />
        <TagsInput tags={tags} setTags={setTags} tag={tag} setTag={setTag} />
        <Button type="submit" className="btn-auth">
          Submit
        </Button>
      </form>
    </Form>
  );
}
