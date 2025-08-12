"use client";
import SearchBar from "@/components/Forms/SearchBar";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import TagsCard from "../../components/Cards/TagsCard";
import HomePagination from "../../components/Filters/HomePagination";

const page = () => {
  const searchParams = useSearchParams();
  const [tagsWithMetrics, setTagsWithMetrics] = useState<any[]>([]);
  const currentPage = Number(searchParams.get("page")) || 1;
  const [totalPages, setTotalPages] = useState<number>(0);

  const fetchTagsWithMetrics = async () => {
    try {
      const response = await axios.get(
        `/api/tags/getAll?page=${currentPage}&limit=5`
      );
      setTagsWithMetrics(response.data.data);
      setTotalPages(response.data.data[0]?.totalPages || 0);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTagsWithMetrics();
  }, [currentPage]);
  
  return (
    <div className="flex flex-col items-center w-full p-4 sm:p-6 md:p-8 lg:p-10 min-h-screen gap-3 sm:gap-4">
      <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-center">Popular Tags</h1>
      <SearchBar />
      <HomePagination totalPages={totalPages} />
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full max-w-7xl">
        {tagsWithMetrics.map((tagWithMetrics) => (
          <TagsCard key={tagWithMetrics.tag} tagWithMetrics={tagWithMetrics} />
        ))}
      </div>
    </div>
  );
};

export default page;
