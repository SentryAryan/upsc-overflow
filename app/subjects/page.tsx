"use client";

import HomePagination from "@/components/Filters/HomePagination";
import SortFilter from "@/components/Filters/SortFilter";
import { LoaderDemo } from "@/components/Loaders/LoaderDemo";
import { setQuestions } from "@/lib/redux/slices/questions.slice";
import { RootState } from "@/lib/redux/store";
import axios from "axios";
import { Book } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import QuestionCard from "@/components/Cards/QuestionCard";
import SearchBar from "@/components/Forms/SearchBar";
import { Spotlight } from "@/components/ui/spotlight";
import subjects from "@/lib/constants/subjects";

export default function SubjectPage() {
  console.log("SubjectPage.jsx");
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
  // console.log("currentPage =", currentPage);
  if (searchParams.get("page") === null) {
    currentPage = 1;
  }
  const sortBy = searchParams.get("sortBy");
  // console.log("sortBy =", sortBy);
  const subject = searchParams.get("subject") || "";
  const dispatch = useDispatch();
  const questions = useSelector(
    (state: RootState) => state.questions.questions
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(0);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/questions/get-all?page=${currentPage}&limit=10&subject=${subject}${
          sortBy ? `&sortBy=${sortBy}` : ""
        }`
      );
      toast.success("Questions fetched successfully");
      dispatch(setQuestions(response.data.data));
      setTotalPages(response.data.data[0]?.totalPages || 0);
    } catch (error: any) {
      console.log(error.response?.data?.message);
      toast.error(error.response?.data?.message || `Questions not found`);

      dispatch(setQuestions([]));
      setTotalPages(0);

      // If invalid page number, push to page 1 with default sortBy
      if (error.response?.data?.errors.includes("Invalid Page Number")) {
        const pathToPush = `?page=1${
          sortBy
            ? sortByOptions.includes(sortBy)
              ? `&sortBy=${sortBy}`
              : `&sortBy=${encodeURIComponent("date-desc")}`
            : ""
        }&subject=${encodeURIComponent(subject)}`;
        router.push(pathToPush);
      }

      // If invalid sortBy, push to page 1 with default sortBy
      if (error.response?.data?.errors.includes("Invalid Sort By")) {
        const pathToPush = `?${
          isNaN(currentPage) || currentPage < 1
            ? `page=1`
            : `page=${currentPage}`
        }&sortBy=${encodeURIComponent(
          "date-desc"
        )}&subject=${encodeURIComponent(subject)}`;
        router.push(pathToPush);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!subjects.includes(subject)) {
      const pathToPush = `?${
        isNaN(currentPage) || currentPage < 1 ? `page=1` : `page=${currentPage}`
      }${
        sortBy
          ? sortByOptions.includes(sortBy)
            ? `&sortBy=${sortBy}`
            : `&sortBy=${encodeURIComponent("date-desc")}`
          : ""
      }&subject=${encodeURIComponent("other")}`;
      toast.error("Invalid subject");
      router.push(pathToPush);
    } else {
      fetchQuestions();
    }
  }, [currentPage, subject, sortBy]);

  return (
    <div className="flex flex-col items-center w-full px-6 md:px-10 pt-12 md:pt-0 gap-4">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-card-foreground">
        <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary dark:border-border card-shadow">
          <Book className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <h1
          className="text-4xl md:text-5xl font-bold bg-clip-text 
        text-transparent bg-gradient-to-b from-accent-foreground to-foreground text-center"
        >
          Questions in subject = "{subject}"({questions.length})
        </h1>
      </div>

      {/* Search Bar */}
      <SearchBar />

      {/* Pagination */}
      <HomePagination
        subject={encodeURIComponent(subject)}
        totalPages={totalPages}
      />

      {/* Sort Filter */}
      <SortFilter />

      {/* Questions */}
      {isLoading ? (
        <div className="flex items-center justify-center h-[5vh] md:h-[70vh]">
          <LoaderDemo />
        </div>
      ) : questions.length === 0 ? (
        <p className="text-center mt-4 text-muted-foreground flex justify-center items-center h-[20vh] sm:h-[30vh]">
          No questions found for this subject.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-8 w-full">
          <Spotlight
            className="-top-160 left-0 md:-top-90 md:left-60"
            fill="#1c9cf0"
          />
          {questions.map((question: any) => (
            <QuestionCard key={question._id} question={question} />
          ))}
        </div>
      )}
    </div>
  );
}
