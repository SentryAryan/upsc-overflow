"use client";
import { sortByOptions } from "@/app/page";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Query for questions (replaces Redux for server data)
export function useQuestions(params: {
  page: number;
  sortBy?: string;
  subject?: string;
}) {
  const router = useRouter();
  return useQuery({
    queryKey: ["questions", params.page, params.sortBy, params.subject],
    queryFn: async () => {
      try {
        console.log("fetching questions");
        const response = await axios.get("/api/questions/get-all", {
          params: {
            page: params.page,
            limit: 10,
            sortBy: params.sortBy,
            subject: params.subject,
            homePage: true,
          },
        });
        return response.data.data;
      } catch (error: any) {
        console.log(error.response?.data?.message);
        toast.error(error.response?.data?.message || `Questions not found`);
        // If invalid page number, push to page 1 with default sortBy
        if (error.response?.data?.errors.includes("Invalid Page Number")) {
          const pathToPush = `?page=1${
            params.sortBy
              ? sortByOptions.includes(params.sortBy)
                ? `&sortBy=${params.sortBy}`
                : `&sortBy=${encodeURIComponent("date-desc")}`
              : ""
          }${params.subject ? `&subject=${encodeURIComponent(params.subject)}` : ""}`;
          router.push(pathToPush);
        }

        // If invalid sortBy, push to page 1 with default sortBy
        if (error.response?.data?.errors.includes("Invalid Sort By")) {
          const pathToPush = `?${
            isNaN(params.page) || params.page < 1
              ? `page=1`
              : `page=${params.page}`
          }&sortBy=${encodeURIComponent("date-desc")}${
            params.subject
              ? `&subject=${encodeURIComponent(params.subject)}`
              : ""
          }`;
          router.push(pathToPush);
        }

        // If invalid subject, push to page 1 with default sortBy with no subject parameter to display questions of all subjects
        if (error.response?.data?.errors.includes("Invalid Subject")) {
          const pathToPush = `?${
            isNaN(params.page) || params.page < 1
              ? `page=1`
              : `page=${params.page}`
          }${
            params.sortBy
              ? sortByOptions.includes(params.sortBy)
                ? `&sortBy=${params.sortBy}`
                : `&sortBy=${encodeURIComponent("date-desc")}`
              : ""
          }`;
          router.push(pathToPush);
        }
        return [];
      }
    },
    enabled: true, // Only run if page is valid
  });
}

// Query for subjects (cached for 24 hours)
export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      try {
        console.log("fetching subjects");
        const response = await axios.get("/api/questions/getAllSubjects");
        return response.data.data;
      } catch (error: any) {
        console.log(error.response?.data?.message);
        return [];
      }
    },
    // staleTime: 24 * 60 * 60 * 1000, // 24 hours
    // gcTime: 24 * 60 * 60 * 1000,
  });
}

// Query for questions by tag
export function useQuestionsByTag(params: {
  page: number;
  sortBy?: string;
  tag?: string;
}) {
  const router = useRouter();
  return useQuery({
    queryKey: ["questions", params.page, params.sortBy, params.tag],
    queryFn: async () => {
      try {
        console.log("fetching questions by tag");
        const response = await axios.get("/api/questions/get-all", {
          params: {
            page: params.page,
            limit: 10,
            sortBy: params.sortBy,
            tag: params.tag,
          },
        });
        return response.data.data;
      } catch (error: any) {
        console.log(error.response?.data?.message);
        toast.error(error.response?.data?.message || `Questions not found`);

        // If invalid page number, push to page 1 with default sortBy
        if (error.response?.data?.errors.includes("Invalid Page Number")) {
          const pathToPush = `?page=1${
            params.sortBy
              ? sortByOptions.includes(params.sortBy)
                ? `&sortBy=${params.sortBy}`
                : `&sortBy=${encodeURIComponent("date-desc")}`
              : ""
          }&tag=${encodeURIComponent(params.tag || "")}`;
          router.push(pathToPush);
        }

        // If invalid sortBy, push to page 1 with default sortBy
        if (error.response?.data?.errors.includes("Invalid Sort By")) {
          const pathToPush = `?${
            isNaN(params.page) || params.page < 1
              ? `page=1`
              : `page=${params.page}`
          }&sortBy=${encodeURIComponent("date-desc")}&tag=${encodeURIComponent(
            params.tag || ""
          )}`;
          router.push(pathToPush);
        }
        return [];
      }
    },
    enabled: true, // Only run if page is valid
  });
}
