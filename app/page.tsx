"use client";

import HomePagination from "@/components/Filters/HomePagination";
import SortFilter from "@/components/Filters/SortFilter";
import SubjectFilter from "@/components/Filters/SubjectFilter2";
import SearchBar from "@/components/Forms/SearchBar";
import PageSkeleton from "@/components/skeletons/PageSkeleton";
import { QuestionType } from "@/db/models/question.model";
import { RootState } from "@/lib/redux/store";
import { useQuestions, useSubjects } from "@/lib/tanstack-react-query/queries";
import { Home as HomeIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import QuestionCard from "../components/Cards/QuestionCard";
import { Spotlight } from "../components/ui/spotlight";
import { setSelectedSubject } from "../lib/redux/slices/filterSubjects.slice";

export interface QuestionCardProps extends QuestionType {
  likesAnswersComments: {
    likes: number;
    dislikes: number;
    answers: number;
    comments: number;
  };
}

export const sortByOptions = [
  "date-desc",
  "date-asc",
  "votes-desc",
  "answers-desc",
  "comments-desc",
  "tags-desc",
];

export default function HomePage() {
  console.log("-------------------------------------------------");
  console.log("QuestionsPage.jsx");

  const searchParams = useSearchParams();
  let currentPage = Number(searchParams.get("page"));
  console.log("currentPage =", currentPage);
  if (searchParams.get("page") === null) {
    currentPage = 1;
  }
  const sortBy = searchParams.get("sortBy");
  console.log("sortBy =", sortBy);
  const subject = searchParams.get("subject");
  const dispatch = useDispatch();
  const selectedSubject = useSelector(
    (state: RootState) => state.filterSubjects.selectedSubject
  );
  const [currTotalPages, setCurrTotalPages] = useState<number>(0);
  console.log("currTotalPages =", currTotalPages);

  const handleSelectSubject = (subject: string | null) => {
    dispatch(setSelectedSubject(subject));
  };

  const {
    data: questionsData,
    isLoading: questionsLoading,
    error: questionsError,
  } = useQuestions({
    page: currentPage,
    sortBy: sortBy || undefined,
    subject: subject || undefined,
  });
  console.log("questionsData =", questionsData);
  console.log("questionsLoading =", questionsLoading);
  console.log("questionsError =", questionsError);

  const { data: fetchedSubjects, isLoading: subjectsLoading } = useSubjects();
  console.log("fetchedSubjects =", fetchedSubjects);
  console.log("subjectsLoading =", subjectsLoading);

  useEffect(() => {
    if (
      questionsData &&
      questionsData?.length > 0 &&
      questionsData[0]?.totalPages !== currTotalPages
    ) {
      setCurrTotalPages(questionsData[0]?.totalPages || 0);
    }
    if (selectedSubject !== subject) {
      dispatch(setSelectedSubject(subject));
    }
  }, [questionsData]);

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
          Home(
          {questionsData && questionsData?.length > 0
            ? questionsData.length
            : 0}
          )
        </h1>
      </div>
      <SearchBar />
      <HomePagination
        totalPages={currTotalPages}
        subject={subject || undefined}
      />

      <SubjectFilter
        subjects={fetchedSubjects || []}
        selectedSubject={selectedSubject}
        handleSelectSubject={handleSelectSubject}
        isLoading={subjectsLoading}
      />

      <SortFilter />

      {questionsLoading ? (
        <PageSkeleton />
      ) : questionsData ? (
        questionsData?.length === 0 ? (
          <p className="text-center mt-4 text-muted-foreground animate-slide-up flex justify-center items-center h-[20vh] sm:h-[30vh]">
            No questions found.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 w-full">
            <Spotlight
              className="-top-190 left-0 md:-top-120 md:left-60"
              fill="#1c9cf0"
            />
            {questionsData &&
              questionsData?.length > 0 &&
              questionsData?.map((question: QuestionCardProps) => (
                <QuestionCard key={question._id} question={question} />
              ))}
          </div>
        )
      ) : (
        <p className="text-center mt-4 text-muted-foreground animate-slide-up flex justify-center items-center h-[20vh] sm:h-[30vh]">
          No questions found.
        </p>
      )}
    </div>
  );
}
