"use client";

import PulsatingLoader from "@/components/Loaders/PulsatingLoader";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Spotlight } from "@/components/ui/spotlight";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import Image from "next/image";
import { format } from "date-fns";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  BookOpen,
  Calendar,
  FileQuestion,
  Hash,
  MessageCircle,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface DashboardQuestion {
  _id: string;
  title?: string;
  description?: string;
  subject?: string;
  tags?: string[];
  createdAt?: string | Date;
}

interface DashboardAnswer {
  _id: string;
  question?: string | { _id: string };
  content?: string;
  createdAt?: string | Date;
}

interface DashboardComment {
  _id: string;
  question?: string | { _id: string };
  answer?: string | { _id: string };
  content?: string;
  createdAt?: string | Date;
}

interface UserProfileData {
  user: {
    id?: string;
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string | null;
    emailAddresses?: unknown;
  } | null;
  questions: DashboardQuestion[];
  answers: DashboardAnswer[];
  comments: DashboardComment[];
  upvotes: number;
  downvotes: number;
}

const DashboardPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const [data, setData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // fetch logged in user details
  const fetchLoggedInUserDetails = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/users/getLoggedInUserProfile`);
      setData(response.data.data as UserProfileData);
      toast.success("Profile loaded");
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fullName = useMemo(() => {
    const first = user?.firstName || data?.user?.firstName || "";
    const last = user?.lastName || data?.user?.lastName || "";
    return `${first} ${last}`.trim() || "Your Dashboard";
  }, [user, data]);

  // metrics calculation
  const metrics = useMemo(() => {
    const questionsCount = data?.questions?.length || 0;
    const answersCount = data?.answers?.length || 0;
    const commentsCount = data?.comments?.length || 0;
    const upvotes = data?.upvotes || 0;
    const downvotes = data?.downvotes || 0;
    const netVotes = upvotes - downvotes;
    return {
      questionsCount,
      answersCount,
      commentsCount,
      upvotes,
      downvotes,
      netVotes,
    };
  }, [data]);

  // recent activity calculation
  const recent = useMemo(() => {
    // by date descending function
    const byDateDesc = <T extends { createdAt?: string | Date }>(items: T[]) =>
      [...items].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    return {
      questions: byDateDesc(data?.questions || []).slice(0, 5),
      answers: byDateDesc(data?.answers || []).slice(0, 5),
      comments: byDateDesc(data?.comments || []).slice(0, 5),
    };
  }, [data]);

  // top subjects calculation
  const topSubjects = useMemo(() => {
    const freq = new Map<string, number>();
    (data?.questions || []).forEach((q) => {
      const subject = (q.subject || "").toString().trim();
      if (!subject) return;
      freq.set(subject, (freq.get(subject) || 0) + 1);
    });
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [data]);

  // top tags calculation
  const topTags = useMemo(() => {
    const freq = new Map<string, number>();
    (data?.questions || []).forEach((q) => {
      (q.tags || []).forEach((tag) => {
        const t = tag?.toString().trim();
        if (!t) return;
        freq.set(t, (freq.get(t) || 0) + 1);
      });
    });
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [data]);

  // goto question
  const gotoQuestion = (id: string | undefined) => {
    if (!id) return;
    router.push(`/question/${id}`);
  };

  useEffect(() => {
    fetchLoggedInUserDetails();
  }, []);

  return (
    <div className="container mx-auto flex flex-col items-center w-full px-6 md:px-10 gap-8 pt-10 md:pt-0">
      {isLoading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <PulsatingLoader />
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center h-[40vh] text-muted-foreground">
          Failed to load data.
        </div>
      ) : (
        <div className="w-full">
          <Spotlight
            className="-top-200 left-0 md:-top-40 md:left-60"
            fill="#1c9cf0"
          />
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary card-shadow-no-hover">
                <Image
                  src={data?.user?.imageUrl || ""}
                  alt="User"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-accent-foreground to-foreground">
                  {fullName}
                </h1>
                <p className="text-muted-foreground text-sm mt-1 font-[900]">
                  Overview of your activity and engagement
                </p>
              </div>
            </div>
            <Spotlight
              className="-top-160 left-0"
              fill="#1c9cf0"
            />
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            <MetricCard
              label="Questions"
              value={metrics.questionsCount}
              Icon={FileQuestion}
              accent="text-primary"
            />
            <MetricCard
              label="Answers"
              value={metrics.answersCount}
              Icon={MessageSquare}
              accent="text-primary"
            />
            <MetricCard
              label="Comments"
              value={metrics.commentsCount}
              Icon={MessageCircle}
              accent="text-primary"
            />
            <MetricCard
              label="Upvotes"
              value={metrics.upvotes}
              Icon={ArrowUp}
              accent="text-green-600 dark:text-green-600"
            />
            <MetricCard
              label="Downvotes"
              value={metrics.downvotes}
              Icon={ArrowDown}
              accent="text-red-600 dark:text-red-600"
            />
            <MetricCard
              label="Net Votes"
              value={metrics.netVotes}
              Icon={TrendingUp}
              accent="text-accent-foreground"
            />
          </div>

          {/* Top Subjects & Tags */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
            {/* Top Subjects */}
            <div className="bg-background border-mode rounded-lg p-6 card-shadow-no-hover hover:scale-[0.99] transition-all duration-300 ease-in-out group">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Top Subjects
                </h2>
                <Badge variant="secondary" className="font-[900]">
                  {topSubjects.length}
                </Badge>
              </div>
              {topSubjects.length === 0 ? (
                <p className="text-muted-foreground">No subjects yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {topSubjects.map(([subject, count]) => (
                    <TooltipProvider key={subject}>
                      <Tooltip>
                        <TooltipTrigger
                          className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full cursor-pointer hover:bg-secondary/80 transition-all duration-300 hover:scale-90 group-hover:filter-shadow hover:shadow-none font-[900] hover:font-[900]!"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/subjects?subject=${subject}`);
                          }}
                        >
                          {subject}({count})
                        </TooltipTrigger>
                        <TooltipContent
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/subjects?subject=${subject}`);
                          }}
                          className="cursor-pointer"
                        >
                          View all questions in {subject}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              )}
            </div>

            {/* Top Tags */}
            <div className="bg-background border-mode rounded-lg p-6 card-shadow-no-hover hover:scale-[0.99] transition-all duration-300 ease-in-out group">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                  <Hash className="h-5 w-5 text-primary" /> Top Tags
                </h2>
                <Badge variant="secondary" className="font-[900]">
                  {topTags.length}
                </Badge>
              </div>
              {topTags.length === 0 ? (
                <p className="text-muted-foreground">No tags yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {topTags.map(([tag, count]) => (
                    <TooltipProvider key={tag}>
                      <Tooltip>
                        <TooltipTrigger
                          className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full cursor-pointer hover:bg-secondary/80 transition-all duration-300 hover:scale-90 group-hover:filter-shadow hover:shadow-none font-[900] hover:font-[900]!"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/tags?tag=${encodeURIComponent(tag)}`);
                          }}
                        >
                          {tag[0] === "#" ? "" : "#"}
                          {tag}({count})
                        </TooltipTrigger>
                        <TooltipContent
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/tags?tag=${encodeURIComponent(tag)}`);
                          }}
                          className="cursor-pointer"
                        >
                          View all questions in {tag[0] === "#" ? "" : "#"}
                          {tag}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
            <ActivityCard
              title="Recent Questions"
              items={recent.questions.map((q) => ({
                id: q._id,
                primary: q.title || "Untitled question",
                secondary: q.subject || "—",
                date: q.createdAt
                  ? format(new Date(q.createdAt), "MMM dd, yyyy 'at' hh:mm a")
                  : "",
              }))}
              onClickItem={(id) => gotoQuestion(id)}
            />

            <ActivityCard
              title="Recent Answers"
              items={recent.answers.map((a) => ({
                id:
                  typeof a.question === "string"
                    ? a.question
                    : (a.question as any)?._id,
                primary:
                  (a.content || "").replace(/<[^>]*>/g, "").slice(0, 80) +
                  ((a.content || "").length > 80 ? "..." : ""),
                secondary: "Answer",
                date: a.createdAt
                  ? format(new Date(a.createdAt), "MMM dd, yyyy 'at' hh:mm a")
                  : "",
              }))}
              onClickItem={(id) => gotoQuestion(id)}
            />

            <ActivityCard
              title="Recent Comments"
              items={recent.comments.map((c) => ({
                id:
                  typeof c.question === "string"
                    ? c.question
                    : (c.question as any)?._id,
                primary:
                  (c.content || "").replace(/<[^>]*>/g, "").slice(0, 80) +
                  ((c.content || "").length > 80 ? "..." : ""),
                secondary: "Comment",
                date: c.createdAt
                  ? format(new Date(c.createdAt), "MMM dd, yyyy 'at' hh:mm a")
                  : "",
              }))}
              onClickItem={(id) => gotoQuestion(id)}
            />
          </div>

          {/* Chart Placeholders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
            <div className="bg-background border-mode rounded-lg p-6 card-shadow-no-hover">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" /> Activity by
                  Month
                </h2>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="h-64 w-full rounded-md bg-muted relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-muted to-background animate-shimmer [background-size:200%_100%]" />
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  Coming soon
                </div>
              </div>
            </div>

            <div className="bg-background border-mode rounded-lg p-6 card-shadow-no-hover">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Engagement
                  Breakdown
                </h2>
              </div>
              <div className="h-64 w-full rounded-md bg-muted relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-muted to-background animate-shimmer [background-size:200%_100%]" />
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  Coming soon
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function MetricCard({
  label,
  value,
  Icon,
  accent,
}: {
  label: string;
  value: number;
  Icon: LucideIcon;
  accent?: string;
}) {
  return (
    <div className="bg-background border-mode rounded-lg p-5 card-shadow-no-hover flex items-center justify-between animate-slide-up hover:scale-[0.99] transition-all duration-300 ease-in-out">
      <div>
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="text-3xl font-bold text-card-foreground mt-1">{value}</p>
      </div>
      <Icon className={`h-6 w-6 ${accent || "text-accent-foreground"}`} />
    </div>
  );
}

function ActivityCard({
  title,
  items,
  onClickItem,
}: {
  title: string;
  items: Array<{
    id?: string;
    primary: string;
    secondary?: string;
    date?: string;
  }>;
  onClickItem: (id: string) => void;
}) {
  return (
    <div className="bg-background border-mode rounded-lg p-6 card-shadow-no-hover">
      <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-muted-foreground">No items yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start justify-between gap-4 p-3 rounded-md border-mode shadow-2xl hover:scale-[0.99] transition-all duration-200 cursor-pointer"
              onClick={() => item.id && onClickItem(item.id)}
            >
              <div className="flex-1">
                <p className="text-card-foreground font-medium line-clamp-1">
                  {item.primary}
                </p>
                <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                  {item.secondary}
                </p>
              </div>
              <span className="text-muted-foreground text-xs whitespace-nowrap">
                {item.date}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DashboardPage;
