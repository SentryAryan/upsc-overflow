import { QuestionCardProps } from "@/app/page";
import { format } from "date-fns";
import parse from "html-react-parser";
import { ArrowDown, ArrowUp, MessageCircle, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      ? "text-green-600 dark:text-green-500"
      : "text-red-600 dark:text-red-500";

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all p-6 border border-gray-100 dark:border-gray-700 w-full h-full flex flex-col cursor-pointer"
      onClick={() => router.push(`/question/${question._id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 flex-1">
          {question.title}
        </h1>

        {question.subject && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                className="ml-2 text-xs px-2.5 py-1 rounded-full font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 whitespace-nowrap cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-700 transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/subjects?subject=${question.subject}`);
                }}
              >
                {question.subject}
              </TooltipTrigger>
              <TooltipContent
                type="subject"
                className="dark:bg-blue-700 dark:hover:bg-blue-900 text-blue-200 cursor-pointer font-bold"
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

      <div className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 flex-grow">
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
                    className="text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/tags?tag=${encodeURIComponent(tag)}`);
                    }}
                  >
                    #{tag}
                  </TooltipTrigger>
                  <TooltipContent
                    type="tag"
                    className="dark:bg-blue-700 dark:hover:bg-blue-900 text-blue-200 cursor-pointer font-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/tags?tag=${encodeURIComponent(tag)}`);
                    }}
                  >
                    View all questions in {tag}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          {askerImageUrl ? (
            <Image
              src={askerImageUrl}
              alt={askerName}
              width={28}
              height={28}
              className="rounded-full mr-2 border border-gray-200 dark:border-gray-600"
            />
          ) : (
            <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-2">
              <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                {askerName.charAt(0)}
              </span>
            </div>
          )}
          <span className="truncate">
            {askerName} • {createdAt}
          </span>
        </div>

        <div className="flex space-x-4 mt-2 sm:mt-0">
          <div className="flex items-center text-sm">
            <span
              className={`font-medium ${voteColor} flex items-center justify-center`}
            >
              {voteCount >= 0 ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1" />
              )}
              <p className="text-sm flex items-center justify-center">
                {Math.abs(voteCount)}
              </p>
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <MessageSquare className="h-4 w-4 mr-1" />
            {question.likesAnswersComments?.answers || 0}
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <MessageCircle className="h-4 w-4 mr-1" />
            {question.likesAnswersComments?.comments || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
