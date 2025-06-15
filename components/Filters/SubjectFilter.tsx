// components/Filters/SubjectFilter.tsx
import React from "react";

interface SubjectFilterProps {
  subjects: string[]; // Array of available subjects
  selectedSubject: string | null; // Selected subject (single string or null)
  onSelectSubject: (subject: string | null) => void;
}

const SubjectFilter: React.FC<SubjectFilterProps> = ({
  subjects,
  selectedSubject,
  onSelectSubject,
}) => {
  return (
    <div className="mb-4 flex flex-wrap gap-3 items-center">
      <span className="text-foreground font-semibold mr-2">
        Filter by Subject:
      </span>
      <button
        className={`px-3 py-1 rounded-full text-sm cursor-pointer font-[900] filter-shadow hover:shadow-none transition-all duration-300 hover:scale-90 ${
          selectedSubject === null
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
        onClick={() => onSelectSubject(null)}
      >
        All Subjects
      </button>
      {subjects.map((subject) => (
        <button
          key={subject}
          className={`px-3 py-1 rounded-full text-sm cursor-pointer font-[900] filter-shadow hover:shadow-none transition-all duration-300 hover:scale-90 ${
            selectedSubject === subject
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
          onClick={() => onSelectSubject(subject)}
        >
          {subject}
        </button>
      ))}
    </div>
  );
};

export default SubjectFilter;
