"use client";

import HomePagination from "@/components/Filters/HomePagination";
import SortFilter from "@/components/Filters/SortFilter";
import SubjectFilter from "@/components/Filters/SubjectFilter2";
import SearchBar from "@/components/Forms/SearchBar";
import { LoaderDemo } from "@/components/Loaders/LoaderDemo";
import { QuestionType } from "@/db/models/question.model";
import {
  setPreviousPage,
  setPreviousPath,
  setPreviousQuestion,
  setPreviousSortBy,
  setPreviousSubject,
  setPreviousTag,
} from "@/lib/redux/slices/previousPath.slice";
import {
  setQuestions,
  setTotalPages,
} from "@/lib/redux/slices/questions.slice";
import { setQuestionUpdate } from "@/lib/redux/slices/questionUpdate.slice";
import { RootState } from "@/lib/redux/store";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { Bookmark } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import QuestionCard from "@/components/Cards/QuestionCard";
import { Spotlight } from "@/components/ui/spotlight";
import { setSelectedSubject } from "@/lib/redux/slices/filterSubjects.slice";

export interface QuestionCardProps extends QuestionType {
  likesAnswersComments: {
    likes: number;
    dislikes: number;
    answers: number;
    comments: number;
  };
}

export default function SavedPage() {
  console.log("SavedPage.jsx");
  const { user, isSignedIn } = useUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const questions = useSelector(
    (state: RootState) => state.questions.questions
  );
  const totalPages = useSelector(
    (state: RootState) => state.questions.totalPages
  );
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const selectedSubject = useSelector(
    (state: RootState) => state.filterSubjects.selectedSubject
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const currentPage = Number(searchParams.get("page")) || 1;
  const sortBy = searchParams.get("sortBy");
  const subject = searchParams.get("subject");

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      if (availableSubjects.length === 0) {
        await fetchSubjects();
      }
      const response = await axios.get(
        `/api/questions/getAllSaved?page=${currentPage}&limit=10${
          sortBy ? `&sortBy=${encodeURIComponent(sortBy)}` : ""
        }${subject ? `&subject=${encodeURIComponent(subject)}` : ""}`
      );
      dispatch(setQuestions(response.data.data));
      dispatch(setTotalPages(response.data.data[0].totalPages));
    } catch (error: any) {
      console.log(error);
      console.log(error.response.data.message);
      toast.error(
        error.response.data.message ||
          "Questions not found, visit previous pages"
      );
      dispatch(setQuestions([]));
      dispatch(setTotalPages(0));
    } finally {
      setIsLoading(false);
      dispatch(setPreviousPath(pathname));
      dispatch(setPreviousSubject(searchParams.get("subject")));
      dispatch(setPreviousTag(searchParams.get("tag")));
      dispatch(setPreviousQuestion(searchParams.get("question")));
      dispatch(setPreviousSortBy(sortBy));
      dispatch(setPreviousPage(Number(searchParams.get("page"))));
      dispatch(setSelectedSubject(subject || null));
      dispatch(setQuestionUpdate(false));
    }
  };

  const handleSelectSubject = (subject: string | null) => {
    dispatch(setSelectedSubject(subject));
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get("/api/subjects/getAllSaved");
      setAvailableSubjects(response.data.data);
    } catch (error: any) {
      console.log(error.response.data.message);
      toast.error(`Subjects not found, visit previous pages`);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [currentPage, sortBy, subject]);

  // const filteredQuestions = selectedSubject
  //   ? questions.filter((q: QuestionType) => q.subject === selectedSubject)
  //   : questions;

  return (
    <div
      className={`flex flex-col justify-center items-center w-full px-10 py-0 min-[640px]:py-14 md:py-4 gap-8`}
    >
      {/* Title */}
      <div className="flex items-center justify-center gap-4 text-card-foreground ml-14 md:ml-0">
        <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary dark:border-border card-shadow">
          <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <h1
          className="text-4xl md:text-5xl font-bold bg-clip-text 
        text-transparent bg-gradient-to-b from-accent-foreground to-foreground md:text-center"
        >
          Saved Questions
        </h1>
      </div>

      {/* Search Bar */}
      <SearchBar />

      {/* Pagination */}
      <HomePagination totalPages={totalPages} subject={subject || undefined} />

      {/* Subject Filter */}
      <SubjectFilter
        subjects={availableSubjects}
        selectedSubject={selectedSubject}
        handleSelectSubject={handleSelectSubject}
      />

      {/* Sort Filter */}
      <SortFilter />

      {isLoading ? (
        <div className="flex items-center justify-center h-[5vh] md:h-[70vh]">
          <LoaderDemo />
        </div>
      ) : questions.length === 0 && selectedSubject !== null ? (
        <p className="text-center mt-4 text-muted-foreground animate-slide-up">
          No questions found for the selected subject.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-8 w-full">
          <Spotlight
            className="-top-75 left-0 md:-top-40 md:left-60"
            fill="#1c9cf0"
          />
          {questions.map((question: QuestionCardProps) => (
            <QuestionCard key={question._id} question={question} />
          ))}
        </div>
      )}
    </div>
  );
}
