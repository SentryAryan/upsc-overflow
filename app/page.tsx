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
import { Home as HomeIcon } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import QuestionCard from "../components/Cards/QuestionCard";
import {
  setAvailableSubjects,
  setSelectedSubject,
} from "../lib/redux/slices/filterSubjects.slice";
import { Spotlight } from "../components/ui/spotlight";

export interface QuestionCardProps extends QuestionType {
  likesAnswersComments: {
    likes: number;
    dislikes: number;
    answers: number;
    comments: number;
  };
}

export default function HomePage() {
  console.log("HomePage.jsx");
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
  const availableSubjects = useSelector(
    (state: RootState) => state.filterSubjects.availableSubjects
  );
  const selectedSubject = useSelector(
    (state: RootState) => state.filterSubjects.selectedSubject
  );
  const previousPath = useSelector(
    (state: RootState) => state.previousPath.previousPath
  );
  const previousSubject = useSelector(
    (state: RootState) => state.previousPath.previousSubject
  );
  const previousTag = useSelector(
    (state: RootState) => state.previousPath.previousTag
  );
  const previousQuestion = useSelector(
    (state: RootState) => state.previousPath.previousQuestion
  );
  const previousSortBy = useSelector(
    (state: RootState) => state.previousPath.previousSortBy
  );
  const previousPage = useSelector(
    (state: RootState) => state.previousPath.previousPage
  );
  const questionUpdate = useSelector(
    (state: RootState) => state.questionUpdate
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
        `/api/questions/get-all?page=${currentPage}&limit=10${
          sortBy ? `&sortBy=${encodeURIComponent(sortBy)}` : ""
        }${subject ? `&subject=${encodeURIComponent(subject)}` : ""}`
      );
      console.log(response.data.data);
      console.log(typeof response.data.data[0]?.createdAt);
      console.log(response.data.data[0]);
      dispatch(setQuestions(response.data.data));
      dispatch(setTotalPages(response.data.data[0].totalPages));
      // const uniqueSubjects: string[] = [];
      // fetchedQuestions.forEach((question: QuestionType) => {
      //   if (!uniqueSubjects.includes(question.subject)) {
      //     uniqueSubjects.push(question.subject);
      //   }
      // });
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
      const response = await axios.get("/api/questions/getAllSubjects");
      dispatch(setAvailableSubjects(response.data.data));
    } catch (error: any) {
      console.log(error.response.data.message);
      toast.error(`Subjects not found, visit previous pages`);
    }
  };

  useEffect(() => {
    // if (questions.length === 0) {
    //   fetchQuestions();
    // }
    // if (availableSubjects.length === 0) {
    //   fetchSubjects();
    // }
    // console.log(
    //   `selectedSubject = ${selectedSubject === null ? "null" : selectedSubject}`
    // );
    // console.log(
    //   `previousSubject = ${previousSubject === null ? "null" : previousSubject}`
    // );
    // console.log(
    //   `searchParams.get("subject") !== previousSubject = ${
    //     searchParams.get("subject") !== previousSubject
    //   }`
    // );
    // console.log(
    //   `searchParams.get("tag") !== previousTag = ${
    //     searchParams.get("tag") !== previousTag
    //   }`
    // );
    // console.log(
    //   `searchParams.get("question") !== previousQuestion = ${
    //     searchParams.get("question") !== previousQuestion
    //   }`
    // );
    // console.log(
    //   `searchParams.get("sortBy") !== previousSortBy = ${
    //     searchParams.get("sortBy") !== previousSortBy
    //   }`
    // );
    // console.log(
    //   `Number(searchParams.get("page")) !== previousPage = ${
    //     Number(searchParams.get("page")) !== previousPage
    //   }`
    // );
    // console.log(`pathname !== previousPath = ${pathname !== previousPath}`);
    // console.log(`Number(null) = ${Number(null)}`);
    // console.log(
    //   `Number(searchParams.get("page")) = ${Number(searchParams.get("page"))}`
    // );
    // console.log(`questionUpdate = ${questionUpdate}`);

    //TODO: Add back the previous path check
    // if (
    //   pathname !== previousPath ||
    //   searchParams.get("subject") !== previousSubject ||
    //   searchParams.get("tag") !== previousTag ||
    //   searchParams.get("question") !== previousQuestion ||
    //   searchParams.get("sortBy") !== previousSortBy ||
    //   Number(searchParams.get("page")) !== previousPage ||
    //   questionUpdate
    // ) {
    //   fetchQuestions();
    // } else {
    //   setIsLoading(false);
    // }

    fetchQuestions();
  }, [currentPage, sortBy, subject]);

  // const filteredQuestions = selectedSubject
  //   ? questions.filter((q: QuestionType) => q.subject === selectedSubject)
  //   : questions;

  return (
    <div
      className={`flex flex-col items-center w-full p-10 min-h-screen gap-4 ${
        isSignedIn ? "" : "pt-20"
      }`}
    >
      {/* Title */}
      <div className="flex items-center justify-center gap-4 text-card-foreground">
        <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary dark:border-border card-shadow">
          <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text 
        text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
          Home
        </h1>
      </div>
      <SearchBar />
      <HomePagination totalPages={totalPages} subject={subject || undefined} />

      <SubjectFilter
        subjects={availableSubjects}
        selectedSubject={selectedSubject}
        handleSelectSubject={handleSelectSubject}
      />

      <SortFilter />

      {isLoading ? (
        <div className="flex items-center justify-center h-[5vh] md:h-[70vh]">
          <LoaderDemo />
        </div>
      ) : questions.length === 0 && selectedSubject !== null ? (
        <p className="text-center mt-4 text-muted-foreground animate-slide-up">
          No questions found for the selected subject.
        </p>
      ) : currentPage > totalPages ? (
        <p className="text-center mt-4 text-muted-foreground animate-slide-up">
          No more pages currently
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          <Spotlight
            className="-top-40 left-0 md:-top-20 md:left-60"
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
