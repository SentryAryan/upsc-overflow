"use client";

import HomePagination from "@/components/Filters/HomePagination";
import SortFilter from "@/components/Filters/SortFilter";
import { LoaderDemo } from "@/components/Loaders/LoaderDemo";
import { setQuestions } from "@/lib/redux/slices/questions.slice";
import { RootState } from "@/lib/redux/store";
import axios from "axios";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import QuestionCard from "../../components/Cards/QuestionCard";
import SearchBar from "../../components/Forms/SearchBar";
import { Spotlight } from "../../components/ui/spotlight";

export default function QuestionsPage() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const questions = useSelector(
    (state: RootState) => state.questions.questions
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentPage = Number(searchParams.get("page")) || 1;
  const questionQuery = searchParams.get("question") || "";
  const [totalPages, setTotalPages] = useState<number>(0);
  const sortBy = searchParams.get("sortBy");

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/questions/get-all?page=${currentPage}&limit=10&question=${encodeURIComponent(
          questionQuery
        )}${sortBy ? `&sortBy=${encodeURIComponent(sortBy)}` : ""}`
      );
      dispatch(setQuestions(response.data.data));
      setTotalPages(response.data.data[0]?.totalPages || 0);
    } catch (error: any) {
      dispatch(setQuestions([]));
      setTotalPages(0);
      console.log(error.response?.data?.message);
      toast.error(`Questions not found, visit previous pages`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [currentPage, questionQuery, sortBy]);

  return (
    <div className="flex flex-col items-center w-full p-10 min-h-screen gap-4">
      <div className="flex items-center justify-center gap-3 text-card-foreground">
        <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary dark:border-border card-shadow">
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text 
        text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
          Search results for "{questionQuery}"
        </h1>
      </div>
      <SearchBar />

      <HomePagination
        question={encodeURIComponent(questionQuery)}
        totalPages={totalPages}
      />

      <SortFilter />

      {isLoading ? (
        <div className="flex items-center justify-center h-[5vh] md:h-[70vh]">
          <LoaderDemo />
        </div>
      ) : questions.length === 0 ? (
        <p className="text-center mt-4 text-muted-foreground">
          No questions found for this query.
        </p>
      ) : currentPage > totalPages ? (
        <p className="text-center mt-4 text-muted-foreground">No more pages</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
          <Spotlight
            className="-top-40 left-0 md:-top-20 md:left-60"
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
