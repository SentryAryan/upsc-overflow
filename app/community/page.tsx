"use client";
import SortFilter from "@/components/Filters/SortFilter";
import SearchBar from "@/components/Forms/SearchBar";
import axios from "axios";
import { Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import UserCard from "../../components/Cards/UserCard";
import HomePagination from "../../components/Filters/HomePagination";
import PulsatingLoader from "../../components/Loaders/PulsatingLoader";
import { Spotlight } from "../../components/ui/spotlight";
import { toast } from "sonner";

const CommunityPage = () => {
  console.log("CommunityPage.jsx");
  const sortByOptions = [
    "questions-desc",
    "answers-desc",
    "comments-desc",
    "subjects-desc",
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
  const [usersWithMetrics, setUsersWithMetrics] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch users with metrics
  const fetchTagsWithMetrics = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/users/getAll?page=${currentPage}&limit=10${
          sortBy ? `&sortBy=${sortBy}` : ""
        }`
      );
      toast.success("Users fetched successfully");
      setUsersWithMetrics(response.data.data);
      setTotalPages(response.data.data[0]?.totalPages || 0);
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || `Users not found`);
      setUsersWithMetrics([]);
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

  // Fetch users with metrics on mount and when currentPage or sortBy changes
  useEffect(() => {
    fetchTagsWithMetrics();
  }, [currentPage, sortBy]);

  return (
    <div className="flex flex-col items-center w-full px-6 md:px-10 pt-12 md:pt-0 gap-8">
      {/* Title */}
      <div className="flex items-center justify-center gap-3 text-card-foreground mt-2 md:mt-0">
        <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary dark:border-border card-shadow">
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <h1
          className="text-4xl md:text-5xl font-bold bg-clip-text 
        text-transparent bg-gradient-to-b from-accent-foreground to-foreground text-center"
        >
          Community({usersWithMetrics.length})
        </h1>
      </div>

      {/* Search Bar */}
      <SearchBar />

      {/* Pagination */}
      <HomePagination totalPages={totalPages} />

      {/* Sort Filter */}
      <SortFilter sortFilterType="users" />

      {/* Users */}
      {isLoading ? (
        <div className="flex items-center justify-center h-[30vh]">
          <PulsatingLoader />
        </div>
      ) : usersWithMetrics.length === 0 ? (
        <p className="text-center mt-4 text-muted-foreground flex justify-center items-center h-[20vh] sm:h-[30vh]">
          No users found.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-8 w-full ">
          <Spotlight
            className="-top-120 left-0 md:-top-100 md:left-60"
            fill="#1c9cf0"
          />
          {usersWithMetrics.map((userWithMetrics) => (
            <UserCard
              key={userWithMetrics.user.id}
              userWithMetrics={userWithMetrics}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
