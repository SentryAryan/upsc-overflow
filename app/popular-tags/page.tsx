"use client";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import SearchBar from "@/components/Forms/SearchBar";
import HomePagination from "../../components/Filters/HomePagination";
import TagsCard from "../../components/Cards/TagsCard";

const page = () => {
  const searchParams = useSearchParams();
  const [tagsWithMetrics, setTagsWithMetrics] = useState<any[]>([]);
  const currentPage = Number(searchParams.get("page")) || 1;
  const [totalPages, setTotalPages] = useState<number>(0);

  const fetchTagsWithMetrics = async () => {
    try {
      const response = await axios.get(
        `/api/tags/getAll?page=${currentPage}&limit=10`
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
    <div className="flex flex-col items-center w-full p-10 min-h-screen gap-4">
      <h1 className="text-2xl font-bold mb-4">Popular Tags</h1>
      <SearchBar />
      <HomePagination totalPages={totalPages} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        {tagsWithMetrics.map((tagWithMetrics) => (
          <TagsCard key={tagWithMetrics.tag} tagWithMetrics={tagWithMetrics} />
        ))}
      </div>
    </div>
  );
};

export default page;
