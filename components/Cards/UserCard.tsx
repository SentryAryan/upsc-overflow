"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import {
  Book,
  Hash,
  Mail,
  MessageCircle,
  MessageCircleQuestion,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface UserWithMetrics {
  user: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string | null;
    emailAddresses?: { emailAddress: string }[];
    createdAt?: number | string;
  };
  numberOfQuestions: number;
  numberOfAnswers: number;
  numberOfComments: number;
  uniqueTags: string[];
  uniqueSubjects: string[];
  firstQuestion: string;
  totalPages: number;
}

const UserCard = ({
  userWithMetrics,
}: {
  userWithMetrics: UserWithMetrics;
}) => {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const fullName =
    `${userWithMetrics.user.firstName ?? ""} ${
      userWithMetrics.user.lastName ?? ""
    }`.trim() || "Unnamed user";
  const avatarUrl = userWithMetrics.user.imageUrl || undefined;
  const primaryEmail =
    userWithMetrics.user.emailAddresses?.[0]?.emailAddress ?? "";
  const firstNameOnly = (
    userWithMetrics.user.firstName ??
    fullName.split(" ")[0] ??
    ""
  ).trim();

  const createdAtDate = userWithMetrics.user.createdAt
    ? new Date(userWithMetrics.user.createdAt)
    : null;
  const createdAt = createdAtDate
    ? format(createdAtDate, "MMM dd, yyyy 'at' hh:mm a")
    : "N/A";

  const metricsInfo = [
    {
      icon: MessageCircleQuestion,
      value: userWithMetrics.numberOfQuestions || 0,
      label: "questions",
      color: "text-secondary-foreground",
    },
    {
      icon: MessageSquare,
      value: userWithMetrics.numberOfAnswers || 0,
      label: "answers",
      color: "text-secondary-foreground",
    },
    {
      icon: MessageCircle,
      value: userWithMetrics.numberOfComments || 0,
      label: "comments",
      color: "text-secondary-foreground",
    },
    {
      icon: Book,
      value: userWithMetrics.uniqueSubjects?.length || 0,
      label: "subjects",
      color: "text-secondary-foreground",
    },
    {
      icon: Hash,
      value: userWithMetrics.uniqueTags?.length || 0,
      label: "tags",
      color: "text-secondary-foreground",
    },
  ] as const;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateX = (mouseY / rect.height) * -10;
    const rotateY = (mouseX / rect.width) * 10;

    setMousePosition({ x: rotateY, y: rotateX });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const cardStyle = {
    transform: isHovered
      ? `perspective(1000px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg) translateZ(10px)`
      : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
    transition: isHovered ? "none" : "transform 0.3s ease-out",
  } as const;

  return (
    <div
      className="bg-background rounded-lg card-shadow transition-all duration-300 p-3 sm:p-4 md:p-6 border-mode w-full h-full flex flex-col gap-3 sm:gap-4 md:gap-5 cursor-pointer group relative before:absolute before:bg-accent before:inset-0 before:translate-x-[-100%] before:transition-transform overflow-hidden before:duration-300 before:ease-in-out before:rounded-lg hover:before:translate-x-0 animate-slide-up before:shadow-mode-hover"
      ref={cardRef}
      style={cardStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Card Title and User */}
      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-2 sm:gap-3">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={fullName}
              width={28}
              height={28}
              className="rounded-full border border-border w-7 h-7 sm:w-8 sm:h-8"
            />
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/20 rounded-full flex items-center justify-center border border-border flex-shrink-0">
              <span className="text-primary text-xs font-medium">
                {fullName.charAt(0)}
              </span>
            </div>
          )}
          <h1 className="text-base sm:text-lg md:text-xl font-semibold text-card-foreground group-hover:text-primary line-clamp-2 flex-1 justify-center items-center text-center">
            {fullName}
          </h1>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              className="ml-1 sm:ml-2 text-xs sm:text-sm px-2 sm:px-2.5 py-1 rounded-full bg-primary/10 text-primary whitespace-nowrap cursor-pointer hover:bg-primary/20 transition-all duration-300 group-hover:filter-shadow font-[900] border border-primary dark:border-border flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {firstNameOnly || "User"}
            </TooltipTrigger>
            <TooltipContent className="cursor-pointer">
              {firstNameOnly || "User"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* First Question */}
      <div className="text-muted-foreground flex-grow relative text-sm sm:text-base font-[900]">
        {userWithMetrics.firstQuestion ? (
          <>
            {userWithMetrics.firstQuestion}
            {userWithMetrics.numberOfQuestions &&
              userWithMetrics.numberOfQuestions > 1 && (
                <div className="mt-2 text-xs opacity-75 font-[900]">
                  +{userWithMetrics.numberOfQuestions - 1} more questions
                </div>
              )}
          </>
        ) : (
          <span className="inline-flex text-sm w-full justify-center items-center gap-2 bg-secondary text-destructive px-3 py-1.5 rounded-md border border-border font-[900]">
            <MessageCircleQuestion className="h-3 w-3 sm:h-4 sm:w-4" />
            No questions found
          </span>
        )}
      </div>

      {/* Subjects */}
      {Array.isArray(userWithMetrics.uniqueSubjects) &&
        userWithMetrics.uniqueSubjects.length > 0 && (
          <div className="min-h-[40px] relative">
            <div className="flex flex-wrap gap-2">
              {userWithMetrics.uniqueSubjects
                .slice(0, 3)
                .map((subject: string) => (
                  <TooltipProvider key={subject}>
                    <Tooltip>
                      <TooltipTrigger
                        className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full cursor-pointer hover:bg-secondary/80 transition-all duration-300 hover:scale-90 group-hover:filter-shadow hover:shadow-none font-[900] hover:font-[900]!"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/subjects?subject=${encodeURIComponent(subject)}`
                          );
                        }}
                      >
                        {subject}
                      </TooltipTrigger>
                      <TooltipContent
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/subjects?subject=${encodeURIComponent(subject)}`
                          );
                        }}
                        className="cursor-pointer"
                      >
                        View all questions in {subject}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              {userWithMetrics.uniqueSubjects.length > 3 && (
                <span className="text-xs text-muted-foreground px-2 py-1 font-[900]">
                  +{userWithMetrics.uniqueSubjects.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

      {/* Tags */}
      {Array.isArray(userWithMetrics.uniqueTags) &&
        userWithMetrics.uniqueTags.length > 0 && (
          <div className="min-h-[40px] relative">
            <div className="flex flex-wrap gap-2">
              {userWithMetrics.uniqueTags.slice(0, 3).map((tag: string) => (
                <TooltipProvider key={tag}>
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
              {userWithMetrics.uniqueTags.length > 3 && (
                <span className="text-xs text-muted-foreground px-2 py-1 font-[900]">
                  +{userWithMetrics.uniqueTags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

      {/* No subjects */}
      {userWithMetrics.uniqueSubjects.length === 0 && (
        <span className="inline-flex text-sm w-full justify-center items-center gap-2 bg-secondary text-destructive px-3 py-1.5 rounded-md border border-border z-10 font-[900]">
          <Book className="h-3 w-3 sm:h-4 sm:w-4" />
          No subjects found
        </span>
      )}

      {/* No tags */}
      {userWithMetrics.uniqueTags.length === 0 && (
        <span className="inline-flex text-sm w-full justify-center items-center gap-2 bg-secondary text-destructive px-3 py-1.5 rounded-md border border-border z-10 font-[900]">
          <Hash className="h-3 w-3 sm:h-4 sm:w-4" />
          No tags found
        </span>
      )}

      {/* Footer */}
      <div className="flex flex-col lg:flex-row flex-wrap items-start justify-between pt-3 sm:pt-4 border-t border-secondary dark:border-border mt-auto gap-2 sm:gap-3 relative">
        {/* Email and Created At */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 text-xs sm:text-sm text-muted-foreground min-w-0 flex-1 font-[900]">
          <div className="flex items-center">
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-primary/20 rounded-full flex items-center justify-center mr-1 sm:mr-2 flex-shrink-0">
              <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </div>
            <span className="truncate">
              {primaryEmail || userWithMetrics.user.id}
            </span>
          </div>
          <span className="text-xs sm:text-sm opacity-75 ml-7 sm:ml-0 sm:before:content-['•'] sm:before:mx-2 font-[900]">
            {createdAt}
          </span>
        </div>

        {/* Counts */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-shrink-0">
          {metricsInfo.map((metric) => (
            <span
              key={metric.label}
              className={`flex items-center ${metric.color} bg-secondary px-1.5 sm:px-2 py-1 rounded-full border border-border text-xs sm:text-sm min-w-[40px] sm:min-w-[50px] justify-center group-hover:filter-shadow hover:shadow-none hover:scale-90 transition-all duration-300 font-[900]`}
            >
              <metric.icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 font-[900]" />
              <span className="hidden sm:inline">{metric.value}</span>
              <span className="sm:hidden">{metric.value}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
