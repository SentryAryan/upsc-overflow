"use client";

import { AskQuestionFormTA } from "@/components/Forms/AskQuestionFormTA";
import { LoaderDemo } from "@/components/Loaders/LoaderDemo";
import { useAuth } from "@clerk/nextjs";
import { FileQuestion } from "lucide-react";
import { useState } from "react";
import { Spotlight } from "../../components/ui/spotlight";

const AskQuestionPage = () => {
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 rounded-lg min-h-screen w-full max-w-6xl mx-auto">
      <div className="w-full px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 text-card-foreground mb-2">
            <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary dark:border-border card-shadow">
              <FileQuestion className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text 
        text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
              Ask Question
            </h1>
          </div>
          <p className="text-muted-foreground text-base">
            Share your question with the community and get expert answers
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[40vh] md:h-[70vh] bg-background rounded-lg shadow-md border-mode">
            <LoaderDemo />
          </div>
        ) : (
          <div className="flex justify-center bg-background rounded-lg w-full">
            {/* <AskQuestionForm
              userId={userId || null}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            /> */}
            <Spotlight
              className="-top-190 left-0 md:-top-20 md:left-60"
              fill="#1c9cf0"
            />
            <AskQuestionFormTA
              userId={userId || null}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AskQuestionPage;
