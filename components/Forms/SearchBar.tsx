"use client";

import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import axios from "axios";
import { format } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  MessageCircle,
  MessageSquare,
  Search,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { KeyboardEvent, useEffect, useState } from "react";
import { useDebounce } from "react-use";

// Define a type for the suggestion item, similar to QuestionCardProps
interface SuggestionItem {
  _id: string;
  title: string;
  description: string;
  createdAt: string | Date;
  subject?: string;
  tags?: string[];
  user: {
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string | null;
  } | null;
  likesAnswersComments: {
    likes: number;
    dislikes: number;
    answers: number;
    comments: number;
    netVotes?: number;
  };
}

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isInstructionsVisible, setIsInstructionsVisible] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useDebounce(
    () => {
      setDebouncedSearchTerm(searchQuery);
    },
    800,
    [searchQuery]
  );

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchTerm.trim().length === 0) {
        setSuggestions([]);
        return;
      }

      try {
        setIsLoading(true);
        let apiUrl = "";
        let isValidQuery = false;

        if (
          debouncedSearchTerm.startsWith("[") &&
          debouncedSearchTerm.endsWith("]")
        ) {
          const tag = debouncedSearchTerm.slice(1, -1).toLowerCase().trim();
          if (tag) {
            apiUrl = `/api/questions/get-all?page=1&limit=5&tag=${encodeURIComponent(
              tag
            )}`;
            isValidQuery = true;
          }
        } else if (
          debouncedSearchTerm.startsWith('"') &&
          debouncedSearchTerm.endsWith('"')
        ) {
          const subject = debouncedSearchTerm.slice(1, -1).toLowerCase().trim();
          if (subject) {
            apiUrl = `/api/questions/get-all?page=1&limit=5&subject=${encodeURIComponent(
              subject
            )}`;
            isValidQuery = true;
          }
        } else {
          apiUrl = `/api/questions/get-all?page=1&limit=5&question=${encodeURIComponent(
            debouncedSearchTerm.toLowerCase().trim()
          )}`;
          isValidQuery = true;
        }

        if (isValidQuery && apiUrl) {
          const response = await axios.get(apiUrl);
          setSuggestions(response.data.data);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchTerm]);

  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.startsWith("[") && trimmedQuery.endsWith("]")) {
      const tag = trimmedQuery.slice(1, -1).toLowerCase().trim();
      if (!tag) return;
      router.push(`/tags?tag=${encodeURIComponent(tag)}`);
    } else if (trimmedQuery.startsWith('"') && trimmedQuery.endsWith('"')) {
      const subject = trimmedQuery.slice(1, -1).toLowerCase().trim();
      if (!subject) return;
      router.push(`/subjects?subject=${encodeURIComponent(subject)}`);
    } else {
      router.push(
        `/questions?question=${encodeURIComponent(trimmedQuery.toLowerCase())}`
      );
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleFocus = () => setIsInstructionsVisible(true);
  const handleBlur = () => setIsInstructionsVisible(false);

  const handleSuggestionClick = (questionId: string) => {
    router.push(`/question/${questionId}`);
  };

  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/tags?tag=${encodeURIComponent(tag)}`);
  };

  const handleSubjectClick = (subject: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/subjects?subject=${subject}`);
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="w-full flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search questions, tags, or subjects..."
            className="input pr-10 h-12 text-base shadow-sm border-2 focus:border-primary transition-all duration-200"
          />
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer group"
            onClick={handleSearch}
          >
            <Search className="h-5 w-5 text-gray-500 group-hover:text-primary transition-colors duration-200" />
          </div>

          {isInstructionsVisible && (
            <div className="absolute top-full left-0 right-0 mt-2 p-0 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-20 max-h-[600px] overflow-hidden">
              {/* Search Tips */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-primary/10 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100 flex items-center">
                  <Search className="h-4 w-4 mr-2 text-primary" />
                  Search Tips
                </h3>
                <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    Use{" "}
                    <code className="px-1.5 py-0.5 bg-white/80 dark:bg-gray-800 rounded text-xs font-mono border border-gray-200 dark:border-gray-500">
                      [tag-name]
                    </code>{" "}
                    for tags (e.g., [physics])
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    Use{" "}
                    <code className="px-1.5 py-0.5 bg-white/80 dark:bg-gray-800 rounded text-xs font-mono border border-gray-200 dark:border-gray-500">
                      "subject-name"
                    </code>{" "}
                    for subjects (e.g., "history")
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    Or type your question directly
                  </li>
                </ul>
              </div>

              {(suggestions.length > 0 || isLoading) && (
                <div className="max-h-[450px] overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                      Suggested Questions
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {isLoading ? (
                      <div className="p-6 flex items-center justify-center bg-white dark:bg-gray-800">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-3 text-gray-600 dark:text-gray-300">
                          Loading suggestions...
                        </span>
                      </div>
                    ) : (
                      suggestions.map((q) => {
                        const askerName =
                          `${q.user?.firstName || ""} ${
                            q.user?.lastName || ""
                          }`.trim() || "Anonymous";
                        const createdAtFormatted = q.createdAt
                          ? format(new Date(q.createdAt), "MMM dd, yyyy")
                          : "N/A";
                        const voteCount =
                          (q.likesAnswersComments?.likes || 0) -
                          (q.likesAnswersComments?.dislikes || 0);
                        const voteColor =
                          voteCount >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400";

                        return (
                          <div
                            key={q._id}
                            className="p-4 bg-white dark:bg-gray-800  transition-all duration-200 cursor-pointer group border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                            onMouseDown={() => handleSuggestionClick(q._id)}
                          >
                            {/* Title and Subject */}
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors duration-200 flex-1 line-clamp-2">
                                {q.title}
                              </h4>

                              {q.subject && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger
                                      className="ml-2 text-xs px-2.5 py-1 rounded-full font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 whitespace-nowrap cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-700 transition-all duration-300"
                                      onMouseDown={(e) => {
                                        e.stopPropagation();
                                        router.push(
                                          `/subjects?subject=${q.subject}`
                                        );
                                      }}
                                    >
                                      {q.subject}
                                    </TooltipTrigger>
                                    <TooltipContent
                                      type="subject"
                                      className="dark:bg-blue-700 dark:hover:bg-blue-900 text-blue-200 cursor-pointer font-bold"
                                      onMouseDown={(e) => {
                                        e.stopPropagation();
                                        router.push(
                                          `/subjects?subject=${q.subject}`
                                        );
                                      }}
                                    >
                                      View all questions in {q.subject}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>

                            {/* User info */}
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {q.user?.imageUrl ? (
                                <Image
                                  src={q.user.imageUrl}
                                  alt={askerName}
                                  width={24}
                                  height={24}
                                  className="rounded-full mr-2 border border-gray-200 dark:border-gray-600"
                                />
                              ) : (
                                <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-primary/40 dark:from-primary/30 dark:to-primary/50 rounded-full flex items-center justify-center mr-2 text-xs font-medium text-primary dark:text-primary-foreground">
                                  {askerName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="truncate">
                                {askerName} • {createdAtFormatted}
                              </span>
                            </div>

                            {/* Tags */}
                            {q.tags && q.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {q.tags
                                  .slice(0, 3)
                                  .map((tag: string, index: number) => (
                                    <TooltipProvider key={index}>
                                      <Tooltip>
                                        <TooltipTrigger
                                          className="text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-200 hover:dark:bg-gray-700 transition-all duration-200"
                                          onMouseDown={(e) => {
                                            e.stopPropagation();
                                            router.push(
                                              `/tags?tag=${encodeURIComponent(
                                                tag
                                              )}`
                                            );
                                          }}
                                        >
                                          #{tag}
                                        </TooltipTrigger>
                                        <TooltipContent
                                          type="tag"
                                          className="dark:bg-gray-700 dark:hover:dark:bg-gray-900 text-blue-200 cursor-pointer font-bold"
                                          onMouseDown={(e) => {
                                            e.stopPropagation();
                                            router.push(
                                              `/tags?tag=${encodeURIComponent(
                                                tag
                                              )}`
                                            );
                                          }}
                                        >
                                          View all questions in #{tag}
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ))}
                                {q.tags.length > 3 && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                                    +{q.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Stats */}
                            <div className="flex items-center justify-start space-x-4 text-sm">
                              <span
                                className={`font-medium ${voteColor} flex items-center bg-gray-100 dark:bg-gray-700/80 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-600`}
                              >
                                {voteCount >= 0 ? (
                                  <ArrowUp size={14} className="mr-1" />
                                ) : (
                                  <ArrowDown size={14} className="mr-1" />
                                )}
                                {Math.abs(voteCount)}
                              </span>
                              <span className="flex items-center text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-full">
                                <MessageSquare size={14} className="mr-1" />
                                {q.likesAnswersComments?.answers || 0}
                              </span>
                              <span className="flex items-center text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-full">
                                <MessageCircle size={14} className="mr-1" />
                                {q.likesAnswersComments?.comments || 0}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {!isLoading &&
                debouncedSearchTerm &&
                suggestions.length === 0 && (
                  <div className="p-8 text-center bg-white dark:bg-gray-800">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">
                      No suggestions found
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Try a different search term
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
