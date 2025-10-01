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
import { queryClient } from "@/lib/tanstack-react-query/query-client";

const formSchema = z.object({
  title: z
    .string({ message: "Title must be a string" })
    .trim()
    .nonempty({ message: "Title is required" })
    .min(2, {
      message: "Title must be at least 2 characters.",
    }),
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
  subject: z
    .string({ message: "Subject must be a string" })
    .trim()
    .nonempty({ message: "Subject is required" })
    .min(2, {
      message: "Subject must be at least 2 characters.",
    }),
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
      // queryClient.invalidateQueries({ queryKey: ["questions"] });
      // queryClient.invalidateQueries({ queryKey: ["subjects"] });
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

  // OnSubmit test function
  // async function onSubmit(values: z.infer<typeof formSchema>) {
  //   console.log("Form values:", values);
  // }

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
