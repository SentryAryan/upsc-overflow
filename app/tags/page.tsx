"use client";

import HomePagination from "@/components/Filters/HomePagination";
import SortFilter from "@/components/Filters/SortFilter";
import { Tag } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import QuestionCard from "@/components/Cards/QuestionCard";
import SearchBar from "@/components/Forms/SearchBar";
import { Spotlight } from "@/components/ui/spotlight";
import { useQuestionsByTag } from "../../lib/tanstack-react-query/queries";
import PageSkeleton from "@/components/skeletons/PageSkeleton";

export const sortByOptions = [
  "date-desc",
  "date-asc",
  "votes-desc",
  "answers-desc",
  "comments-desc",
  "tags-desc",
];

export default function TagPage() {
  console.log("TagPage.jsx");

  const searchParams = useSearchParams();
  let currentPage = Number(searchParams.get("page"));
  if (searchParams.get("page") === null) {
    currentPage = 1;
  }
  const sortBy = searchParams.get("sortBy");
  const receivedTag = searchParams.get("tag") || "";

  console.log("tag received =", receivedTag);

  const [totalPages, setTotalPages] = useState<number>(0);
  const {
    data: questionsData,
    isLoading: questionsLoading,
    error: questionsError,
  } = useQuestionsByTag({
    page: currentPage,
    sortBy: sortBy || undefined,
    tag: receivedTag || undefined,
  });
  console.log("questionsData =", questionsData);
  console.log("questionsLoading =", questionsLoading);
  console.log("questionsError =", questionsError);

  useEffect(() => {
    if (
      questionsData &&
      questionsData?.length > 0 &&
      questionsData[0]?.totalPages !== totalPages
    ) {
      setTotalPages(questionsData[0]?.totalPages || 0);
    }
  }, [questionsData]);

  return (
    <div className="flex flex-col items-center w-full px-6 md:px-10 pt-12 md:pt-0 min-h-screen gap-4">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-card-foreground">
        <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary dark:border-border card-shadow">
          <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <h1
          className="text-4xl md:text-5xl font-bold bg-clip-text 
        text-transparent bg-gradient-to-b from-accent-foreground to-foreground text-center"
        >
          Questions tagged with "{receivedTag?.[0] === "#" ? "" : "#"}
          {receivedTag}"(
          {questionsData && questionsData?.length > 0
            ? questionsData?.length
            : 0}
          )
        </h1>
      </div>

      {/* Search Bar */}
      <SearchBar />

      {/* Pagination */}
      <HomePagination
        tag={encodeURIComponent(receivedTag)}
        totalPages={totalPages || 0}
      />

      {/* Sort Filter */}
      <SortFilter />

      {/* Questions */}
      {questionsLoading ? (
        <PageSkeleton />
      ) : questionsData ? (
        questionsData?.length === 0 ? (
          <p className="text-center mt-4 text-muted-foreground flex justify-center items-center h-[20vh] sm:h-[30vh]">
            No questions found with this tag.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 w-full">
            <Spotlight
              className="-top-120 left-0 md:-top-80 md:left-60"
              fill="#1c9cf0"
            />
            {questionsData &&
              questionsData?.length > 0 &&
              questionsData?.map((question: any) => (
                <QuestionCard key={question._id} question={question} />
              ))}
          </div>
        )
      ) : (
        <p className="text-center mt-4 text-muted-foreground flex justify-center items-center h-[20vh] sm:h-[30vh]">
          No questions found with this tag.
        </p>
      )}
    </div>
  );
}
