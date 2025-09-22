"use client";

import PulsatingLoader from "@/components/Loaders/PulsatingLoader";
import { Response } from "@/components/ai-elements/response";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Book, Brain } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function TestViewPage() {
  // const [testData, setTestData] = useState<TestData | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const testId = searchParams.get("testId");
  const testData = useQuery(
    api["test_table_functions"].testTableFunctions.getTestById,
    {
      id: testId as Id<"tests">,
    }
  );

  // if testData is undefined, show loading spinner
  if (testData === undefined) {
    return (
      <div className="max-w-7xl w-full rounded-md flex flex-col gap-6 items-center justify-center px-4 md:px-6 py-8 min-h-screen bg-background card-shadow-no-hover">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="#1c9cf0"
        />
        <div className="flex items-center justify-center gap-4 text-card-foreground mt-6 md:mt-2">
          <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary dark:border-border card-shadow-no-hover">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-accent-foreground to-foreground text-center">
            AI Test Viewer
          </h1>
        </div>
        <div className="w-full max-w-4xl rounded-lg p-4 md:p-6 scroll-smooth mt-4">
          <PulsatingLoader />
        </div>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="max-w-7xl w-full rounded-md flex flex-col gap-6 items-center justify-center px-4 md:px-6 py-8 min-h-screen bg-background card-shadow-no-hover">
  //       <Spotlight
  //         className="-top-40 left-0 md:left-60 md:-top-20"
  //         fill="#1c9cf0"
  //       />
  //       <div className="flex items-center justify-center gap-4 text-card-foreground mt-6 md:mt-2">
  //         <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary dark:border-border card-shadow-no-hover">
  //           <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
  //         </span>
  //         <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-accent-foreground to-foreground text-center">
  //           AI Test Viewer
  //         </h1>
  //       </div>
  //       <div className="w-full max-w-4xl rounded-lg p-4 md:p-6 scroll-smooth mt-4">
  //         <div className="text-center text-red-500">
  //           <p>Error: {error}</p>
  //           <Button
  //             onClick={() => router.push("/test")}
  //             className="mt-4"
  //           >
  //             Generate New Test
  //           </Button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // if testData is null, show no test data found
  if (testData === null) {
    return (
      <div className="max-w-7xl w-full rounded-md flex flex-col gap-6 items-center justify-center px-4 md:px-6 py-8 min-h-screen bg-background card-shadow-no-hover">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="#1c9cf0"
        />
        <div className="flex items-center justify-center gap-4 text-card-foreground mt-6 md:mt-2">
          <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary dark:border-border card-shadow-no-hover">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-accent-foreground to-foreground text-center">
            AI Test Viewer
          </h1>
        </div>
        <div className="w-full max-w-4xl rounded-lg p-4 md:p-6 scroll-smooth mt-4">
          <div className="text-center">
            <p>No test data found</p>
            <Button onClick={() => router.push("/test")} className="mt-4">
              Generate New Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Parse questions from the stored format
  const parseQuestions = (questionsText: string): string[] => {
    // Assuming questions are separated by newlines or numbered
    return questionsText.split("\n").filter((q) => q.trim() !== "");
  };

  const questions = parseQuestions(
    testData.questions || "Questions not available"
  );

  return (
    <div className="max-w-7xl w-full rounded-md flex flex-col gap-6 items-center justify-center px-4 md:px-6 py-8 min-h-screen bg-background card-shadow-no-hover">
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
          AI Test Viewer
        </h1>
      </div>

      {/* Test Info */}
      <div className="w-full max-w-4xl rounded-lg p-4 md:p-6 bg-background border border-mode card-shadow-no-hover mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Generated on:{" "}
              {new Date(testData._creationTime).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-center">
            {testData.subject && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    className="text-md px-3 py-2 rounded-full bg-primary/10 text-primary whitespace-nowrap cursor-pointer hover:bg-primary/20 transition-all duration-300 font-[900] border border-primary dark:border-border w-full flex justify-center items-center"
                    onClick={() => {
                      router.push(
                        `/subjects?subject=${encodeURIComponent(testData.subject)}`
                      );
                    }}
                  >
                    <Book className="h-3 w-3 mr-1" />
                    {testData.subject}
                  </TooltipTrigger>
                  <TooltipContent
                    onClick={() => {
                      router.push(
                        `/subjects?subject=${encodeURIComponent(testData.subject)}`
                      );
                    }}
                    className="cursor-pointer"
                  >
                    View all tests in {testData.subject}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button
              onClick={() => router.push("/test")}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto hover:scale-105 transition-all duration-300 ease-in-out"
            >
              Generate New Test
            </Button>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div
        className={cn(
          "w-full max-w-4xl bg-background border-mode rounded-lg p-4 md:p-6 card-shadow-no-hover scroll-smooth"
        )}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Test Questions</h2>
        <div className="p-3 rounded-md border-mode bg-primary/5">
          <Response className="leading-relaxed p-2">
            {testData.questions || "Questions not available"}
          </Response>
        </div>
      </div>

      {/* Answers Section */}
      <div
        className={cn(
          "w-full max-w-4xl bg-background border-mode rounded-lg p-4 md:p-6 card-shadow-no-hover scroll-smooth mt-4"
        )}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Your Answers</h2>
        <div className="space-y-4">
          {testData.answers.length > 0 ? (
            testData.answers.map((answer, index) => (
              <div
                key={index}
                className="p-3 rounded-md border-mode bg-primary/5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">Answer {index + 1}:</span>
                </div>
                <Response className="leading-relaxed p-2">{answer}</Response>
              </div>
            ))
          ) : (
            <div className="p-3 rounded-md border-mode bg-primary/5">
              <Response className="leading-relaxed p-2">
                Answers not available
              </Response>
            </div>
          )}
        </div>
      </div>

      {/* Review Section */}
      <div
        className={cn(
          "w-full max-w-4xl bg-background border-mode rounded-lg p-4 md:p-6 card-shadow-no-hover scroll-smooth mt-4"
        )}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">AI Review</h2>
        <div className="p-3 rounded-md border-mode bg-primary/5">
          <Response className="leading-relaxed p-2">
            {testData.review || "Review not available"}
          </Response>
        </div>
      </div>
    </div>
  );
}
