"use client";

import HomePagination from "@/components/Filters/HomePagination";
import SortFilter from "@/components/Filters/SortFilter";
import { LoaderDemo } from "@/components/Loaders/LoaderDemo";
import { setQuestions } from "@/lib/redux/slices/questions.slice";
import { RootState } from "@/lib/redux/store";
import axios from "axios";
import { Book } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import QuestionCard from "../../components/Cards/QuestionCard";
import SearchBar from "../../components/Forms/SearchBar";

export default function SubjectPage() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const questions = useSelector(
    (state: RootState) => state.questions.questions
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentPage = Number(searchParams.get("page")) || 1;
  const subject = searchParams.get("subject") || "";
  const [totalPages, setTotalPages] = useState<number>(0);
  const sortBy = searchParams.get("sortBy");

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/questions/get-all?page=${currentPage}&limit=10&subject=${subject}${sortBy ? `&sortBy=${sortBy}` : ""}`
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
  }, [currentPage, subject, sortBy]);

  return (
    <div className="flex flex-col items-center w-full p-10 min-h-screen gap-4">
      <div className="flex items-center justify-center gap-3 text-card-foreground">
        <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary dark:border-border card-shadow">
          <Book className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Questions in subject = "{subject}"</h1>
      </div>
      <SearchBar />
      <HomePagination subject={encodeURIComponent(subject)} totalPages={totalPages} />

      <SortFilter />

      {isLoading ? (
        <div className="flex items-center justify-center h-[5vh] md:h-[70vh]">
          <LoaderDemo />
        </div>
      ) : questions.length === 0 ? (
        <p className="text-center mt-4 text-muted-foreground">
          No questions found for this subject.
        </p>
      ) : currentPage > totalPages ? (
        <p className="text-center mt-4 text-muted-foreground">No more pages</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          {questions.map((question: any) => (
            <QuestionCard key={question._id} question={question} />
          ))}
        </div>
      )}
    </div>
  );
}
