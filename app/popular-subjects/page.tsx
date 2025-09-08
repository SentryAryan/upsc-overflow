"use client";
import PopularCard from "@/components/Cards/PopularCard";
import SortFilter from "@/components/Filters/SortFilter";
import SearchBar from "@/components/Forms/SearchBar";
import axios from "axios";
import { Book } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import HomePagination from "../../components/Filters/HomePagination";
import PulsatingLoader from "../../components/Loaders/PulsatingLoader";
import { Spotlight } from "../../components/ui/spotlight";
import { toast } from "sonner";

const PopularSubjectsPage = () => {
  console.log("PopularSubjectsPage.jsx");
  const sortByOptions = [
    "questions-desc",
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
  const [subjectsWithMetrics, setSubjectsWithMetrics] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTagsWithMetrics = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/subjects/getAll?page=${currentPage}&limit=10${
          sortBy ? `&sortBy=${sortBy}` : ""
        }`
      );
      toast.success("Subjects fetched successfully");
      setSubjectsWithMetrics(response.data.data);
      setTotalPages(response.data.data[0]?.totalPages || 0);
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || `Subjects not found`);
      setSubjectsWithMetrics([]);
      setTotalPages(0);
      
      // If invalid page number, push to page 1 with default sortBy
      if (error.response?.data?.errors.includes("Invalid Page Number")) {
        const pathToPush = `?page=1${
          sortBy
            ? sortByOptions.includes(sortBy)
              ? `&sortBy=${sortBy}`
              : `&sortBy=${encodeURIComponent("questions-desc")}`
            : ""
        }`;
        router.push(pathToPush);
      }

      // If invalid sortBy, push to page 1 with default sortBy
      if (error.response?.data?.errors.includes("Invalid Sort By")) {
        const pathToPush = `?${
          isNaN(currentPage) || currentPage < 1
            ? `page=1`
            : `page=${currentPage}`
        }&sortBy=${encodeURIComponent("questions-desc")}`;
        router.push(pathToPush);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTagsWithMetrics();
  }, [currentPage, sortBy]);

  return (
    <div className="flex flex-col items-center w-full px-6 md:px-10 pt-12 md:pt-0 gap-8">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-card-foreground">
        <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary dark:border-border card-shadow">
          <Book className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <h1
          className="text-4xl md:text-5xl font-bold bg-clip-text 
        text-transparent bg-gradient-to-b from-accent-foreground to-foreground text-center"
        >
          Popular Subjects({subjectsWithMetrics.length})
        </h1>
      </div>

      {/* Search Bar */}
      <SearchBar />

      {/* Pagination */}
      <HomePagination totalPages={totalPages} />

      {/* Sort Filter */}
      <SortFilter sortFilterType="subjects" />

      {/* Subjects */}
      {isLoading ? (
        <div className="flex items-center justify-center h-[30vh]">
          <PulsatingLoader />
        </div>
      ) : subjectsWithMetrics.length === 0 ? (
        <p className="text-center mt-4 text-muted-foreground flex justify-center items-center h-[20vh] sm:h-[30vh]">
          No subjects found.
        </p>
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
