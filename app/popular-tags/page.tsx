"use client";
import SearchBar from "@/components/Forms/SearchBar";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import TagsCard from "../../components/Cards/TagsCard";
import HomePagination from "../../components/Filters/HomePagination";
import { LoaderDemo } from "../../components/Loaders/LoaderDemo";
import SortFilter from "@/components/Filters/SortFilter";

const page = () => {
  const searchParams = useSearchParams();
  const [tagsWithMetrics, setTagsWithMetrics] = useState<any[]>([]);
  const currentPage = Number(searchParams.get("page")) || 1;
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const sortBy = searchParams.get("sortBy");

  const fetchTagsWithMetrics = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/tags/getAll?page=${currentPage}&limit=10${sortBy ? `&sortBy=${sortBy}` : ""}`
      );
      setTagsWithMetrics(response.data.data);
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
      <h1 className="text-xl sm:text-2xl font-bold text-center">
        Popular Tags
      </h1>
      <SearchBar />
      <HomePagination totalPages={totalPages} />
      <SortFilter isUsedByPouplarTagsOrPopularSubjects={true} />
      {isLoading ? (
        <div className="flex items-center justify-center h-[70vh]">
          <LoaderDemo />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8 w-full ">
          {tagsWithMetrics.map((tagWithMetrics) => (
            <TagsCard
              key={tagWithMetrics.tag}
              tagWithMetrics={tagWithMetrics}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default page;
