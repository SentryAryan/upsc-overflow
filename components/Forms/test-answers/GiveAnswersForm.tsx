"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import TextareaFormField from "../TextAreaFormField";

const makeFormSchema = (numAnswers: number) => {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (let i = 0; i < numAnswers; i++) {
    shape[`answer-${i + 1}`] = z
      .string()
      .trim()
      .nonempty({ message: "Answer is required" })
      .min(1, { message: "Answer is required" })
      .max(500, { message: "Answer must be at most 500 characters" });
  }
  return z.object(shape);
};

export function GiveAnswersForm({
  numberOfAnswers,
  onAnswersSubmit,
  setAnswers,
}: {
  numberOfAnswers: number;
  onAnswersSubmit: (answers: string[]) => void;
  setAnswers: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const formSchema = makeFormSchema(numberOfAnswers);

  const defaultValues: Record<string, string> = {};
  for (let i = 0; i < numberOfAnswers; i++) {
    defaultValues[`answer-${i + 1}`] = "";
  }
  const form = useForm<Record<string, string>>({
    resolver: zodResolver(formSchema as any),
    defaultValues,
    mode: "all",
  });

  async function onSubmit(values: Record<string, string>) {
    try {
      console.log("This is the values", values);
      onAnswersSubmit(Object.values(values));
      setAnswers(Object.values(values));
      toast.success("Answers created successfully, generating review...");
    } catch (error: any) {
      console.log(error);
      const errors = error.response.data.errors.map(
        (error: any) => error.message
      );
      toast.error("Failed to create answers", {
        description: errors.join(", "),
      });
    } finally {
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full p-6 bg-background! rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-3 border-border space-y-6"
      >
        {Array.from({ length: numberOfAnswers }).map((_, index) => (
          <TextareaFormField
            key={index}
            control={form.control}
            name={`answer-${index + 1}`}
            label={`Answer ${index + 1}`}
            placeholder={`Enter your answer ${index + 1}`}
          />
        ))}
        <Button type="submit" variant="outline">
          Submit
        </Button>
      </form>
    </Form>
  );
}
