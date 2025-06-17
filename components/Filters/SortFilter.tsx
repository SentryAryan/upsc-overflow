import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

export type SortByType = "date-desc" | "date-asc" | "votes-desc" | "answers-desc" | "comments-desc";

interface SortFilterProps {
  // We might not need direct props if we handle routing internally
}

const sortOptions: { label: string; value: SortByType }[] = [
  { label: "Latest", value: "date-desc" },
  { label: "Earliest", value: "date-asc" },
  { label: "Most Votes", value: "votes-desc" },
  { label: "Most Answers", value: "answers-desc" },
  { label: "Most Comments", value: "comments-desc" },
];

const SortFilter: React.FC<SortFilterProps> = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSortBy = (searchParams.get("sortBy") as SortByType) || "date-asc"; // Default to earliest

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
      `?${page ? `page=1` : ""}&sortBy=${encodeURIComponent(sortByValue || "")}${
        question ? `&question=${encodeURIComponent(question)}` : ""
      }${subject ? `&subject=${encodeURIComponent(subject)}` : ""}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`
    );
  };

  return (
    <div className="mb-4 flex flex-wrap gap-3 items-center">
      <span className="text-foreground font-semibold mr-2">Sort by:</span>
      {sortOptions.map((option) => (
        <button
          key={option.value}
          className={`px-3 py-1 rounded-full text-sm cursor-pointer font-[900] filter-shadow hover:shadow-none transition-all duration-300 hover:scale-90 ${
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
