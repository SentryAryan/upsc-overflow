"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, MessageCircle, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";

interface TagWithMetrics {
  tag: string;
  numberOfQuestions: number;
  numberOfComments: number;
  numberOfAnswers: number;
  firstQuestion: string;
  totalPages: number;
}

const TagsCard = ({ tagWithMetrics }: { tagWithMetrics: TagWithMetrics }) => {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate mouse position relative to card center
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Convert to percentage of card dimensions for smoother effect
    const rotateX = (mouseY / rect.height) * -10; // Vertical tilt (inverted)
    const rotateY = (mouseX / rect.width) * 10; // Horizontal tilt

    setMousePosition({ x: rotateY, y: rotateX });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 }); // Reset to center
  };

  const cardStyle = {
    transform: isHovered
      ? `perspective(1000px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg) translateZ(10px)`
      : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
    transition: isHovered ? "none" : "transform 0.3s ease-out",
  };

  return (
    <div
      className="bg-background rounded-lg card-shadow transition-all duration-300 p-3 sm:p-4 md:p-6 border-mode w-full h-full flex flex-col cursor-pointer group relative before:absolute before:bg-accent before:inset-0 before:translate-x-[-100%] before:transition-transform overflow-hidden before:duration-300 before:ease-in-out before:rounded-lg hover:before:translate-x-0 animate-slide-up before:shadow-mode-hover"
      ref={cardRef}
      style={cardStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() =>
        router.push(`/tags?tag=${encodeURIComponent(tagWithMetrics.tag)}`)
      }
    >
      {/* Card Title and Tag */}
      <div className="flex items-start justify-between mb-2 sm:mb-3 relative">
        <h1 className="text-base sm:text-lg md:text-xl font-semibold text-card-foreground mb-1 sm:mb-2 flex-1 group-hover:text-primary line-clamp-2">
          #{tagWithMetrics.tag}
        </h1>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              className="ml-1 sm:ml-2 text-xs sm:text-sm px-2 sm:px-2.5 py-1 rounded-full bg-primary/10 text-primary whitespace-nowrap cursor-pointer hover:bg-primary/20 transition-all duration-300 group-hover:filter-shadow font-[900] border border-primary dark:border-border flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                router.push(
                  `/tags?tag=${encodeURIComponent(tagWithMetrics.tag)}`
                );
              }}
            >
              {tagWithMetrics.tag}
            </TooltipTrigger>
            <TooltipContent
              onClick={(e) => {
                e.stopPropagation();
                router.push(
                  `/tags?tag=${encodeURIComponent(tagWithMetrics.tag)}`
                );
              }}
              className="cursor-pointer"
            >
              View all questions in #{tagWithMetrics.tag}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Card Description - Show first question title */}
      <div className="text-muted-foreground mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 flex-grow relative text-sm sm:text-base">
        {tagWithMetrics.firstQuestion || "No questions available for this tag"}
      </div>

      {/* Tag Stats section with fixed height */}
      <div className="min-h-[32px] sm:min-h-[40px] mb-3 sm:mb-4 relative">
        <div className="flex flex-wrap gap-1 sm:gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="text-xs bg-secondary text-secondary-foreground px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-[900]">
                {tagWithMetrics.numberOfQuestions} Questions
              </TooltipTrigger>
              <TooltipContent>
                Total questions tagged with #{tagWithMetrics.tag}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex flex-wrap items-center justify-between pt-3 sm:pt-4 border-t border-secondary dark:border-border mt-auto gap-2 sm:gap-3 relative">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 text-xs sm:text-sm text-muted-foreground min-w-0 flex-1">
          <div className="flex items-center">
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-primary/20 rounded-full flex items-center justify-center mr-1 sm:mr-2 flex-shrink-0">
              <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </div>
            <span className="truncate">
              {tagWithMetrics.tag}
            </span>
          </div>
          <span className="text-xs sm:text-sm opacity-75 ml-7 sm:ml-0 sm:before:content-['•'] sm:before:mx-2">
            {tagWithMetrics.numberOfQuestions} questions
          </span>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-shrink-0">
          {/* Question count */}
          <span className="font-[900] text-green-600 dark:text-green-600 flex items-center bg-secondary px-1.5 sm:px-2 py-1 rounded-full border border-border text-xs sm:text-sm min-w-[50px] sm:min-w-[60px] justify-center group-hover:filter-shadow hover:shadow-none hover:scale-90 transition-all duration-300">
            <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 font-[900]" />
            <span className="hidden sm:inline">
              {tagWithMetrics.numberOfQuestions}
            </span>
            <span className="sm:hidden">
              {tagWithMetrics.numberOfQuestions}
            </span>
          </span>

          {/* Answer count */}
          <span className="flex items-center text-secondary-foreground bg-secondary px-1.5 sm:px-2 py-1 rounded-full border border-border text-xs sm:text-sm min-w-[40px] sm:min-w-[50px] justify-center group-hover:filter-shadow hover:shadow-none font-[900] hover:scale-90 transition-all duration-300">
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 font-[900]" />
            <span className="hidden sm:inline">
              {tagWithMetrics.numberOfAnswers}
            </span>
            <span className="sm:hidden">{tagWithMetrics.numberOfAnswers}</span>
          </span>

          {/* Comment count */}
          <span className="flex items-center text-secondary-foreground bg-secondary px-1.5 sm:px-2 py-1 rounded-full border border-border text-xs sm:text-sm min-w-[40px] sm:min-w-[50px] justify-center group-hover:filter-shadow hover:shadow-none font-[900] hover:scale-90 transition-all duration-300">
            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
            <span className="hidden sm:inline">
              {tagWithMetrics.numberOfComments}
            </span>
            <span className="sm:hidden">{tagWithMetrics.numberOfComments}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TagsCard;
