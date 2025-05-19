"use client";

import { useAuth } from "@clerk/nextjs";
import { AskQuestionForm } from "../../components/Forms/AskQuestionForm";
import { useState } from "react";
import { LoaderDemo } from "@/components/Loaders/LoaderDemo";
import { AskQuestionFormTA } from "@/components/Forms/AskQuestionFormTA";

const AskQuestionPage = () => {
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <h1 className="text-2xl font-bold mb-6">Ask Question</h1>
      {isLoading ? (
        <div className="flex items-center justify-center h-[70vh]">
          <LoaderDemo />
        </div>
      ) : (
        // <AskQuestionForm
        //   userId={userId || null}
        //   isLoading={isLoading}
        //   setIsLoading={setIsLoading}
        // />
        <AskQuestionFormTA
          userId={userId || null}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
    </div>
  );
};

export default AskQuestionPage;
