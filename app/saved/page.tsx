"use client";

import QuestionCard from "@/components/Cards/QuestionCard";
import HomePagination from "@/components/Filters/HomePagination";
import SortFilter from "@/components/Filters/SortFilter";
import SubjectFilter from "@/components/Filters/SubjectFilter2";
import SearchBar from "@/components/Forms/SearchBar";
import { LoaderDemo } from "@/components/Loaders/LoaderDemo";
import { Spotlight } from "@/components/ui/spotlight";
import { QuestionType } from "@/db/models/question.model";
import axios from "axios";
import { Bookmark } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  const sortByOptions = [
    "saved-date-desc",
    "saved-date-asc",
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
  // console.log("currentPage =", currentPage);
  if (searchParams.get("page") === null) {
    currentPage = 1;
  }
  const sortBy = searchParams.get("sortBy");
  // console.log("sortBy =", sortBy);
  const subject = searchParams.get("subject");
  const [questions, setQuestions] = useState<QuestionCardProps[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
      toast.success("Questions fetched successfully");
      setQuestions(response.data.data);
      setTotalPages(response.data.data[0].totalPages);
    } catch (error: any) {
      console.log(error.response?.data?.message);
      toast.error(error.response?.data?.message || `Questions not found`);

      setQuestions([]);
      setTotalPages(0);

      // If invalid page number, push to page 1 with default sortBy
      if (error.response?.data?.errors.includes("Invalid Page Number")) {
        const pathToPush = `?page=1${
          sortBy
            ? sortByOptions.includes(sortBy)
              ? `&sortBy=${sortBy}`
              : `&sortBy=${encodeURIComponent("saved-date-desc")}`
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
        }&sortBy=${encodeURIComponent("saved-date-desc")}${
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
              : `&sortBy=${encodeURIComponent("saved-date-desc")}`
            : ""
        }`;
        router.push(pathToPush);
      }
    } finally {
      setIsLoading(false);
      setSelectedSubject(subject || null);
    }
  };

  const handleSelectSubject = (subject: string | null) => {
    setSelectedSubject(subject);
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

  return (
    <div
      className={`flex flex-col justify-center items-center w-full px-6 md:px-10 pt-12 md:pt-0 gap-8`}
    >
      {/* Title */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-card-foreground">
        <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary dark:border-border card-shadow">
          <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <h1
          className="text-4xl md:text-5xl font-bold bg-clip-text 
        text-transparent bg-gradient-to-b from-accent-foreground to-foreground md:text-center"
        >
          Saved Questions({questions.length})
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
      <SortFilter sortFilterType="saved" />

      {isLoading ? (
        <div className="flex items-center justify-center h-[5vh] md:h-[10vh]">
          <LoaderDemo />
        </div>
      ) : questions.length === 0 ? (
        <p className="text-center mt-4 text-muted-foreground animate-slide-up flex justify-center items-center h-[20vh] sm:h-[30vh]">
          No questions found
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
