// components/Filters/SubjectFilter.tsx
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setTotalPages } from "@/lib/redux/slices/questions.slice";
import { useDispatch } from "react-redux";

interface SubjectFilterProps {
  subjects: string[]; // Array of available subjects
  selectedSubject: string | null; // Selected subject (single string or null)
  handleSelectSubject: (subject: string | null) => void;
}

const SubjectFilter: React.FC<SubjectFilterProps> = ({
  subjects,
  selectedSubject,
  handleSelectSubject,
}) => {
  console.log("SubjectFilter.jsx");
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const handleSelectCurrentSubject = (subject: string | null) => {
    dispatch(setTotalPages(0));
    const page = searchParams.get("page");
    const question = searchParams.get("question");
    const sortBy = searchParams.get("sortBy");
    const tag = searchParams.get("tag");
    const pathToPush = `?page=1&sortBy=${encodeURIComponent(
      sortBy || ""
    )}&question=${encodeURIComponent(
      question || ""
    )}&subject=${encodeURIComponent(subject || "")}&tag=${encodeURIComponent(
      tag || ""
    )}`;
    const pathToPush2 = `?${page ? `page=1` : ""}${
      sortBy ? `&sortBy=${encodeURIComponent(sortBy)}` : ""
    }${question ? `&question=${encodeURIComponent(question)}` : ""}${
      subject ? `&subject=${encodeURIComponent(subject)}` : ""
    }${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`;

    handleSelectSubject(subject);
    router.push(pathToPush2);
  };

  return (
    <div className="mb-4 flex flex-wrap gap-3 items-center justify-center">
      <span className="text-foreground font-semibold mr-2 animate-slide-up">
        Filter by Subject:
      </span>
      <button
        className={`px-3 py-1 rounded-full text-sm cursor-pointer font-[900] filter-shadow hover:shadow-none transition-all duration-300 hover:scale-90 animate-slide-up ${
          selectedSubject === null
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
        onClick={() => handleSelectCurrentSubject(null)}
      >
        All Subjects
      </button>
      {subjects.map((subject) => (
        <button
          key={subject}
          className={`px-3 py-1 rounded-full text-sm cursor-pointer font-[900] filter-shadow hover:shadow-none transition-all duration-300 hover:scale-90 animate-slide-up ${
            selectedSubject === subject
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
          onClick={() => handleSelectCurrentSubject(subject)}
        >
          {subject}
        </button>
      ))}
    </div>
  );
};

export default SubjectFilter;
