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
import { models } from "@/app/chat/page";
import { RootState } from "@/lib/redux/store";
import { useSelector } from "react-redux";
import { cn } from "@/lib/utils";

interface SelectModelFormProps {
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
}

export function SelectModelForm({
  selectedModel,
  setSelectedModel,
}: SelectModelFormProps) {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  return (
    <Select
      onValueChange={(value) => setSelectedModel(value)}
      defaultValue={selectedModel}
    >
      <SelectTrigger
        className={cn(
          "max-w-[100%] cursor-pointer bg-background! font-[900]",
          isDarkMode ? "dark" : ""
        )}
      >
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>

      {/* Applying dark class separately becuase radix portal is used inside SelectContent */}
      <SelectContent
        className={cn(
          "max-w-[100%] bg-background! font-[900]",
          isDarkMode ? "dark" : ""
        )}
      >
        <SelectGroup
          className={cn(
            "bg-background! flex flex-col gap-4",
            isDarkMode ? "dark" : ""
          )}
        >
          <SelectLabel>Models</SelectLabel>
          {models.map((model) => (
            <SelectItem
              key={model.value}
              value={model.value}
              className={cn(
                "cursor-pointer hover:scale-105 transition-all duration-300 ease-in-out font-[900]",
                isDarkMode ? "dark" : "",
                selectedModel === model.value
                  ? "bg-muted shadow-lg text-primary hover:bg-muted!"
                  : ""
              )}
            >
              {model.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
