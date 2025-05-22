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
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", sortByValue);
    // Reset page to 1 when sort order changes
    if (params.has("page")) {
      params.set("page", "1");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mb-4 flex flex-wrap gap-2 items-center">
      <span className="text-foreground font-semibold mr-2">Sort by:</span>
      {sortOptions.map((option) => (
        <button
          key={option.value}
          className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
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
