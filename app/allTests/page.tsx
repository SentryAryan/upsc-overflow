"use client";

import TestCard from "@/components/Cards/TestCard";
import SearchBar from "@/components/Forms/SearchBar";
import PulsatingLoader from "@/components/Loaders/PulsatingLoader";
import { Spotlight } from "@/components/ui/spotlight";
import { Doc } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Home as HomeIcon } from "lucide-react";
import { api } from "../../convex/_generated/api";

export default function AllTestsPage() {
  const { user } = useUser();
  const tests = useQuery(
    api["test_table_functions"].testTableFunctions.getAllTestsOfUser,
    {
      creator: user?.id || "",
    }
  );

  return (
    <div
      className={`mx-auto flex flex-col items-center w-full px-6 md:px-10 gap-8`}
    >
      {/* Title */}
      <div className="flex items-center justify-center gap-4 text-card-foreground mt-10 md:mt-0">
        <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary dark:border-border card-shadow">
          <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <h1
          className="text-4xl md:text-5xl font-bold bg-clip-text 
        text-transparent bg-gradient-to-b from-accent-foreground to-foreground text-center"
        >
          All Tests
        </h1>
      </div>
      <SearchBar />

      {/* Pagination */}
      {/* <HomePagination totalPages={totalPages} subject={subject || undefined} /> */}

      {/* Subject Filter */}
      {/* <SubjectFilter
        subjects={availableSubjects}
        selectedSubject={selectedSubject}
        handleSelectSubject={handleSelectSubject}
      /> */}

      {/* Sort Filter(sort by date, votes, answers, comments, tags) */}
      {/* <SortFilter /> */}

      {tests === undefined ? (
        <div className="flex items-center justify-center h-[5vh] md:h-[10vh]">
          <PulsatingLoader />
        </div>
      ) : tests.length === 0 ? (
        <p className="text-center mt-4 text-muted-foreground animate-slide-up flex justify-center items-center h-[20vh] sm:h-[30vh]">
          No questions found.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-8 w-full">
          <Spotlight
            className="-top-190 left-0 md:-top-120 md:left-60"
            fill="#1c9cf0"
          />
          {tests.map((test: Doc<"tests">) => (
            <TestCard key={test._id} test={test} />
          ))}
        </div>
      )}
    </div>
  );
}
