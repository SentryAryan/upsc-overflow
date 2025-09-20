"use client";
import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RootState } from "@/lib/redux/store";
import { useSelector } from "react-redux";
import { cn } from "@/lib/utils";

interface SelectSubjectForTestProps {
  selectedSubject: string;
  setSelectedSubject: React.Dispatch<React.SetStateAction<string>>;
  subjects: string[];
}

export function SelectSubjectForTest({
  selectedSubject,
  setSelectedSubject,
  subjects,
}: SelectSubjectForTestProps) {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  return (
    <Select
      onValueChange={(value) => setSelectedSubject(value)}
      defaultValue={selectedSubject}
    >
      <SelectTrigger
        className={cn(
          "w-full cursor-pointer bg-background! font-[900]",
          isDarkMode ? "dark" : ""
        )}
      >
        <SelectValue placeholder="Select a subject" />
      </SelectTrigger>

      {/* Applying dark class separately becuase radix portal is used inside SelectContent */}
      <SelectContent
        className={cn(
          "w-full bg-background! font-[900]",
          isDarkMode ? "dark" : ""
        )}
      >
        <SelectGroup
          className={cn(
            "bg-background! flex flex-col gap-4",
            isDarkMode ? "dark" : ""
          )}
        >
          <SelectLabel>Subjects</SelectLabel>
          {subjects.map((subject) => (
            <SelectItem
              key={subject}
              value={subject}
              className={cn(
                "cursor-pointer hover:scale-105 transition-all duration-300 ease-in-out font-[900] text-foreground!",
                isDarkMode ? "dark" : "",
                selectedSubject === subject
                  ? "bg-muted shadow-lg text-primary! hover:bg-muted!"
                  : ""
              )}
            >
              <span
                className={cn(
                  "flex items-center gap-2",
                  selectedSubject === subject
                    ? "text-primary!"
                    : "text-foreground"
                )}
              >
                {subject}
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
