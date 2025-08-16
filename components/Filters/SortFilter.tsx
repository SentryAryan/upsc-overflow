import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

interface SortFilterProps {
  // We might not need direct props if we handle routing internally
  sortFilterType?: "tags" | "subjects" | "others";
}

const SortFilter: React.FC<SortFilterProps> = ({
  sortFilterType,
}: SortFilterProps) => {
  type SortByType =
    | "date-desc"
    | "date-asc"
    | "votes-desc"
    | "answers-desc"
    | "comments-desc"
    | "questions-desc"
    | "subjects-desc"
    | "tags-desc";

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSortBy =
    (searchParams.get("sortBy") as SortByType) ||
    (sortFilterType === "tags" || sortFilterType === "subjects" ? "questions-desc" : "date-desc"); // Default to sorting based on questions for popular tags and subjects else default to date-asc
  const sortOptions: { label: string; value: SortByType }[] =
    sortFilterType === "tags"
      ? [
          { label: "Most Questions", value: "questions-desc" },
          { label: "Most Answers", value: "answers-desc" },
          { label: "Most Comments", value: "comments-desc" },
          { label: "Most Subjects", value: "subjects-desc" },
        ]
      : sortFilterType === "subjects"
      ? [
          { label: "Most Questions", value: "questions-desc" },
          { label: "Most Answers", value: "answers-desc" },
          { label: "Most Comments", value: "comments-desc" },
          { label: "Most Tags", value: "tags-desc" },
        ]
      : [
          { label: "Latest", value: "date-desc" },
          { label: "Earliest", value: "date-asc" },
          { label: "Most Votes", value: "votes-desc" },
          { label: "Most Answers", value: "answers-desc" },
          { label: "Most Comments", value: "comments-desc" },
          { label: "Most Tags", value: "tags-desc" },
        ];

  const handleSelectSort = (sortByValue: SortByType) => {
    const page = searchParams.get("page");
    const question = searchParams.get("question");
    const subject = searchParams.get("subject");
    const tag = searchParams.get("tag");

    console.log("currentSortBy", currentSortBy);
    console.log("page", page);
    console.log("question", question);
    console.log("subject", subject);
    console.log("tag", tag);

    router.push(
      `?${page ? `page=1` : ""}&sortBy=${encodeURIComponent(
        sortByValue || ""
      )}${question ? `&question=${encodeURIComponent(question)}` : ""}${
        subject ? `&subject=${encodeURIComponent(subject)}` : ""
      }${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`
    );
  };

  return (
    <div className="mb-4 flex flex-wrap gap-3 items-center">
      <span className="text-foreground font-semibold mr-2 animate-slide-up">
        Sort by:
      </span>
      {sortOptions.map((option) => (
        <button
          key={option.value}
          className={`px-3 py-1 rounded-full text-sm cursor-pointer font-[900] filter-shadow hover:shadow-none transition-all duration-300 hover:scale-90 animate-slide-up ${
            currentSortBy === option.value
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
          onClick={() => handleSelectSort(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default SortFilter;
