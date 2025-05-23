"use client";

import HomePagination from "@/components/Filters/HomePagination";
import SubjectFilter from "@/components/Filters/SubjectFilter";
import { LoaderDemo } from "@/components/Loaders/LoaderDemo";
import { QuestionType } from "@/db/models/question.model";
import { setQuestions } from "@/lib/redux/slices/questions.slice";
import { RootState } from "@/lib/redux/store";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import QuestionCard from "../components/Questions/QuestionCard";
import {
  setAvailableSubjects,
  setSelectedSubject,
} from "../lib/redux/slices/filterSubjects.slice";
import SearchBar from "@/components/Forms/SearchBar";
import SortFilter from "@/components/Filters/SortFilter";

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
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const questions = useSelector(
    (state: RootState) => state.questions.questions
  );
  const availableSubjects = useSelector(
    (state: RootState) => state.filterSubjects.availableSubjects
  );
  const selectedSubject = useSelector(
    (state: RootState) => state.filterSubjects.selectedSubject
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentPage = Number(searchParams.get("page")) || 1;
  const sortBy = searchParams.get("sortBy");
  const [totalPages, setTotalPages] = useState<number>(0);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/questions/get-all?page=${currentPage}&limit=10${
          sortBy ? `&sortBy=${encodeURIComponent(sortBy)}` : ""
        }`
      );
      const fetchedQuestions = response.data.data;
      console.log(response.data.data);
      console.log(typeof response.data.data[0]?.createdAt);
      console.log(response.data.data[0]);
      dispatch(setQuestions(response.data.data));
      setTotalPages(response.data.data[0].totalPages);
      const uniqueSubjects: string[] = [];
      fetchedQuestions.forEach((question: QuestionType) => {
        if (!uniqueSubjects.includes(question.subject)) {
          uniqueSubjects.push(question.subject);
        }
      });
      dispatch(setAvailableSubjects(uniqueSubjects));
    } catch (error: any) {
      console.log(error.response.data.message);
      toast.error(`Questions not found, visit previous pages`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSubject = (subject: string | null) => {
    dispatch(setSelectedSubject(subject));
  };

  useEffect(() => {
    // if (questions.length === 0) {
    //   fetchQuestions();
    // }
    fetchQuestions();
  }, [currentPage, sortBy]);

  const filteredQuestions = selectedSubject
    ? questions.filter((q: QuestionType) => q.subject === selectedSubject)
    : questions;

  return (
    <div className="flex flex-col items-center w-full p-10 min-h-screen gap-4">
      <SearchBar />
      <HomePagination totalPages={totalPages} />

      <SubjectFilter
        subjects={availableSubjects}
        selectedSubject={selectedSubject}
        onSelectSubject={handleSelectSubject}
      />

      <SortFilter />

      {isLoading ? (
        <div className="flex items-center justify-center h-[70vh]">
          <LoaderDemo />
        </div>
      ) : filteredQuestions.length === 0 && selectedSubject !== null ? (
        <p className="text-center mt-4 text-muted-foreground">
          No questions found for the selected subject.
        </p>
      ) : currentPage > totalPages ? (
        <p className="text-center mt-4 text-muted-foreground">No more pages</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
          {filteredQuestions.map((question: QuestionCardProps) => (
            <QuestionCard key={question._id} question={question} />
          ))}
        </div>
      )}
    </div>
  );
}
