"use client";

import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { Brain } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { SiGooglegemini, SiNvidia } from "@icons-pack/react-simple-icons";
import { SelectModelForm } from "../../components/Forms/select-model/SelectModelForm";
import subjects from "@/lib/constants/subjects";
import { Response } from "@/components/ai-elements/response";
import { SelectSubjectForTest } from "@/components/Forms/select-subject/SelectSubjectForTest";
import PulsatingLoader from "../../components/Loaders/PulsatingLoader";

interface Question {
  id: number;
  text: string;
}

export const models = [
  {
    name: "DeepSeek: DeepSeek V3.1 (free)",
    value: "deepseek/deepseek-chat-v3.1:free",
    isReasoningAvailable: true,
    provider: "openrouter",
    icon: Brain,
  },
  {
    name: "TNG: DeepSeek R1T2 Chimera (free)",
    value: "tngtech/deepseek-r1t2-chimera:free",
    isReasoningAvailable: true,
    provider: "openrouter",
    icon: Brain,
  },
  {
    name: "Google: Gemini 2.5 Pro",
    value: "models/gemini-2.5-pro",
    isReasoningAvailable: true,
    provider: "google",
    icon: SiGooglegemini,
  },
  {
    name: "Sonoma Sky Alpha",
    value: "openrouter/sonoma-sky-alpha",
    isReasoningAvailable: true,
    provider: "openrouter",
    icon: Brain,
  },
  {
    name: "NVIDIA: Nemotron Nano 9B V2 (free)",
    value: "nvidia/nemotron-nano-9b-v2:free",
    isReasoningAvailable: true,
    provider: "openrouter",
    icon: SiNvidia,
  },
  {
    name: "Z.AI: GLM 4.5 Air (free)",
    value: "z-ai/glm-4.5-air:free",
    isReasoningAvailable: true,
    provider: "openrouter",
    icon: Brain,
  },
];

export default function TestPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>(Array(10).fill(""));
  const [selectedModel, setSelectedModel] = useState(models[0].value);
  const [reasoning, setReasoning] = useState(true);
  const [subject, setSubject] = useState<string>("other");
  const { messages, sendMessage, stop, status, setMessages, error } = useChat();
  const [isQuestionsGenerated, setIsQuestionsGenerated] = useState(false);

  const handleGenerateQuestions = async () => {
    try {
      sendMessage(
        { text: `Generate 10 questions for me on ${subject} subject` },
        {
          body: {
            model: selectedModel,
            reasoning: models.find((model) => model.value === selectedModel)
              ?.isReasoningAvailable
              ? reasoning
              : false,
            provider: models.find((model) => model.value === selectedModel)
              ?.provider,
          },
        }
      );
      setIsQuestionsGenerated(true);
    } catch (error) {
      console.log(error);
    }
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
    <div
      className="max-w-7xl w-full rounded-md flex flex-col gap-6 items-center justify-center px-4 md:px-6 py-8
    min-h-screen bg-background card-shadow-no-hover"
    >
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
      <div className="my-4 flex flex-col gap-4 w-full max-w-sm">
        {/* Select Subject */}
        {!isQuestionsGenerated && (
          <div className="flex flex-col gap-1 w-full">
            <p className="text-foreground font-semibold">Select Subject</p>
            <SelectSubjectForTest
              subjects={subjects}
              selectedSubject={subject}
              setSelectedSubject={setSubject}
            />
          </div>
        )}

        {/* Select Model */}
        {!isQuestionsGenerated && (
          <div className="flex flex-col gap-1 w-full">
            <p className="text-foreground font-semibold">Select Model</p>
            <SelectModelForm
              models={models}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
            />
          </div>
        )}

        {/* Generate Questions Button */}
        {!isQuestionsGenerated && (
          <Button
            onClick={handleGenerateQuestions}
            disabled={status === "streaming" || status === "submitted"}
            variant="outline"
            size="lg"
            className="gap-2 bg-background! hover:scale-105! transition-transform! ease-in-out! duration-300! cursor-pointer font-[900]!"
          >
            {status === "streaming" || status === "submitted"
              ? "Generating..."
              : "Generate Test Questions"}
          </Button>
        )}
      </div>

      {/* Loader */}
      {(status === "submitted" || status === "streaming") && (
        <div className="w-full max-w-4xl bg-background border-mode rounded-lg p-4 md:p-6 card-shadow-no-hover scroll-smooth mt-4">
          <PulsatingLoader />
        </div>
      )}

      {messages.length > 0 && (
        <div
          className={cn(
            "w-full bg-background border-mode rounded-lg p-4 md:p-6 card-shadow-no-hover scroll-smooth"
          )}
        >
          <h2 className="text-2xl font-bold mb-4 text-center">
            Generated Questions
          </h2>
          <div className="flex flex-col gap-4">
            {messages.length > 0 &&
              messages[messages.length - 1].role === "assistant" &&
              messages[messages.length - 1].parts
                .filter((part) => part.type === "text")
                .map((part) => (
                  <div
                    key={part.text}
                    className="p-3 rounded-md border-mode bg-primary/5"
                  >
                    <Response>{part.text}</Response>
                  </div>
                ))}
          </div>
        </div>
      )}

      {messages.length > 0 &&
        messages[messages.length - 1].role === "assistant" && (
          <div
            className={cn(
              "w-full bg-background border-mode rounded-lg p-4 md:p-6 card-shadow-no-hover scroll-smooth mt-4"
            )}
          >
            <h2 className="text-2xl font-bold mb-4 text-center">
              Your Answers
            </h2>
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
