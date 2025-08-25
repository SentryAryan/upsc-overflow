"use client";

import HomePagination from "@/components/Filters/HomePagination";
import SortFilter from "@/components/Filters/SortFilter";
import { LoaderDemo } from "@/components/Loaders/LoaderDemo";
import { setQuestions } from "@/lib/redux/slices/questions.slice";
import { RootState } from "@/lib/redux/store";
import axios from "axios";
import { Tag } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import QuestionCard from "../../components/Cards/QuestionCard";
import SearchBar from "../../components/Forms/SearchBar";
import { Spotlight } from "../../components/ui/spotlight";

export default function TagPage() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const questions = useSelector(
    (state: RootState) => state.questions.questions
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentPage = Number(searchParams.get("page")) || 1;
  const receivedTag = searchParams.get("tag") || "";
  const decodedTag = decodeURIComponent(receivedTag); // Decode URL-encoded spaces (%20)
  const sortBy = searchParams.get("sortBy");

  console.log("tag received =", receivedTag);
  console.log("tag by decodedURIComponent =", decodedTag);
  console.log("tag by encodeURIComponent =", encodeURIComponent(decodedTag));
  console.log("tag by encodeURI =", encodeURI(decodedTag));

  const [totalPages, setTotalPages] = useState<number>(0);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/questions/get-all?page=${currentPage}&limit=10&tag=${encodeURIComponent(
          decodedTag
        )}${sortBy ? `&sortBy=${sortBy}` : ""}`
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
  }, [currentPage, decodedTag, sortBy]);

  return (
    <div className="flex flex-col items-center w-full px-10 md:p-10 min-h-screen gap-4">
      <div className="flex flex-wrap items-center justify-center gap-4 text-card-foreground">
        <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary dark:border-border card-shadow">
          <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text 
        text-transparent bg-gradient-to-b from-accent-foreground to-foreground text-center">
          Questions tagged with "#{decodedTag}"
        </h1>
      </div>
      <SearchBar />

      <HomePagination
        tag={encodeURIComponent(decodedTag)}
        totalPages={totalPages}
      />

      <SortFilter />

      {isLoading ? (
        <div className="flex items-center justify-center h-[5vh] md:h-[70vh]">
          <LoaderDemo />
        </div>
      ) : questions.length === 0 ? (
        <p className="text-center mt-4 text-muted-foreground">
          No questions found with this tag.
        </p>
      ) : currentPage > totalPages ? (
        <p className="text-center mt-4 text-muted-foreground">No more pages</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 w-full">
          <Spotlight
            className="-top-120 left-0 md:-top-80 md:left-60"
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
