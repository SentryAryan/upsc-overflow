"use client";

import HomePagination from "@/components/Filters/HomePagination";
import SortFilter from "@/components/Filters/SortFilter";
import SubjectFilter from "@/components/Filters/SubjectFilter2";
import SearchBar from "@/components/Forms/SearchBar";
import { LoaderDemo } from "@/components/Loaders/LoaderDemo";
import { QuestionType } from "@/db/models/question.model";
import {
  setQuestions,
  setTotalPages,
} from "@/lib/redux/slices/questions.slice";
import { RootState } from "@/lib/redux/store";
import axios from "axios";
import { Home as HomeIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
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

export default function HomePage() {
  console.log("QuestionsPage.jsx");
  const sortByOptions = [
    "date-desc",
    "date-asc",
    "votes-desc",
    "answers-desc",
    "comments-desc",
    "tags-desc",
  ];
  const searchParams = useSearchParams();
  const router = useRouter();
  let currentPage = Number(searchParams.get("page"));
  console.log("currentPage =", currentPage);
  if (searchParams.get("page") === null) {
    currentPage = 1;
  }
  const sortBy = searchParams.get("sortBy");
  console.log("sortBy =", sortBy);
  const subject = searchParams.get("subject");
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

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      if (availableSubjects.length === 0) {
        await fetchSubjects();
      }
      const response = await axios.get(
        `/api/questions/get-all?page=${currentPage}&limit=10${
          sortBy ? `&sortBy=${encodeURIComponent(sortBy)}` : ""
        }${subject ? `&subject=${encodeURIComponent(subject)}` : ""}&homePage=true`
      );
      toast.success("Questions fetched successfully");
      dispatch(setQuestions(response.data.data));
      dispatch(setTotalPages(response.data.data[0].totalPages));
    } catch (error: any) {
      console.log(error.response?.data?.message);
      toast.error(error.response?.data?.message || `Questions not found`);

      dispatch(setQuestions([]));
      dispatch(setTotalPages(0));

      // If invalid page number, push to page 1 with default sortBy
      if (error.response?.data?.errors.includes("Invalid Page Number")) {
        const pathToPush = `?page=1${
          sortBy
            ? sortByOptions.includes(sortBy)
              ? `&sortBy=${sortBy}`
              : `&sortBy=${encodeURIComponent("date-desc")}`
            : ""
        }${subject ? `&subject=${encodeURIComponent(subject)}` : ""}`;
        router.push(pathToPush);
      }

      // If invalid sortBy, push to page 1 with default sortBy
      if (error.response?.data?.errors.includes("Invalid Sort By")) {
        const pathToPush = `?${
          isNaN(currentPage) || currentPage < 1
            ? `page=1`
            : `page=${currentPage}`
        }&sortBy=${encodeURIComponent("date-desc")}${
          subject ? `&subject=${encodeURIComponent(subject)}` : ""
        }`;
        router.push(pathToPush);
      }

      // If invalid subject, push to page 1 with default sortBy with no subject parameter to display questions of all subjects
      if (error.response?.data?.errors.includes("Invalid Subject")) {
        const pathToPush = `?${
          isNaN(currentPage) || currentPage < 1
            ? `page=1`
            : `page=${currentPage}`
        }${
          sortBy
            ? sortByOptions.includes(sortBy)
              ? `&sortBy=${sortBy}`
              : `&sortBy=${encodeURIComponent("date-desc")}`
            : ""
        }`;
        router.push(pathToPush);
      }
    } finally {
      setIsLoading(false);
      dispatch(setSelectedSubject(subject || null));
    }
  };

  const handleSelectSubject = (subject: string | null) => {
    dispatch(setSelectedSubject(subject));
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get("/api/questions/getAllSubjects");
      setAvailableSubjects(response.data.data);
    } catch (error: any) {
      console.log(error.response.data.message);
      toast.error(`Subjects not found, visit previous pages`);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [currentPage, sortBy, subject]);

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
          Home({questions.length})
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
        <div className="flex items-center justify-center h-[5vh] md:h-[10vh]">
          <LoaderDemo />
        </div>
      ) : questions.length === 0 ? (
        <p className="text-center mt-4 text-muted-foreground animate-slide-up flex justify-center items-center h-[20vh] sm:h-[30vh]">
          No questions found.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-8 w-full">
          <Spotlight
            className="-top-190 left-0 md:-top-120 md:left-60"
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
