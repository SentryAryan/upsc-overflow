"use client";
import PopularCard from "@/components/Cards/PopularCard";
import SortFilter from "@/components/Filters/SortFilter";
import SearchBar from "@/components/Forms/SearchBar";
import axios from "axios";
import { Book } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import HomePagination from "../../components/Filters/HomePagination";
import { LoaderDemo } from "../../components/Loaders/LoaderDemo";
import { Spotlight } from "../../components/ui/spotlight";

const PopularSubjectsPage = () => {
  const searchParams = useSearchParams();
  const [subjectsWithMetrics, setSubjectsWithMetrics] = useState<any[]>([]);
  const currentPage = Number(searchParams.get("page")) || 1;
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const sortBy = searchParams.get("sortBy");

  const fetchTagsWithMetrics = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/subjects/getAll?page=${currentPage}&limit=10${
          sortBy ? `&sortBy=${sortBy}` : ""
        }`
      );
      setSubjectsWithMetrics(response.data.data);
      setTotalPages(response.data.data[0]?.totalPages || 0);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTagsWithMetrics();
  }, [currentPage, sortBy, searchParams]);

  return (
    <div className="flex flex-col items-center w-full px-10 py-0 min-[640px]:py-14 md:py-4 gap-8">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-card-foreground">
        <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary dark:border-border card-shadow">
          <Book className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text 
        text-transparent bg-gradient-to-b from-accent-foreground to-foreground text-center">
          Popular Subjects
        </h1>
      </div>

      <SearchBar />
      <HomePagination totalPages={totalPages} />
      <SortFilter sortFilterType="subjects" />
      {isLoading ? (
        <div className="flex items-center justify-center h-[30vh] md:h-[70vh]">
          <LoaderDemo />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 w-full ">
          <Spotlight
            className="-top-120 left-0 md:-top-100 md:left-60"
            fill="#1c9cf0"
          />
          {subjectsWithMetrics.map((subjectWithMetrics) => (
            <PopularCard
              key={subjectWithMetrics.subject}
              subjectWithMetrics={subjectWithMetrics}
              popularCardType="subjects"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PopularSubjectsPage;
