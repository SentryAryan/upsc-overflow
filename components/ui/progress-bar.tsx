"use client";

import { useEffect, useMemo, useState } from "react";
import { Progress } from "@ark-ui/react/progress";
import { maxInputTokens } from "@/app/chat/page";
import { cn } from "@/lib/utils";

type ProgressWithLabelProps = {
  value: number;
  label?: string;
  delay?: number;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
  currentWordsCount: number;
  maxInputWords: number;
};

export function ProgressWithLabel({
  value,
  label,
  delay,
  duration,
  colorFrom,
  colorTo,
  className,
  currentWordsCount,
  maxInputWords,
}: ProgressWithLabelProps) {
  const [progress, setProgress] = useState(0);
  const defaultMaxInputWords = useMemo(() => {
    return Math.floor(maxInputTokens * 0.75);
  }, [maxInputTokens]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <Progress.Root
      value={progress}
      className={`w-full space-y-3 p-4 pt-0 rounded-2xl ${className}`}
    >
      {label && (
        <div className="flex justify-between items-center">
          <Progress.Label
            className={cn(
              "text-chart-2 font-semibold",
              currentWordsCount >= maxInputWords && "text-destructive"
            )}
          >
            {label} ({currentWordsCount || 0} /{" "}
            {maxInputWords || defaultMaxInputWords})
          </Progress.Label>
        </div>
      )}

      <div className="relative w-full">
        <Progress.Track className="h-5 w-full bg-card rounded-full overflow-hidden">
          <Progress.Range
            className={`h-full bg-gradient-to-r ${colorFrom} ${colorTo} 
              transition-all ease-out rounded-full shadow-sm`}
            style={{ transitionDuration: `${duration}ms` }}
          />
        </Progress.Track>
        <Progress.ValueText className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white" />
      </div>
    </Progress.Root>
  );
}
