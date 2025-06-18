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
        console.log("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchTerm]);

  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length === 0) return;
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
            className="input pr-10 h-12 text-base shadow-md! dark:shadow-xs! border-mode focus:border-primary dark:focus:border-primary transition-all duration-200 bg-background! text-foreground"
          />
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer group"
            onClick={handleSearch}
          >
            <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
          </div>

          {isInstructionsVisible && (
            <div className="absolute top-full left-0 right-0 mt-2 p-0 bg-background border border-primary rounded-lg shadow-xl z-20 max-h-[600px] overflow-hidden text-foreground">
              {/* Search Tips */}
              <div className="p-4 bg-background border-b border-primary">
                <h3 className="font-semibold mb-3 text-foreground flex items-center">
                  <Search className="h-4 w-4 mr-2 text-foreground" />
                  Search Tips
                </h3>
                <ul className="text-sm space-y-2 text-foreground">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    Use{" "}
                    <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono border border-border text-foreground">
                      [tag-name]
                    </code>{" "}
                    for tags (e.g., [physics])
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    Use{" "}
                    <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono border border-border text-foreground">
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
                  <div className="p-4 border-b border-primary bg-background">
                    <h3 className="font-semibold text-foreground flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                      Suggested Questions
                    </h3>
                  </div>
                  <div className="divide-y divide-primary bg-background">
                    {isLoading ? (
                      <div className="p-6 flex items-center justify-center bg-background">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-3 text-muted-foreground">
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
                            className="p-4 bg-background hover:bg-accent transition-all duration-200 cursor-pointer group border-b border-primary last:border-b-0 group"
                            onMouseDown={() => handleSuggestionClick(q._id)}
                          >
                            {/* Title and Subject */}
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors duration-200 flex-1 line-clamp-2">
                                {q.title}
                              </h4>

                              {q.subject && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger
                                      className="ml-2 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary whitespace-nowrap cursor-pointer hover:bg-primary/20 transition-all duration-300 group-hover:filter-shadow font-[900] border border-primary dark:border-border"
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
                                      onMouseDown={(e) => {
                                        e.stopPropagation();
                                        router.push(
                                          `/subjects?subject=${q.subject}`
                                        );
                                      }}
                                      className="cursor-pointer"
                                    >
                                      View all questions in {q.subject}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>

                            {/* User info */}
                            <div className="flex items-center text-sm text-muted-foreground mb-3">
                              {q.user?.imageUrl ? (
                                <Image
                                  src={q.user.imageUrl}
                                  alt={askerName}
                                  width={24}
                                  height={24}
                                  className="rounded-full mr-2 border border-border"
                                />
                              ) : (
                                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mr-2 text-xs font-medium text-primary">
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
                                          className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full cursor-pointer hover:bg-secondary/80 transition-all duration-200 group-hover:filter-shadow hover:shadow-none font-[900] hover:scale-90"
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
                                          onMouseDown={(e) => {
                                            e.stopPropagation();
                                            router.push(
                                              `/tags?tag=${encodeURIComponent(
                                                tag
                                              )}`
                                            );
                                          }}
                                          className="cursor-pointer"
                                        >
                                          View all questions in #{tag}
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ))}
                                {q.tags.length > 3 && (
                                  <span className="text-xs text-muted-foreground px-2 py-1">
                                    +{q.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Stats */}
                            <div className="flex items-center justify-start space-x-4 text-sm">
                              <span
                                className={`font-[900] ${voteColor} flex items-center bg-secondary px-3 py-1.5 rounded-full group-hover:filter-shadow font-[900] hover:scale-90 transition-all duration-300`}
                              >
                                {voteCount >= 0 ? (
                                  <ArrowUp size={14} className="mr-1 font-[900]" />
                                ) : (
                                  <ArrowDown size={14} className="mr-1 font-[900]" />
                                )}
                                {Math.abs(voteCount)}
                              </span>
                              <span className="flex items-center text-secondary-foreground bg-secondary px-2 py-1 rounded-full group-hover:filter-shadow font-[900] hover:scale-90 transition-all duration-300">
                                <MessageSquare size={14} className="mr-1" />
                                {q.likesAnswersComments?.answers || 0}
                              </span>
                              <span className="flex items-center text-secondary-foreground bg-secondary px-2 py-1 rounded-full group-hover:filter-shadow font-[900] hover:scale-90 transition-all duration-300">
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
                  <div className="p-8 text-center bg-background">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-medium">
                      No suggestions found
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
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
