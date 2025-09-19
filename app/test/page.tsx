"use client";

import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Brain } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface Question {
  id: number;
  text: string;
}

export default function TestPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>(Array(10).fill(""));
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateQuestions = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const generatedQuestions = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      text: `This is dummy question number ${
        i + 1
      }. What is the answer to this question?`,
    }));
    setQuestions(generatedQuestions);
    setAnswers(Array(10).fill(""));
    toast.success("10 new questions have been generated!");
    setIsLoading(false);
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // I will manage this, as requested.
    console.log("Submitted Answers:", answers);
    toast.info("Submit functionality is a placeholder.");
  };

  return (
    <div className="w-full flex flex-col gap-6 items-center justify-center px-4 md:px-6 py-8">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="#1c9cf0"
      />
      {/* Title */}
      <div className="flex items-center justify-center gap-4 text-card-foreground mt-6 md:mt-2">
        <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary dark:border-border card-shadow-no-hover">
          <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-accent-foreground to-foreground text-center">
          AI Test Generator
        </h1>
      </div>

      {/* Generate Button */}
      <div className="my-4">
        <Button
          onClick={handleGenerateQuestions}
          disabled={isLoading}
          size="lg"
          className="gap-2"
        >
          {isLoading ? "Generating..." : "Generate Test Questions"}
        </Button>
      </div>

      {questions.length > 0 && (
        <div
          className={cn(
            "w-full max-w-4xl bg-background border-mode rounded-lg p-4 md:p-6 card-shadow-no-hover scroll-smooth"
          )}
        >
          <h2 className="text-2xl font-bold mb-4 text-center">
            Generated Questions
          </h2>
          <div className="flex flex-col gap-4">
            {questions.map((q) => (
              <div
                key={q.id}
                className="p-3 rounded-md border-mode bg-primary/5"
              >
                <p className="font-semibold">
                  {q.id}. {q.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {questions.length > 0 && (
        <div
          className={cn(
            "w-full max-w-4xl bg-background border-mode rounded-lg p-4 md:p-6 card-shadow-no-hover scroll-smooth mt-4"
          )}
        >
          <h2 className="text-2xl font-bold mb-4 text-center">Your Answers</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {answers.map((_, index) => (
              <div key={index} className="flex flex-col gap-2">
                <label
                  htmlFor={`answer-${index}`}
                  className="font-semibold text-primary"
                >
                  Answer for Question {index + 1}
                </label>
                <Textarea
                  id={`answer-${index}`}
                  value={answers[index]}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder={`Type your answer for question ${index + 1}...`}
                  className="bg-background border-mode"
                  rows={3}
                />
              </div>
            ))}
            <Button type="submit" className="mt-4 self-center" size="lg">
              Submit Answers
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
