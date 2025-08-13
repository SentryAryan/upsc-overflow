import { QuestionCardProps } from "@/app/page";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import parse from "html-react-parser";
import { ArrowDown, ArrowUp, MessageCircle, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

// Function to truncate HTML string by first removing tags
const truncateHtml = (html: string | null | undefined, maxLength: number) => {
  if (!html) return null;
  // Remove all HTML tags
  const plainText = html.replace(/<[^>]*>/g, "");
  if (plainText.length <= maxLength) {
    return plainText; // Return the plain text if within limit
  }
  // Truncate the plain text and add ellipsis
  return plainText.substring(0, maxLength) + "...";
};

// const truncateHtml2 = (html: string | null | undefined, maxLength: number) => {
//   if (!html) return null;
//   // Remove HTML tags for accurate character count
//   const plainText = html.replace(/<[^>]*>/g, "");
//   if (plainText.length <= maxLength) {
//     return html; // Return original HTML if within limit
//   }
//   // Find the index to truncate in the original HTML
//   let currentIndex = 0;
//   let truncatedHtml = "";
//   let plainTextCount = 0;

//   const tags = html.match(/<[^>]*>/g) || [];
//   const parts = html.split(/<[^>]*>/);

//   for (let i = 0; i < parts.length; i++) {
//     const part = parts[i];
//     const remainingLength = maxLength - plainTextCount;

//     if (part.length >= remainingLength) {
//       truncatedHtml += part.substring(0, remainingLength);
//       plainTextCount += remainingLength;
//       // Stop once the plain text limit is reached
//       break;
//     } else {
//       truncatedHtml += part;
//       plainTextCount += part.length;
//     }

//     if (tags[i]) {
//       truncatedHtml += tags[i];
//     }
//   }

//   return truncatedHtml + "..."; // Add ellipsis
// };

const QuestionCard = ({ question }: { question: QuestionCardProps }) => {
  const router = useRouter();
  const createdAt = question.createdAt
    ? format(new Date(question.createdAt), "MMM dd, yyyy 'at' hh:mm a")
    : "N/A";
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const askerName =
    `${question.user?.firstName || ""} ${
      question.user?.lastName || ""
    }`.trim() || "Anonymous";
  const askerImageUrl = question.user?.imageUrl;

  // Define the maximum length for the description
  const descriptionMaxLength = 200; // You can adjust this value

  // Get the truncated description
  const truncatedDescription = truncateHtml(
    question.description,
    descriptionMaxLength
  );

  // Calculate vote count and determine color
  const voteCount =
    (question.likesAnswersComments?.likes || 0) -
    (question.likesAnswersComments?.dislikes || 0);
  const voteColor =
    voteCount >= 0
      ? "text-green-600 dark:text-green-600"
      : "text-red-600 dark:text-red-600";

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
      // Card Filter on hover using translate-x(faster due to no re-painting)
      className="bg-background rounded-lg card-shadow transition-all duration-300 p-6 border-mode w-full h-full flex flex-col cursor-pointer group relative before:absolute before:bg-accent before:inset-0 before:translate-x-[-100%] before:transition-transform overflow-hidden before:duration-300 before:ease-in-out before:rounded-lg hover:before:translate-x-0 animate-slide-up before:shadow-mode-hover"
      // Card Filter on hover using position(slower due to re-painting)
      // className="bg-background rounded-lg card-shadow transition-all duration-300 p-6 border-mode border-3 w-full h-full flex flex-col cursor-pointer group relative before:absolute before:bg-accent before:rounded-lg overflow-hidden animate-slide-up before:shadow-mode-hover before:transition-[right] before:duration-300 before:ease-in-out before:inset-0 before:right-full hover:before:right-0"

      // Card Filter on hover using width(slower due to re-painting)
      // className="bg-background rounded-lg card-shadow transition-all duration-300 p-6 border-mode w-full h-full flex flex-col cursor-pointer group relative before:absolute before:bg-accent before:rounded-lg overflow-hidden animate-slide-up before:shadow-mode-hover before:transition-[width] before:duration-300 before:ease-in-out before:inset-0 before:w-0 before:h-full hover:before:w-full"

      ref={cardRef}
      style={cardStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => router.push(`/question/${question._id}`)}
    >
      {/* Card Title and Subject */}
      <div className="flex items-start justify-between mb-3 relative">
        <h1 className="text-xl font-semibold text-card-foreground mb-2 flex-1 group-hover:text-primary">
          {question.title}
        </h1>

        {question.subject && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                className="ml-2 text-sm px-2.5 py-1 rounded-full bg-primary/10 text-primary whitespace-nowrap cursor-pointer hover:bg-primary/20 transition-all duration-300 group-hover:filter-shadow font-[900] border border-primary dark:border-border"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/subjects?subject=${question.subject}`);
                }}
              >
                {question.subject}
              </TooltipTrigger>
              <TooltipContent
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/subjects?subject=${question.subject}`);
                }}
                className="cursor-pointer"
              >
                View all questions in {question.subject}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Card Description */}
      <div className="text-muted-foreground mb-4 line-clamp-3 flex-grow relative">
        {truncatedDescription ? parse(truncatedDescription) : null}
      </div>

      {/* Tags section with fixed height */}
      <div className="min-h-[40px] mb-4 relative">
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag: string, index: number) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger
                    className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full cursor-pointer hover:bg-secondary/80 transition-all duration-300 hover:scale-90 group-hover:filter-shadow hover:shadow-none font-[900] hover:font-[900]!"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/tags?tag=${encodeURIComponent(tag)}`);
                    }}
                  >
                    #{tag}
                  </TooltipTrigger>
                  <TooltipContent
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/tags?tag=${encodeURIComponent(tag)}`);
                    }}
                    className="cursor-pointer"
                  >
                    View all questions in #{tag}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex flex-wrap items-center justify-between pt-4 border-t border-secondary dark:border-border mt-auto gap-3 relative">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 text-sm text-muted-foreground">
          <div className="flex items-center">
            {askerImageUrl ? (
              <Image
                src={askerImageUrl}
                alt={askerName}
                width={28}
                height={28}
                className="rounded-full mr-2 border border-border"
              />
            ) : (
              <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center mr-2">
                <span className="text-primary text-xs font-medium">
                  {askerName.charAt(0)}
                </span>
              </div>
            )}
            <span className="truncate">
              {askerName}
            </span>
          </div>
          <span className="text-xs sm:text-sm opacity-75 ml-9 sm:ml-0 sm:before:content-['•'] sm:before:mx-2">
            {createdAt}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Vote count */}
          <span
            className={`font-[900] ${voteColor} flex items-center bg-secondary px-2 py-1 rounded-full border border-border text-sm min-w-[60px] justify-center group-hover:filter-shadow hover:shadow-none font-[900] hover:scale-90 transition-all duration-300`}
          >
            {voteCount >= 0 ? (
              <ArrowUp className="h-4 w-4 mr-1.5 font-[900]" />
            ) : (
              <ArrowDown className="h-4 w-4 mr-1.5 font-[900]" />
            )}
            {Math.abs(voteCount)}
          </span>

          {/* Answer count */}
          <span className="flex items-center text-secondary-foreground bg-secondary px-2 py-1 rounded-full border border-border text-sm min-w-[50px] justify-center group-hover:filter-shadow hover:shadow-none font-[900] hover:scale-90 transition-all duration-300">
            <MessageSquare className="h-4 w-4 mr-1.5 font-[900]" />
            {question.likesAnswersComments?.answers || 0}
          </span>

          {/* Comment count */}
          <span className="flex items-center text-secondary-foreground bg-secondary px-2 py-1 rounded-full border border-border text-sm min-w-[50px] justify-center group-hover:filter-shadow hover:shadow-none font-[900] hover:scale-90 transition-all duration-300">
            <MessageCircle className="h-4 w-4 mr-1.5" />
            {question.likesAnswersComments?.comments || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
