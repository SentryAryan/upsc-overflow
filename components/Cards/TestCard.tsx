import { models } from "@/app/test/page";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Doc } from "@/convex/_generated/dataModel";
import { format } from "date-fns";
import { Book, Bot, Brain, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type ComponentType, type SVGProps } from "react";

type Test = Doc<"tests">;

interface TestCardProps {
  test: Test;
}

const TestCard = ({ test }: TestCardProps) => {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const createdAt = test._creationTime
    ? format(new Date(test._creationTime), "MMM dd, yyyy 'at' hh:mm a")
    : "N/A";

  const creatorName = test.creator || "AI Generated";
  const AiModelIcon: ComponentType<SVGProps<SVGSVGElement>> = (models.find(
    (model) => model.value === test.ai_model
  )?.icon || Brain) as ComponentType<SVGProps<SVGSVGElement>>;
  const aiModelName =
    models.find((model) => model.value === test.ai_model)?.name ||
    "AI Generated";
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
  };

  const metricsInfo = [
    {
      icon: Brain,
      value: test.answers?.length || 0,
      label: "answers",
      color: "text-secondary-foreground",
    },
    {
      icon: MessageSquare,
      value: test.questions
        ? test.questions.split("\n").filter((q) => q.trim()).length
        : 0,
      label: "questions",
      color: "text-secondary-foreground",
    },
    {
      icon: Bot,
      value: 1,
      label: "ai-review",
      color: "text-secondary-foreground",
    },
    {
      icon: Book,
      value: test.subject ? 1 : 0,
      label: "subject",
      color: "text-secondary-foreground",
    },
  ];

  return (
    <div
      className="bg-background rounded-lg card-shadow transition-all duration-300 p-6 border-mode w-full h-full flex flex-col cursor-pointer group relative before:absolute before:bg-accent before:inset-0 before:w-full before:translate-x-[-100%] before:transition-transform overflow-hidden before:duration-300 before:ease-in-out before:rounded-lg hover:before:translate-x-[0%] animate-slide-up before:shadow-mode-hover"
      ref={cardRef}
      style={cardStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => router.push(`/test/view?testId=${test._id}`)}
    >
      {/* Card Title and AI Model */}
      <div className="flex items-start justify-between mb-3 relative">
        <h1 className="text-xl font-semibold text-card-foreground mb-2 flex-1 group-hover:text-primary">
          AI Generated Test
        </h1>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              className="ml-2 text-sm px-2.5 py-1 rounded-full bg-primary/10 text-primary whitespace-nowrap cursor-pointer hover:bg-primary/20 transition-all duration-300 group-hover:filter-shadow font-[900] border border-primary dark:border-border w-max flex justify-center items-center"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <AiModelIcon className="h-3 w-3 mr-1" />
              {aiModelName}
            </TooltipTrigger>
            <TooltipContent
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="cursor-pointer"
            >
              AI Model: {test.ai_model}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Test Questions Preview */}
      <div className="text-muted-foreground mb-4 line-clamp-3 flex-grow relative">
        <div className="text-sm font-[900] mb-2">Questions Preview:</div>
        {test.questions ? (
          <div className="text-xs opacity-90">
            {test.questions
              .split("\n")
              .slice(0, 2)
              .map((question, index) => (
                <div key={index} className="mb-1 truncate">
                  {index + 1}. {question.trim()}
                </div>
              ))}
            {test.questions.split("\n").length > 2 && (
              <div className="text-xs opacity-75 mt-1">
                +{test.questions.split("\n").length - 2} more questions...
              </div>
            )}
          </div>
        ) : (
          "No questions available"
        )}
      </div>

      {/* Subject section */}
      <div className="min-h-[40px] mb-4 relative">
        {test.subject && (
          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full cursor-pointer hover:bg-secondary/80 transition-all duration-300 hover:scale-90 group-hover:filter-shadow hover:shadow-none font-[900] hover:font-[900]!"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(
                      `/subjects?subject=${encodeURIComponent(test.subject)}`
                    );
                  }}
                >
                  {test.subject}
                </TooltipTrigger>
                <TooltipContent
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(
                      `/subjects?subject=${encodeURIComponent(test.subject)}`
                    );
                  }}
                  className="cursor-pointer"
                >
                  View all tests in {test.subject}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        {!test.subject && (
          <span className="inline-flex text-sm w-full justify-center items-center gap-2 bg-secondary text-destructive px-3 py-1.5 rounded-md border border-border z-10 font-[900]">
            <Book className="h-3 w-3 sm:h-4 sm:w-4" />
            No subject found
          </span>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex flex-wrap items-center justify-between pt-4 border-t border-secondary dark:border-border mt-auto gap-3 relative">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 text-sm text-muted-foreground">
          <div className="flex items-center">
            <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center mr-2">
              <Bot className="h-3 w-3 text-primary" />
            </div>
            <span className="truncate font-[900]">AI Generated</span>
          </div>
          <span className="text-xs sm:text-sm opacity-75 ml-9 sm:ml-0 sm:before:content-['•'] sm:before:mx-2 font-[900]">
            {createdAt}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {metricsInfo.map((metric) => (
            <span
              key={metric.label}
              className={`flex items-center ${metric.color} bg-secondary px-2 py-1 rounded-full border border-border text-sm min-w-[50px] justify-center group-hover:filter-shadow hover:shadow-none font-[900] hover:scale-90 transition-all duration-300`}
            >
              <metric.icon className="h-4 w-4 mr-1.5 font-[900]" />
              {metric.value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestCard;
