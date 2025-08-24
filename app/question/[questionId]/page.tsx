"use client";

import { AnswerFormTA } from "@/components/Forms/AnswerFormTA";
import { CommentFormTA } from "@/components/Forms/CommentFormTA";
import { UpdateAnswerForm } from "@/components/Forms/UpdateAnswerForm";
import { UpdateCommentForm } from "@/components/Forms/UpdateCommentForm";
import { UpdateQuestionForm } from "@/components/Forms/UpdateQuestionForm";
import { LoaderDemo } from "@/components/Loaders/LoaderDemo";
import { AnswerTypeSchema } from "@/db/models/answer.model";
import { QuestionType } from "@/db/models/question.model";
import { setQuestionUpdate } from "@/lib/redux/slices/questionUpdate.slice";
import { User } from "@clerk/backend";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import parse from "html-react-parser";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Edit,
  MessageCircle,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Spotlight } from "../../../components/ui/spotlight";

export interface AnswerWithUser extends AnswerTypeSchema {
  user: User;
  comments?: CommentWithUser[];
  _id: string;
  _doc?: any;
  answerLikes: number;
  answerDislikes: number;
  isLikedByLoggedInUser: boolean;
  isDislikedByLoggedInUser: boolean;
}

export interface CommentWithUser {
  _id: string;
  content: string;
  commenter: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  commentLikes: number;
  commentDislikes: number;
  isLikedByLoggedInUser: boolean;
  isDislikedByLoggedInUser: boolean;
}

const QuestionPage = () => {
  const { questionId } = useParams();
  const dispatch = useDispatch();
  const router = useRouter();
  console.log("This is the questionId", questionId);
  const [question, setQuestion] = useState<QuestionType | null>(null);
  const [answers, setAnswers] = useState<AnswerWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnswerDeleting, setIsAnswerDeleting] = useState("");
  const [isAnswerUpdating, setIsAnswerUpdating] = useState("");
  const [isCommentDeleting, setIsCommentDeleting] = useState("");
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);
  const [expandedCommentAnswer, setExpandedCommentAnswer] = useState<
    string | null
  >(null);
  const { userId } = useAuth();
  const [isCommentLoading, setIsCommentLoading] = useState("");
  const [isAnswerFormExpanded, setIsAnswerFormExpanded] = useState(false);
  const [visibleComments, setVisibleComments] = useState<
    Record<string, boolean>
  >({});
  const [questionComments, setQuestionComments] = useState<CommentWithUser[]>(
    []
  );
  const [isQuestionCommentFormExpanded, setIsQuestionCommentFormExpanded] =
    useState(false);
  const [isQuestionCommentsVisible, setIsQuestionCommentsVisible] =
    useState(false);
  const [isQuestionCommentLoading, setIsQuestionCommentLoading] =
    useState(false);
  const [isQuestionEditFormExpanded, setIsQuestionEditFormExpanded] =
    useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Add state for answer editing
  const [expandedAnswerEdit, setExpandedAnswerEdit] = useState<string | null>(
    null
  );

  // Add state for editing comments
  const [expandedQuestionCommentEdit, setExpandedQuestionCommentEdit] =
    useState<string | null>(null);
  const [expandedAnswerCommentEdit, setExpandedAnswerCommentEdit] = useState<
    string | null
  >(null);

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

  const getQuestionById = async (questionId: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/questions/getQuestionById?questionId=${questionId}`
      );
      const questionCommentsResponse = await axios.get(
        `/api/comments/getAllByQuestionId?questionId=${questionId}`
      );
      setQuestionComments(questionCommentsResponse.data.data.comments);
      console.log("This is the question", response.data.data);
      setQuestion(response.data.data);

      const answersData = response.data.data.answersWithCommentsAndUsers || [];
      setAnswers(answersData as AnswerWithUser[]);

      // Initialize all comments as hidden
      const commentsVisibility: Record<string, boolean> = {};
      answersData.forEach((answer: AnswerWithUser) => {
        commentsVisibility[answer._id] = false;
      });
      setVisibleComments(commentsVisibility);
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLike = async (
    isLiked: boolean,
    questionId: string | null,
    commentId: string | null,
    answerId: string | null
  ) => {
    try {
      const response = await axios.put(`/api/likes/toggleLike`, {
        questionId,
        commentId,
        answerId,
        isLiked,
        liker: userId,
      });

      // If we're updating a question
      if (questionId) {
        const questionLikes = response.data.data.questionLikes;
        const questionDislikes = response.data.data.questionDislikes;
        const isLikedByLoggedInUser = response.data.data.isLikedByLoggedInUser;
        const isDislikedByLoggedInUser =
          response.data.data.isDislikedByLoggedInUser;
        const updatedQuestion = question
          ? {
              ...question,
              questionLikes,
              questionDislikes,
              isLikedByLoggedInUser,
              isDislikedByLoggedInUser,
            }
          : null;
        setQuestion(updatedQuestion);
        dispatch(setQuestionUpdate(true));
      }
      // If we're updating an answer
      else if (answerId) {
        const answerLikes = response.data.data.answerLikes;
        const answerDislikes = response.data.data.answerDislikes;
        const isLikedByLoggedInUser = response.data.data.isLikedByLoggedInUser;
        const isDislikedByLoggedInUser =
          response.data.data.isDislikedByLoggedInUser;

        // Update the answers array with the new like/dislike information
        const updatedAnswers = answers.map((answer) =>
          answer._id === answerId
            ? {
                ...answer,
                answerLikes,
                answerDislikes,
                isLikedByLoggedInUser,
                isDislikedByLoggedInUser,
              }
            : answer
        );

        setAnswers(updatedAnswers as AnswerWithUser[]);
        dispatch(setQuestionUpdate(true));
      }
      // If we're updating a comment
      else if (commentId) {
        const commentLikes = response.data.data.commentLikes;
        const commentDislikes = response.data.data.commentDislikes;
        const isLikedByLoggedInUser = response.data.data.isLikedByLoggedInUser;
        const isDislikedByLoggedInUser =
          response.data.data.isDislikedByLoggedInUser;

        // We need to find which answer this comment belongs to
        const updatedAnswers = answers.map((answer) => {
          if (
            answer.comments &&
            answer.comments.some((comment) => comment._id === commentId)
          ) {
            // Update the specific comment in this answer
            const updatedComments = answer.comments.map((comment) =>
              comment._id === commentId
                ? {
                    ...comment,
                    commentLikes,
                    commentDislikes,
                    isLikedByLoggedInUser,
                    isDislikedByLoggedInUser,
                  }
                : comment
            );

            return {
              ...answer,
              comments: updatedComments,
            };
          }
          return answer;
        });

        setAnswers(updatedAnswers as AnswerWithUser[]);
        setQuestionComments(
          questionComments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  commentLikes,
                  commentDislikes,
                  isLikedByLoggedInUser,
                  isDislikedByLoggedInUser,
                }
              : comment
          )
        );
        dispatch(setQuestionUpdate(true));
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const deleteLike = async (
    questionId: string | null,
    commentId: string | null,
    answerId: string | null
  ) => {
    try {
      const questionID = questionId ? questionId : "";
      const answerID = answerId ? answerId : "";
      const commentID = commentId ? commentId : "";
      const response = await axios.delete(
        `/api/likes/deleteLike?questionId=${questionID}&answerId=${answerID}&commentId=${commentID}&liker=${userId}`
      );

      // If we're updating a question
      if (questionId) {
        const questionLikes = response.data.data.questionLikes;
        const questionDislikes = response.data.data.questionDislikes;
        const isLikedByLoggedInUser = response.data.data.isLikedByLoggedInUser;
        const isDislikedByLoggedInUser =
          response.data.data.isDislikedByLoggedInUser;

        const updatedQuestion = question
          ? {
              ...question,
              questionLikes,
              questionDislikes,
              isLikedByLoggedInUser,
              isDislikedByLoggedInUser,
            }
          : null;
        setQuestion(updatedQuestion);
        dispatch(setQuestionUpdate(true));
      }
      // If we're updating an answer
      else if (answerId) {
        const answerLikes = response.data.data.answerLikes;
        const answerDislikes = response.data.data.answerDislikes;
        const isLikedByLoggedInUser = response.data.data.isLikedByLoggedInUser;
        const isDislikedByLoggedInUser =
          response.data.data.isDislikedByLoggedInUser;

        // Update the answers array with the new like/dislike information
        const updatedAnswers = answers.map((answer) =>
          answer._id === answerId
            ? {
                ...answer,
                answerLikes,
                answerDislikes,
                isLikedByLoggedInUser,
                isDislikedByLoggedInUser,
              }
            : answer
        );

        setAnswers(updatedAnswers as AnswerWithUser[]);
        dispatch(setQuestionUpdate(true));
      }
      // If we're updating a comment
      else if (commentId) {
        const commentLikes = response.data.data.commentLikes;
        const commentDislikes = response.data.data.commentDislikes;
        const isLikedByLoggedInUser = response.data.data.isLikedByLoggedInUser;
        const isDislikedByLoggedInUser =
          response.data.data.isDislikedByLoggedInUser;

        // We need to find which answer this comment belongs to
        const updatedAnswers = answers.map((answer) => {
          if (
            answer.comments &&
            answer.comments.some((comment) => comment._id === commentId)
          ) {
            // Update the specific comment in this answer
            const updatedComments = answer.comments.map((comment) =>
              comment._id === commentId
                ? {
                    ...comment,
                    commentLikes,
                    commentDislikes,
                    isLikedByLoggedInUser,
                    isDislikedByLoggedInUser,
                  }
                : comment
            );

            return {
              ...answer,
              comments: updatedComments,
            };
          }
          return answer;
        });

        setAnswers(updatedAnswers as AnswerWithUser[]);
        setQuestionComments(
          questionComments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  commentLikes,
                  commentDislikes,
                  isLikedByLoggedInUser,
                  isDislikedByLoggedInUser,
                }
              : comment
          )
        );
        dispatch(setQuestionUpdate(true));
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const handleQuestionDelete = async () => {
    try {
      setIsLoading(true);
      const response = await axios.delete(
        `/api/questions/deleteById?questionId=${questionId}`
      );
      if (response.data.success) {
        toast.success("Question deleted successfully");
        router.push("/");
        dispatch(setQuestionUpdate(true));
      }
    } catch (error: any) {
      console.log(error.message);
      toast.error("Failed to delete question");
      setIsLoading(false);
    }
  };

  const handleAnswerDelete = async (answerId: string) => {
    try {
      setIsAnswerDeleting(answerId);
      const response = await axios.delete(
        `/api/answers/deleteById?answerId=${answerId}`
      );
      if (response.data.success) {
        toast.success("Answer deleted successfully");
        setAnswers(answers.filter((answer) => answer._id !== answerId));
        dispatch(setQuestionUpdate(true));
      }
    } catch (error: any) {
      console.log(error.message);
      toast.error("Failed to delete answer");
    } finally {
      setIsAnswerDeleting("");
    }
  };

  const handleCommentDelete = async (
    commentId: string,
    isQuestionComment: boolean = false
  ) => {
    try {
      setIsCommentDeleting(commentId);
      const response = await axios.delete(
        `/api/comments/deleteById?commentId=${commentId}`
      );
      if (response.data.success) {
        toast.success("Comment deleted successfully");

        if (isQuestionComment) {
          // Remove from question comments
          setQuestionComments(
            questionComments.filter((comment) => comment._id !== commentId)
          );
          dispatch(setQuestionUpdate(true));
        } else {
          // Remove from answer comments
          const updatedAnswers = answers.map((answer) => {
            if (
              answer.comments &&
              answer.comments.some((comment) => comment._id === commentId)
            ) {
              return {
                ...answer,
                comments: answer.comments.filter(
                  (comment) => comment._id !== commentId
                ),
              };
            }
            return answer;
          });
          setAnswers(updatedAnswers as AnswerWithUser[]);
          dispatch(setQuestionUpdate(true));
        }
      }
    } catch (error: any) {
      console.log(error.message);
      toast.error("Failed to delete comment");
    } finally {
      setIsCommentDeleting("");
    }
  };

  useEffect(() => {
    console.log("This is the questionId", questionId);
    if (questionId) {
      getQuestionById(questionId as string);
    }
  }, []);

  const toggleCommentForm = (answerId: string) => {
    if (expandedCommentAnswer === answerId) {
      setExpandedCommentAnswer(null);
    } else {
      setExpandedCommentAnswer(answerId);
    }
  };

  const toggleAnswerForm = () => {
    setIsAnswerFormExpanded((prev) => !prev);
  };

  const toggleCommentsVisibility = (answerId: string) => {
    setVisibleComments({
      ...visibleComments,
      [answerId]: !visibleComments[answerId],
    });
  };

  const toggleQuestionEditForm = () => {
    setIsQuestionEditFormExpanded((prev) => !prev);
  };

  // Add toggle function for answer editing
  const toggleAnswerEditForm = (answerId: string) => {
    if (expandedAnswerEdit === answerId) {
      setExpandedAnswerEdit(null);
    } else {
      setExpandedAnswerEdit(answerId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderDemo />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl font-bold">Question not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 flex flex-col gap-6 max-w-[1200px] min-h-screen transition-all duration-300 ease-in-out pt-16">
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />
      {/* Question Section - Enhanced */}
      <div className="bg-background rounded-lg shadow-md hover:shadow-lg p-6 md:p-8 border-2 border-border transition-all group">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-card-foreground flex-1">
            {question.title}
          </h1>

          {/* Edit and Delete buttons - only visible to question author */}
          {question.asker === userId && (
            <div className="flex items-center gap-2 ml-4">
              {isQuestionEditFormExpanded ? (
                <button
                  className="text-sm text-primary hover:text-primary/80 flex items-center bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-1 rounded-full transition-all duration-300 ease-in-out cursor-pointer animate-in"
                  onClick={toggleQuestionEditForm}
                  title="Cancel Edit"
                >
                  Cancel Edit
                </button>
              ) : (
                <button
                  onClick={toggleQuestionEditForm}
                  className="p-2 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-full group cursor-pointer animate-in"
                  title="Edit question"
                >
                  <Edit className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={handleQuestionDelete}
                className="p-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-full transition-all duration-300 ease-in-out group cursor-pointer"
                title="Delete question"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Author info with enhanced styling */}
        <div className="flex flex-wrap items-center mb-6 pb-4 border-b border-border">
          <div className="flex items-center mr-4 mb-2">
            {question.user?.imageUrl ? (
              <div className="rounded-full overflow-hidden border-2 border-primary/20 mr-3 transition-all duration-300 ease-in-out">
                <Image
                  src={question.user.imageUrl}
                  alt={question.user.firstName || "User"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3 transition-all duration-300 ease-in-out">
                <span className="text-primary font-semibold text-sm">
                  {question.user?.firstName?.charAt(0) || "?"}
                </span>
              </div>
            )}
            <div>
              <span className="font-medium text-card-foreground transition-all duration-300 ease-in-out">
                {question.user?.firstName} {question.user?.lastName}
              </span>
              <p className="text-xs text-muted-foreground transition-all duration-300 ease-in-out">
                {new Date(question.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {question.subject && (
            <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                className="ml-auto text-sm px-2.5 py-1 rounded-full bg-primary/10 text-primary whitespace-nowrap cursor-pointer hover:bg-primary/20 transition-all duration-300 group-hover:filter-shadow font-[900] border border-primary dark:border-border"
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

        {/* Question Edit Form - Always rendered with smooth transitions */}
        {question.asker === userId && isQuestionEditFormExpanded && (
          <div
            className={`mt-6 bg-background rounded-lg transition-all duration-300 ease-in-out overflow-hidden flex justify-start items-center animate-slide-up ${
              isQuestionEditFormExpanded
                ? "h-max opacity-100 p-4"
                : "max-h-0 opacity-0 p-0 mt-0"
            }`}
          >
            <UpdateQuestionForm
              userId={userId}
              id={question._id}
              title={question.title}
              description={question.description}
              subject={question.subject}
              currentTags={question.tags || []}
              setIsLoading={setIsLoading}
              question={question}
              setQuestion={setQuestion}
              isQuestionEditFormExpanded={isQuestionEditFormExpanded}
            />
          </div>
        )}

        {/* Content with vote buttons on left like Stack Overflow */}
        <div className="flex">
          {/* Vote buttons on left */}
          <div className="flex flex-col items-center mr-6">
            <button
              onClick={() =>
                question.isLikedByLoggedInUser
                  ? deleteLike(question._id, null, null)
                  : toggleLike(true, question._id, null, null)
              }
              className={`p-1 rounded hover:bg-muted transition-all duration-300 ease-in-out ${
                question.isLikedByLoggedInUser
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <ArrowUp
                className={`w-6 h-6 ${
                  question.isLikedByLoggedInUser ? "fill-current" : ""
                }`}
              />
            </button>

            <span
              className={`text-center font-bold my-2 flex items-center justify-center transition-all duration-300 ease-in-out ${
                (question.questionLikes || 0) -
                  (question.questionDislikes || 0) >=
                0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {(question.questionLikes || 0) -
                (question.questionDislikes || 0) >=
              0 ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1" />
              )}
              <p className="text-sm flex items-center justify-center">
                {Math.abs(
                  (question.questionLikes || 0) -
                    (question.questionDislikes || 0)
                )}
              </p>
            </span>

            <button
              onClick={() =>
                question.isDislikedByLoggedInUser
                  ? deleteLike(question._id, null, null)
                  : toggleLike(false, question._id, null, null)
              }
              className={`p-1 rounded hover:bg-muted transition-all duration-300 ease-in-out ${
                question.isDislikedByLoggedInUser
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              <ArrowDown
                className={`w-6 h-6 ${
                  question.isDislikedByLoggedInUser ? "fill-current" : ""
                }`}
              />
            </button>
          </div>

          {/* Question content */}
          <div className="prose prose-lg dark:prose-invert max-w-[1030px] flex-1 text-foreground overflow-x-auto transition-all duration-300 ease-in-out">
            <div className="w-max">{parse(question.description)}</div>
          </div>
        </div>

        {/* Tags with improved styling */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {question.tags.map((tag, index) => (
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

        {/* Question Comments Section */}
        <div className="mt-6 pl-4 md:pl-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsQuestionCommentsVisible((prev) => !prev)}
                className="text-sm text-muted-foreground flex items-center hover:text-foreground transition-all duration-300 ease-in-out"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                <span>{questionComments?.length || 0} Comments</span>
                {isQuestionCommentsVisible ? (
                  <ChevronUp className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </button>
              <button
                onClick={() =>
                  setIsQuestionCommentFormExpanded((prev) => !prev)
                }
                className="text-sm text-primary hover:text-primary/80 flex items-center bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-1 rounded-full transition-all duration-300 ease-in-out cursor-pointer animate-in"
              >
                {isQuestionCommentFormExpanded ? "Cancel" : "Add Comment"}
              </button>
            </div>
          </div>

          {/* Question Comment Form - Always rendered with smooth transitions */}
          {isQuestionCommentFormExpanded && (
            <div
              className={`mt-3 mb-6 bg-background rounded-lg border border-border transition-all duration-300 ease-in-out overflow-hidden animate-slide-up ${
                isQuestionCommentFormExpanded
                  ? "h-max opacity-100 p-4"
                  : "max-h-0 opacity-0 p-0 mb-0 mt-0"
              }`}
            >
              <CommentFormTA
                questionId={questionId as string}
                userId={userId || ""}
                setIsCommentLoading={setIsCommentLoading}
                isCommentLoading={isCommentLoading}
                questionComments={questionComments}
                setQuestionComments={setQuestionComments}
                isQuestionCommentLoading={isQuestionCommentLoading}
                setIsQuestionCommentLoading={setIsQuestionCommentLoading}
              />
            </div>
          )}

          {/* Display Question Comments */}
          {isQuestionCommentLoading ? (
            <div className="flex justify-center items-center py-8">
              <LoaderDemo />
            </div>
          ) : (
            <>
              {questionComments && questionComments.length > 0 && (
                <div
                  className={`mt-4 pl-2 border-l-4 border-accent space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${
                    isQuestionCommentsVisible
                      ? "h-max opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {questionComments.map(
                    (comment: CommentWithUser, commentIndex: number) => (
                      <div
                        key={commentIndex}
                        className="text-sm p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all duration-300 ease-in-out relative border border-border/50"
                      >
                        {/* Loader overlay for deleting comment */}
                        {isCommentDeleting === comment._id && (
                          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg transition-all duration-300 ease-in-out">
                            <div className="flex flex-col items-center gap-3">
                              <LoaderDemo />
                              <span className="text-sm text-muted-foreground font-medium">
                                Deleting comment...
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start">
                          {/* Vote buttons for comment */}
                          <div className="flex flex-col items-center mr-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                comment.isLikedByLoggedInUser
                                  ? deleteLike(null, comment._id, null)
                                  : toggleLike(true, null, comment._id, null);
                              }}
                              className={`p-1 rounded hover:bg-muted transition-all duration-300 ease-in-out ${
                                comment.isLikedByLoggedInUser
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                              disabled={isCommentDeleting === comment._id}
                            >
                              <ArrowUp
                                className={`w-4 h-4 ${
                                  comment.isLikedByLoggedInUser
                                    ? "fill-current"
                                    : ""
                                }`}
                              />
                            </button>

                            <span
                              className={`text-center font-medium text-xs my-1 flex items-center justify-center transition-all duration-300 ease-in-out ${
                                (comment.commentLikes || 0) -
                                  (comment.commentDislikes || 0) >=
                                0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {(comment.commentLikes || 0) -
                                (comment.commentDislikes || 0) >=
                              0 ? (
                                <ArrowUp className="h-3 w-3 mr-0.5" />
                              ) : (
                                <ArrowDown className="h-3 w-3 mr-0.5" />
                              )}
                              <p className="text-xs flex items-center justify-center">
                                {Math.abs(
                                  (comment.commentLikes || 0) -
                                    (comment.commentDislikes || 0)
                                )}
                              </p>
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                comment.isDislikedByLoggedInUser
                                  ? deleteLike(null, comment._id, null)
                                  : toggleLike(false, null, comment._id, null);
                              }}
                              className={`p-1 rounded hover:bg-muted transition-all duration-300 ease-in-out ${
                                comment.isDislikedByLoggedInUser
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                              }`}
                              disabled={isCommentDeleting === comment._id}
                            >
                              <ArrowDown
                                className={`w-4 h-4 ${
                                  comment.isDislikedByLoggedInUser
                                    ? "fill-current"
                                    : ""
                                }`}
                              />
                            </button>
                          </div>

                          {/* Comment content */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                {comment.user?.imageUrl ? (
                                  <Image
                                    src={comment.user.imageUrl}
                                    alt={comment.user.firstName || "User"}
                                    width={24}
                                    height={24}
                                    className="rounded-full mr-2 border border-border transition-all duration-300 ease-in-out"
                                  />
                                ) : (
                                  <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center mr-2 transition-all duration-300 ease-in-out">
                                    <span className="text-muted-foreground text-xs">
                                      {comment.user?.firstName?.charAt(0) ||
                                        "?"}
                                    </span>
                                  </div>
                                )}
                                <span className="font-medium text-xs mr-2 text-foreground transition-all duration-300 ease-in-out">
                                  {comment.user?.firstName}{" "}
                                  {comment.user?.lastName}
                                </span>
                                <span className="text-xs text-muted-foreground transition-all duration-300 ease-in-out">
                                  {new Date(
                                    comment.createdAt
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>

                              {/* Delete button - only visible to comment author */}
                              {comment.commenter === userId && (
                                <div className="flex gap-1">
                                  {expandedQuestionCommentEdit ===
                                  comment._id ? (
                                    <button
                                      className="text-xs text-primary hover:text-primary/80 flex items-center bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-1 rounded-full transition-all duration-300 ease-in-out cursor-pointer animate-in"
                                      onClick={() =>
                                        setExpandedQuestionCommentEdit(null)
                                      }
                                      title="Cancel Edit"
                                      disabled={
                                        isCommentDeleting === comment._id
                                      }
                                    >
                                      Cancel Edit
                                    </button>
                                  ) : (
                                    <button
                                      className="p-1 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-full group cursor-pointer animate-in transition-all duration-300 ease-in-out"
                                      title="Edit comment"
                                      disabled={
                                        isCommentDeleting === comment._id
                                      }
                                      onClick={() =>
                                        setExpandedQuestionCommentEdit(
                                          comment._id
                                        )
                                      }
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() =>
                                      handleCommentDelete(comment._id, true)
                                    }
                                    disabled={isCommentDeleting === comment._id}
                                    className="p-1 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-full transition-all duration-300 ease-in-out"
                                    title="Delete comment"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="text-foreground text-sm break-words whitespace-pre-wrap max-w-[125ch] overflow-x-auto transition-all duration-300 ease-in-out">
                              {parse(comment.content)}
                            </div>
                            {/* UpdateCommentForm for question comment */}
                            {expandedQuestionCommentEdit === comment._id && (
                              <div className="mt-3 mb-2 bg-background rounded-lg border border-border transition-all duration-300 ease-in-out overflow-hidden animate-slide-up p-2">
                                <UpdateCommentForm
                                  userId={userId || ""}
                                  questionId={questionId as string}
                                  commentId={comment._id}
                                  setQuestionComments={setQuestionComments}
                                  questionComments={questionComments}
                                  isQuestionCommentLoading={
                                    isQuestionCommentLoading
                                  }
                                  setIsQuestionCommentLoading={
                                    setIsQuestionCommentLoading
                                  }
                                  isCommentLoading={isCommentLoading}
                                  setIsCommentLoading={setIsCommentLoading}
                                  currentContent={comment.content}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Combined Answer Sections with common loader */}
      {isLoadingAnswers ? (
        <div className="flex justify-center items-center py-12">
          <LoaderDemo />
        </div>
      ) : (
        <>
          {/* Add Answer Section */}
          <div
            className="bg-background rounded-lg shadow-md hover:shadow-lg p-6 md:p-8 border-2 border-border transition-all group"
            // These are the lines for the card hover effect(Title in the direction of the mouse)
            // ref={cardRef}
            // style={cardStyle}
            // onMouseMove={handleMouseMove}
            // onMouseEnter={handleMouseEnter}
            // onMouseLeave={handleMouseLeave}
          >
            {/* Answer Form Header */}
            <div className="flex items-center justify-between relative">
              <h2 className="text-xl md:text-2xl font-bold text-card-foreground transition-all duration-300 ease-in-out group-hover:text-primary">
                Your Answer
              </h2>
              <button
                onClick={toggleAnswerForm}
                className="text-sm text-primary hover:text-primary/80 flex items-center bg-primary/10 hover:bg-primary/20 border border-primary/20 px-4 py-2 rounded-full transition-all duration-300 ease-in-out cursor-pointer animate-in group-hover:filter-shadow font-[900]"
              >
                {isAnswerFormExpanded ? "Cancel" : "Give Answer"}
              </button>
            </div>

            {/* Answer form - Conditionally rendered with smooth transitions */}
            {isAnswerFormExpanded && (
              <div
                className={`mt-6 transition-all duration-300 ease-in-out  overflow-hidden animate-slide-up relative rounded-md border-2 border-border ${
                  isAnswerFormExpanded
                    ? "max-h-[600px] opacity-100"
                    : "max-h-0 opacity-0 mt-0"
                }`}
              >
                <AnswerFormTA
                  questionId={questionId as string}
                  userId={userId || ""}
                  setIsLoadingAnswers={setIsLoadingAnswers}
                  setAnswers={setAnswers}
                  answers={answers}
                  isLoadingAnswers={isLoadingAnswers}
                />
              </div>
            )}
          </div>

          {/* Answers Section - Enhanced */}
          <div className="bg-background rounded-lg shadow-md hover:shadow-lg p-6 md:p-8 border-2 border-border transition-all">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-card-foreground flex items-center transition-all duration-300 ease-in-out">
              Answers
              <span className="ml-3 text-sm bg-secondary text-secondary-foreground font-medium px-2.5 py-1 rounded-full">
                {answers.length}
              </span>
            </h2>

            {answers.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-lg transition-all duration-300 ease-in-out">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4 transition-all duration-300 ease-in-out" />
                <p className="text-muted-foreground font-medium transition-all duration-300 ease-in-out">
                  No answers yet. Be the first to answer!
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {answers.map((answer: AnswerWithUser, index: number) => (
                  <div
                    key={index}
                    className={`${
                      index > 0 ? "border-t-3 border-border pt-8" : ""
                    } transition-all duration-300 ease-in-out relative`}
                  >
                    {/* Loader overlay for the entire answer */}
                    {(isAnswerDeleting === answer._id ||
                      isAnswerUpdating === answer._id) && (
                      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg transition-all duration-300 ease-in-out">
                        <div className="flex flex-col items-center gap-3">
                          <LoaderDemo />
                          <span className="text-sm text-muted-foreground font-medium">
                            {isAnswerDeleting === answer._id
                              ? "Deleting answer..."
                              : "Updating answer..."}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Answer header with better styling */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {answer.user?.imageUrl ? (
                          <div className="rounded-full overflow-hidden border-2 border-primary/20 mr-3 transition-all duration-300 ease-in-out">
                            <Image
                              src={answer.user.imageUrl}
                              alt={answer.user.firstName || "User"}
                              width={36}
                              height={36}
                              className="rounded-full"
                            />
                          </div>
                        ) : (
                          <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center mr-3 transition-all duration-300 ease-in-out">
                            <span className="text-primary font-semibold text-sm">
                              {answer.user?.firstName?.charAt(0) || "?"}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-card-foreground transition-all duration-300 ease-in-out">
                            {answer.user?.firstName} {answer.user?.lastName}
                          </span>
                          <p className="text-xs text-muted-foreground transition-all duration-300 ease-in-out">
                            {new Date(answer.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Edit and Delete buttons - only visible to answer author */}
                      {answer.answerer === userId && (
                        <div className="flex items-center gap-2 ml-4">
                          {expandedAnswerEdit === answer._id ? (
                            <button
                              className="text-sm text-primary hover:text-primary/80 flex items-center bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-1 rounded-full transition-all duration-300 ease-in-out cursor-pointer animate-in"
                              onClick={() => toggleAnswerEditForm(answer._id)}
                              title="Cancel Edit"
                              disabled={
                                isAnswerUpdating === answer._id ||
                                isAnswerDeleting === answer._id
                              }
                            >
                              Cancel Edit
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleAnswerEditForm(answer._id)}
                              className="p-2 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-full group animate-in transition-all duration-300 ease-in-out cursor-pointer"
                              title="Edit answer"
                              disabled={
                                isAnswerUpdating === answer._id ||
                                isAnswerDeleting === answer._id
                              }
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleAnswerDelete(answer._id)}
                            disabled={
                              isAnswerDeleting === answer._id ||
                              isAnswerUpdating === answer._id
                            }
                            className="p-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-full transition-all duration-300 ease-in-out group cursor-pointer"
                            title="Delete answer"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Answer Edit Form - Conditionally rendered with smooth transitions */}
                    {answer.answerer === userId &&
                      expandedAnswerEdit === answer._id && (
                        <div
                          className={`my-6 border-3 border-mode bg-background rounded-lg transition-all duration-300 ease-in-out overflow-hidden flex justify-start items-center animate-slide-up ${
                            expandedAnswerEdit === answer._id
                              ? "h-max opacity-100 p-4"
                              : "max-h-0 opacity-0 p-0 mt-0"
                          }`}
                        >
                          <UpdateAnswerForm
                            userId={userId || ""}
                            setIsAnswerUpdating={setIsAnswerUpdating}
                            isAnswerUpdating={isAnswerUpdating}
                            questionId={questionId as string}
                            setAnswers={setAnswers}
                            answers={answers}
                            answerId={answer._id}
                            currentContent={answer.content}
                          />
                        </div>
                      )}

                    {/* Answer content with better styling */}
                    <div className="flex">
                      {/* Vote buttons on left */}
                      <div className="flex flex-col items-center mr-6">
                        <button
                          onClick={() =>
                            answer.isLikedByLoggedInUser
                              ? deleteLike(null, null, answer._id)
                              : toggleLike(true, null, null, answer._id)
                          }
                          className={`p-1 rounded hover:bg-muted transition-all duration-300 ease-in-out ${
                            answer.isLikedByLoggedInUser
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                          disabled={
                            isAnswerDeleting === answer._id ||
                            isAnswerUpdating === answer._id
                          }
                        >
                          <ArrowUp
                            className={`w-6 h-6 ${
                              answer.isLikedByLoggedInUser ? "fill-current" : ""
                            }`}
                          />
                        </button>

                        <span
                          className={`text-center font-bold my-2 flex items-center justify-center transition-all duration-300 ease-in-out ${
                            (answer.answerLikes || 0) -
                              (answer.answerDislikes || 0) >=
                            0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {(answer.answerLikes || 0) -
                            (answer.answerDislikes || 0) >=
                          0 ? (
                            <ArrowUp className="h-4 w-4 mr-1" />
                          ) : (
                            <ArrowDown className="h-4 w-4 mr-1" />
                          )}
                          <p className="text-sm flex items-center justify-center">
                            {Math.abs(
                              (answer.answerLikes || 0) -
                                (answer.answerDislikes || 0)
                            )}
                          </p>
                        </span>

                        <button
                          onClick={() =>
                            answer.isDislikedByLoggedInUser
                              ? deleteLike(null, null, answer._id)
                              : toggleLike(false, null, null, answer._id)
                          }
                          className={`p-1 rounded hover:bg-muted transition-all duration-300 ease-in-out ${
                            answer.isDislikedByLoggedInUser
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                          disabled={
                            isAnswerDeleting === answer._id ||
                            isAnswerUpdating === answer._id
                          }
                        >
                          <ArrowDown
                            className={`w-6 h-6 ${
                              answer.isDislikedByLoggedInUser
                                ? "fill-current"
                                : ""
                            }`}
                          />
                        </button>
                      </div>

                      {/* Answer content */}
                      <div className="prose prose-md dark:prose-invert max-w-none flex-1 text-foreground overflow-x-auto transition-all duration-300 ease-in-out">
                        <div className="w-max">{parse(answer.content)}</div>
                      </div>
                    </div>

                    {/* Comment section - Enhanced */}
                    <div className="mt-6 pl-4 md:pl-12">
                      {/* Comment toggle and add button */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <button
                            disabled={
                              isAnswerDeleting === answer._id ||
                              isAnswerUpdating === answer._id
                            }
                            onClick={() => toggleCommentsVisibility(answer._id)}
                            className="text-sm text-muted-foreground flex items-center hover:text-foreground transition-all duration-300 ease-in-out"
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            <span>{answer.comments?.length || 0} Comments</span>
                            {visibleComments[answer._id] ? (
                              <ChevronUp className="h-4 w-4 ml-1" />
                            ) : (
                              <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              answer._id && toggleCommentForm(answer._id)
                            }
                            className="text-sm text-primary hover:text-primary/80 flex items-center bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-1 rounded-full transition-all duration-300 ease-in-out cursor-pointer animate-in"
                            disabled={
                              isAnswerDeleting === answer._id ||
                              isAnswerUpdating === answer._id
                            }
                          >
                            {expandedCommentAnswer === answer._id
                              ? "Cancel"
                              : "Add Comment"}
                          </button>
                        </div>
                      </div>

                      {/* Comment form - Always rendered with smooth transitions */}
                      {answer._id && expandedCommentAnswer === answer._id && (
                        <div
                          className={`mt-3 mb-6 bg-background rounded-lg border border-border transition-all duration-300 ease-in-out overflow-hidden animate-slide-up ${
                            answer._id && expandedCommentAnswer === answer._id
                              ? "h-max opacity-100 p-4"
                              : "max-h-0 opacity-0 p-0 mb-0 mt-0"
                          }`}
                        >
                          <CommentFormTA
                            questionId={questionId as string}
                            userId={userId || ""}
                            setIsCommentLoading={setIsCommentLoading}
                            isCommentLoading={isCommentLoading}
                            setAnswers={setAnswers}
                            answers={answers}
                            answerId={answer._id}
                            isQuestionCommentLoading={isQuestionCommentLoading}
                            setIsQuestionCommentLoading={
                              setIsQuestionCommentLoading
                            }
                          />
                        </div>
                      )}

                      {/* Display comments with enhanced styling */}
                      {isCommentLoading === answer._id ? (
                        <div className="flex justify-center items-center py-8">
                          <LoaderDemo />
                        </div>
                      ) : (
                        <>
                          {answer.comments && answer.comments.length > 0 && (
                            <div
                              className={`mt-4 pl-2 border-l-4 border-accent space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${
                                visibleComments[answer._id]
                                  ? "max-h-[2000px] opacity-100"
                                  : "max-h-0 opacity-0"
                              }`}
                            >
                              {answer.comments.map(
                                (
                                  comment: CommentWithUser,
                                  commentIndex: number
                                ) => (
                                  <div
                                    key={commentIndex}
                                    className="text-sm p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all duration-300 ease-in-out relative border border-border/50"
                                  >
                                    {/* Loader overlay for deleting comment */}
                                    {isCommentDeleting === comment._id && (
                                      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg transition-all duration-300 ease-in-out">
                                        <div className="flex flex-col items-center gap-3">
                                          <LoaderDemo />
                                          <span className="text-sm text-muted-foreground font-medium">
                                            Deleting comment...
                                          </span>
                                        </div>
                                      </div>
                                    )}

                                    <div className="flex items-start">
                                      {/* Vote buttons for comment */}
                                      <div className="flex flex-col items-center mr-3">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            comment.isLikedByLoggedInUser
                                              ? deleteLike(
                                                  null,
                                                  comment._id,
                                                  null
                                                )
                                              : toggleLike(
                                                  true,
                                                  null,
                                                  comment._id,
                                                  null
                                                );
                                          }}
                                          className={`p-1 rounded hover:bg-muted transition-all duration-300 ease-in-out ${
                                            comment.isLikedByLoggedInUser
                                              ? "text-primary"
                                              : "text-muted-foreground"
                                          }`}
                                          disabled={
                                            isCommentDeleting === comment._id
                                          }
                                        >
                                          <ArrowUp
                                            className={`w-4 h-4 ${
                                              comment.isLikedByLoggedInUser
                                                ? "fill-current"
                                                : ""
                                            }`}
                                          />
                                        </button>

                                        <span
                                          className={`text-center font-medium text-xs my-1 flex items-center justify-center transition-all duration-300 ease-in-out ${
                                            (comment.commentLikes || 0) -
                                              (comment.commentDislikes || 0) >=
                                            0
                                              ? "text-green-600 dark:text-green-400"
                                              : "text-red-600 dark:text-red-400"
                                          }`}
                                        >
                                          {(comment.commentLikes || 0) -
                                            (comment.commentDislikes || 0) >=
                                          0 ? (
                                            <ArrowUp className="h-3 w-3 mr-0.5" />
                                          ) : (
                                            <ArrowDown className="h-3 w-3 mr-0.5" />
                                          )}
                                          <p className="text-xs flex items-center justify-center">
                                            {Math.abs(
                                              (comment.commentLikes || 0) -
                                                (comment.commentDislikes || 0)
                                            )}
                                          </p>
                                        </span>

                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            comment.isDislikedByLoggedInUser
                                              ? deleteLike(
                                                  null,
                                                  comment._id,
                                                  null
                                                )
                                              : toggleLike(
                                                  false,
                                                  null,
                                                  comment._id,
                                                  null
                                                );
                                          }}
                                          className={`p-1 rounded hover:bg-muted transition-all duration-300 ease-in-out ${
                                            comment.isDislikedByLoggedInUser
                                              ? "text-destructive"
                                              : "text-muted-foreground"
                                          }`}
                                          disabled={
                                            isCommentDeleting === comment._id
                                          }
                                        >
                                          <ArrowDown
                                            className={`w-4 h-4 ${
                                              comment.isDislikedByLoggedInUser
                                                ? "fill-current"
                                                : ""
                                            }`}
                                          />
                                        </button>
                                      </div>

                                      {/* Comment content */}
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center">
                                            {comment.user?.imageUrl ? (
                                              <Image
                                                src={comment.user.imageUrl}
                                                alt={
                                                  comment.user.firstName ||
                                                  "User"
                                                }
                                                width={24}
                                                height={24}
                                                className="rounded-full mr-2 border border-border transition-all duration-300 ease-in-out"
                                              />
                                            ) : (
                                              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center mr-2 transition-all duration-300 ease-in-out">
                                                <span className="text-muted-foreground text-xs">
                                                  {comment.user?.firstName?.charAt(
                                                    0
                                                  ) || "?"}
                                                </span>
                                              </div>
                                            )}
                                            <span className="font-medium text-xs mr-2 text-foreground transition-all duration-300 ease-in-out">
                                              {comment.user?.firstName}{" "}
                                              {comment.user?.lastName}
                                            </span>
                                            <span className="text-xs text-muted-foreground transition-all duration-300 ease-in-out">
                                              {new Date(
                                                comment.createdAt
                                              ).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                              })}
                                            </span>
                                          </div>

                                          {/* Delete button - only visible to comment author */}
                                          {comment.commenter === userId && (
                                            <div className="flex gap-1">
                                              {expandedAnswerCommentEdit ===
                                              comment._id ? (
                                                <button
                                                  className="text-xs text-primary hover:text-primary/80 flex items-center bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-1 rounded-full transition-all duration-300 ease-in-out cursor-pointer animate-in"
                                                  onClick={() =>
                                                    setExpandedAnswerCommentEdit(
                                                      null
                                                    )
                                                  }
                                                  title="Cancel Edit"
                                                  disabled={
                                                    isCommentDeleting ===
                                                    comment._id
                                                  }
                                                >
                                                  Cancel Edit
                                                </button>
                                              ) : (
                                                <button
                                                  className="p-1 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-full group cursor-pointer animate-in transition-all duration-300 ease-in-out"
                                                  title="Edit comment"
                                                  disabled={
                                                    isCommentDeleting ===
                                                    comment._id
                                                  }
                                                  onClick={() =>
                                                    setExpandedAnswerCommentEdit(
                                                      comment._id
                                                    )
                                                  }
                                                >
                                                  <Edit className="h-3 w-3" />
                                                </button>
                                              )}
                                              <button
                                                onClick={() =>
                                                  handleCommentDelete(
                                                    comment._id,
                                                    false
                                                  )
                                                }
                                                disabled={
                                                  isCommentDeleting ===
                                                  comment._id
                                                }
                                                className="p-1 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-full transition-all duration-300 ease-in-out"
                                                title="Delete comment"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                        <div className="text-foreground text-sm break-words whitespace-pre-wrap max-w-[125ch] overflow-x-auto transition-all duration-300 ease-in-out">
                                          {parse(comment.content)}
                                        </div>
                                        {/* UpdateCommentForm for answer comment */}
                                        {expandedAnswerCommentEdit ===
                                          comment._id && (
                                          <div className="mt-3 mb-2 bg-background rounded-lg border border-border transition-all duration-300 ease-in-out overflow-hidden animate-slide-up p-2">
                                            <UpdateCommentForm
                                              userId={userId || ""}
                                              questionId={questionId as string}
                                              commentId={comment._id}
                                              setAnswers={setAnswers}
                                              answers={answers}
                                              answerId={answer._id}
                                              isCommentLoading={
                                                isCommentLoading
                                              }
                                              setIsCommentLoading={
                                                setIsCommentLoading
                                              }
                                              isQuestionCommentLoading={
                                                isQuestionCommentLoading
                                              }
                                              setIsQuestionCommentLoading={
                                                setIsQuestionCommentLoading
                                              }
                                              currentContent={comment.content}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionPage;
