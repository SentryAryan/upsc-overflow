import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import React, { useState } from "react";

const TagsInput = ({
  tags,
  setTags,
  tag,
  setTag,
}: {
  tags: string[];
  setTags: (tags: string[]) => void;
  tag: string;
  setTag: (tag: string) => void;
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const tagToAdd = tag.trim();
      if (
        tagToAdd &&
        tags.every((t) => t.toLowerCase() !== tagToAdd.toLowerCase())
      ) {
        setTags([...tags, tagToAdd]);
        setTag("");
      } else {
        setTag("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase()));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="tags">Tags</Label>
      <Input
        type="text"
        className="input bg-background! border-3 border-border"
        id="tags"
        placeholder="Add tags (press enter to add)"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <div
            key={index}
            className={cn(
              "inline-flex items-center rounded-md border px-2 py-1 text-sm font-semibold bg-secondary text-secondary-foreground",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            )}
          >
            {tag}
            <button
              type="button"
              className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-300 cursor-pointer bg-background! border-3 border-border"
              onClick={() => handleRemoveTag(tag)}
            >
              <X className="h-3 w-3 text-foreground  hover:text-foreground cursor-pointer transition-all duration-300" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagsInput;
