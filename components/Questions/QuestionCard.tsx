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

const truncateHtml2 = (html: string | null | undefined, maxLength: number) => {
  if (!html) return null;
  // Remove HTML tags for accurate character count
  const plainText = html.replace(/<[^>]*>/g, "");
  if (plainText.length <= maxLength) {
    return html; // Return original HTML if within limit
  }
  // Find the index to truncate in the original HTML
  let currentIndex = 0;
  let truncatedHtml = "";
  let plainTextCount = 0;

  const tags = html.match(/<[^>]*>/g) || [];
  const parts = html.split(/<[^>]*>/);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const remainingLength = maxLength - plainTextCount;

    if (part.length >= remainingLength) {
      truncatedHtml += part.substring(0, remainingLength);
      plainTextCount += remainingLength;
      // Stop once the plain text limit is reached
      break;
    } else {
      truncatedHtml += part;
      plainTextCount += part.length;
    }

    if (tags[i]) {
      truncatedHtml += tags[i];
    }
  }

  return truncatedHtml + "..."; // Add ellipsis
};

const QuestionCard = ({ question }: { question: QuestionCardProps }) => {
  const router = useRouter();
  const createdAt = question.createdAt
    ? format(new Date(question.createdAt), "MMM dd, yyyy 'at' hh:mm a")
    : "N/A";

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

  return (
    <div
      className="bg-background rounded-lg shadow-md hover:shadow-lg transition-all p-6 border-2 border-border w-full h-full flex flex-col cursor-pointer hover:bg-accent"
      onClick={() => router.push(`/question/${question._id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <h1 className="text-xl font-semibold text-card-foreground mb-2 flex-1">
          {question.title}
        </h1>

        {question.subject && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                className="ml-2 text-xs px-2.5 py-1 rounded-full font-bold bg-primary/10 text-primary whitespace-nowrap cursor-pointer hover:bg-primary/20 transition-all duration-300"
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
              >
                View all questions in {question.subject}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="text-muted-foreground mb-4 line-clamp-3 flex-grow">
        {truncatedDescription ? parse(truncatedDescription) : null}
      </div>

      {/* Tags section with fixed height */}
      <div className="min-h-[40px] mb-4">
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag: string, index: number) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger
                    className="text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full cursor-pointer hover:bg-secondary/80 transition-all duration-200"
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
                  >
                    View all questions in #{tag}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between pt-4 border-t-3 border-border mt-auto gap-3">
        <div className="flex items-center text-sm text-muted-foreground">
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
            {askerName} • {createdAt}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Vote count */}
          <span
            className={`font-medium ${voteColor} flex items-center bg-secondary px-2 py-1 rounded-full border border-border text-sm min-w-[60px] justify-center`}
          >
            {voteCount >= 0 ? (
              <ArrowUp className="h-4 w-4 mr-1.5" />
            ) : (
              <ArrowDown className="h-4 w-4 mr-1.5" />
            )}
            {Math.abs(voteCount)}
          </span>

          {/* Answer count */}
          <span className="flex items-center text-secondary-foreground bg-secondary px-2 py-1 rounded-full border border-border text-sm min-w-[50px] justify-center">
            <MessageSquare className="h-4 w-4 mr-1.5" />
            {question.likesAnswersComments?.answers || 0}
          </span>

          {/* Comment count */}
          <span className="flex items-center text-secondary-foreground bg-secondary px-2 py-1 rounded-full border border-border text-sm min-w-[50px] justify-center">
            <MessageCircle className="h-4 w-4 mr-1.5" />
            {question.likesAnswersComments?.comments || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
