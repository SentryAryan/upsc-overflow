"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import axios from "axios";
import { toast } from "sonner";
import { Send } from "lucide-react";
import SubscriptionInputFormField from "./SubscriptionInputFormField";

const formSchema = z.object({
  email: z
    .string({ message: "Email must be a string" })
    .trim()
    .toLowerCase()
    .nonempty({ message: "Email is required" })
    .email({ message: "Invalid email" }),
});

export function SubscriptionForm({
  isLoading,
  setIsLoading,
}: {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const subscription = await axios.post("/api/subscription/create", {
        ...values,
      });
      console.log(subscription.data.data);
      toast.success("Subscription created successfully for " + values.email);
    } catch (error: any) {
      console.log(error);
      const errors = error.response.data.errors.map(
        (error: any) => error.message || error
      );
      toast.error("Failed to create subscription", {
        description: errors.join(", "),
      });
    } finally {
      setIsLoading(false);
      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="relative w-full">
        <SubscriptionInputFormField
          control={form.control}
          name="email"
          label="Email"
          placeholder="Enter your email"
          className="backdrop-blur-sm"
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-0.5 top-6.5 h-7 w-7 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
        >
          <Send className="h-3 w-3" />
          <span className="sr-only">Subscribe</span>
        </Button>
      </form>
    </Form>
  );
}
