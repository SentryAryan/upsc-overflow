"use client";

import { AnswerFormTA } from "@/components/Forms/AnswerFormTA";
import { CommentFormTA } from "@/components/Forms/CommentFormTA";
import { UpdateQuestionForm } from "@/components/Forms/UpdateQuestionForm";
import { LoaderDemo } from "@/components/Loaders/LoaderDemo";
import { AnswerTypeSchema } from "@/db/models/answer.model";
import { QuestionType } from "@/db/models/question.model";
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
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  const router = useRouter();
  console.log("This is the questionId", questionId);
  const [question, setQuestion] = useState<QuestionType | null>(null);
  const [answers, setAnswers] = useState<AnswerWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnswerDeleting, setIsAnswerDeleting] = useState("");
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
  const [isQuestionEditFormExpanded, setIsQuestionEditFormExpanded] = useState(false);

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
      }
    } catch (error: any) {
      console.log(error.message);
      toast.error("Failed to delete answer");
    } finally {
      setIsAnswerDeleting("");
    }
  };

  const handleCommentDelete = async (commentId: string, isQuestionComment: boolean = false) => {
    try {
      setIsCommentDeleting(commentId);
      const response = await axios.delete(
        `/api/comments/deleteById?commentId=${commentId}`
      );
      if (response.data.success) {
        toast.success("Comment deleted successfully");
        
        if (isQuestionComment) {
          // Remove from question comments
          setQuestionComments(questionComments.filter((comment) => comment._id !== commentId));
        } else {
          // Remove from answer comments
          const updatedAnswers = answers.map((answer) => {
            if (answer.comments && answer.comments.some((comment) => comment._id === commentId)) {
              return {
                ...answer,
                comments: answer.comments.filter((comment) => comment._id !== commentId)
              };
            }
            return answer;
          });
          setAnswers(updatedAnswers as AnswerWithUser[]);
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
    <div className="container mx-auto py-8 px-4 md:px-6 flex flex-col gap-6 max-w-[1200px] min-h-screen bg-background">
      {/* Question Section - Enhanced */}
      <div className="bg-card rounded-xl shadow-lg p-6 md:p-8 border border-border transition-all hover:shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-card-foreground flex-1">
            {question.title}
          </h1>

          {/* Edit and Delete buttons - only visible to question author */}
          {question.asker === userId && (
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={toggleQuestionEditForm}
                className="p-2 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-full transition-colors group cursor-pointer"
                title="Edit question"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={handleQuestionDelete}
                className="p-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-full transition-colors group cursor-pointer"
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
              <div className="rounded-full overflow-hidden border-2 border-primary/20 mr-3">
                <Image
                  src={question.user.imageUrl}
                  alt={question.user.firstName || "User"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                <span className="text-primary font-semibold text-sm">
                  {question.user?.firstName?.charAt(0) || "?"}
                </span>
              </div>
            )}
            <div>
              <span className="font-medium text-card-foreground">
                {question.user?.firstName} {question.user?.lastName}
              </span>
              <p className="text-xs text-muted-foreground">
                {new Date(question.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {question.subject && (
            <span className="ml-auto text-xs px-3 py-1.5 rounded-full font-semibold bg-primary/10 text-primary border border-primary/20">
              {question.subject}
            </span>
          )}
        </div>

        {/* Question Edit Form - Always rendered with smooth transitions */}
        {question.asker === userId && (
          <div
            className={`mt-6 bg-muted/50 rounded-lg border border-border transition-all duration-300 ease-in-out overflow-hidden flex justify-center items-center ${
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
              className={`p-1 rounded hover:bg-muted transition-colors ${
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
              className={`text-center font-bold my-2 flex items-center justify-center ${
                (question.questionLikes || 0) -
                  (question.questionDislikes || 0) >=
                0
                  ? "text-green-500"
                  : "text-red-500"
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
              className={`p-1 rounded hover:bg-muted transition-colors ${
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
          <div className="prose prose-lg dark:prose-invert max-w-[1030px] flex-1 text-foreground overflow-x-auto">
            <div className="w-max">{parse(question.description)}</div>
          </div>
        </div>

        {/* Tags with improved styling */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {question.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs font-medium bg-accent/20 text-accent-foreground border border-accent/30 px-3 py-1.5 rounded-full hover:bg-accent/30 hover:border-accent/50 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Question Comments Section */}
        <div className="mt-6 pl-4 md:pl-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsQuestionCommentsVisible((prev) => !prev)}
                className="text-sm text-muted-foreground flex items-center hover:text-foreground transition-colors"
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
                className="text-sm text-primary hover:text-primary/80 flex items-center bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-1 rounded-full transition-colors"
              >
                {isQuestionCommentFormExpanded ? "Cancel" : "Add Comment"}
              </button>
            </div>
          </div>

          {/* Question Comment Form - Always rendered with smooth transitions */}
          <div
            className={`mt-3 mb-6 bg-muted/50 rounded-lg border border-border transition-all duration-100 ease-in-out overflow-hidden ${
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

          {/* Display Question Comments */}
          {isQuestionCommentLoading ? (
            <div className="flex justify-center items-center py-8">
              <LoaderDemo />
            </div>
          ) : (
            <>
              {questionComments && questionComments.length > 0 && (
                <div
                  className={`mt-4 pl-2 border-l-2 border-accent/30 space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${
                    isQuestionCommentsVisible
                      ? "h-max opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {questionComments.map(
                    (comment: CommentWithUser, commentIndex: number) => (
                      <div
                        key={commentIndex}
                        className="text-sm p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors relative border border-border/50"
                      >
                        {/* Loader overlay for deleting comment */}
                        {isCommentDeleting === comment._id && (
                          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg">
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
                              className={`p-1 rounded hover:bg-muted transition-colors ${
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
                              className={`text-center font-medium text-xs my-1 flex items-center justify-center ${
                                (comment.commentLikes || 0) -
                                  (comment.commentDislikes || 0) >=
                                0
                                  ? "text-green-500"
                                  : "text-red-500"
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
                              className={`p-1 rounded hover:bg-muted transition-colors ${
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
                                    alt={
                                      comment.user.firstName || "User"
                                    }
                                    width={24}
                                    height={24}
                                    className="rounded-full mr-2 border border-border"
                                  />
                                ) : (
                                  <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center mr-2">
                                    <span className="text-muted-foreground text-xs">
                                      {comment.user?.firstName?.charAt(
                                        0
                                      ) || "?"}
                                    </span>
                                  </div>
                                )}
                                <span className="font-medium text-xs mr-2 text-foreground">
                                  {comment.user?.firstName}{" "}
                                  {comment.user?.lastName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(
                                    comment.createdAt
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>

                              {/* Delete button - only visible to comment author */}
                              {comment.commenter === userId && (
                                <button
                                  onClick={() => handleCommentDelete(comment._id, true)}
                                  disabled={isCommentDeleting === comment._id}
                                  className="p-1 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-full transition-colors"
                                  title="Delete comment"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                            <div className="text-foreground text-sm break-words whitespace-pre-wrap max-w-[125ch] overflow-x-auto">
                              {parse(comment.content)}
                            </div>
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
          {/* Add Answer Button */}
          <div className="bg-card rounded-xl shadow-md p-6 md:p-8 border border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-card-foreground">
                Your Answer
              </h2>
              <button
                onClick={toggleAnswerForm}
                className="text-sm text-primary hover:text-primary/80 flex items-center bg-primary/10 hover:bg-primary/20 border border-primary/20 px-4 py-2 rounded-full transition-colors cursor-pointer"
              >
                {isAnswerFormExpanded ? "Cancel" : "Give Answer"}
              </button>
            </div>

            {/* Answer form - Always rendered with smooth transitions */}
            <div
              className={`mt-6 transition-all duration-100 ease-in-out overflow-hidden ${
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
          </div>

          {/* Answers Section - Enhanced */}
          <div className="bg-card rounded-xl shadow-md p-6 md:p-8 border border-border">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-card-foreground flex items-center">
              Answers
              <span className="ml-2 text-sm bg-secondary/80 text-secondary-foreground border border-secondary px-2.5 py-0.5 rounded-full">
                {answers.length}
              </span>
            </h2>

            {answers.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-lg">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium">
                  No answers yet. Be the first to answer!
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {answers.map((answer: AnswerWithUser, index: number) => (
                  <div
                    key={index}
                    className={`${
                      index > 0
                        ? "border-t border-border pt-8"
                        : ""
                    } transition-all relative`}
                  >
                    {/* Loader overlay for the entire answer */}
                    {isAnswerDeleting === answer._id && (
                      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg">
                        <div className="flex flex-col items-center gap-3">
                          <LoaderDemo />
                          <span className="text-sm text-muted-foreground font-medium">
                            Deleting answer...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Answer header with better styling */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {answer.user?.imageUrl ? (
                          <div className="rounded-full overflow-hidden border-2 border-primary/20 mr-3">
                            <Image
                              src={answer.user.imageUrl}
                              alt={answer.user.firstName || "User"}
                              width={36}
                              height={36}
                              className="rounded-full"
                            />
                          </div>
                        ) : (
                          <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                            <span className="text-primary font-semibold text-sm">
                              {answer.user?.firstName?.charAt(0) || "?"}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-card-foreground">
                            {answer.user?.firstName} {answer.user?.lastName}
                          </span>
                          <p className="text-xs text-muted-foreground">
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

                      {/* Delete button - only visible to answer author */}
                      {answer.answerer === userId && (
                        <button
                          onClick={() => handleAnswerDelete(answer._id)}
                          disabled={isAnswerDeleting === answer._id}
                          className="p-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-full transition-colors group cursor-pointer"
                          title="Delete answer"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>

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
                          className={`p-1 rounded hover:bg-muted transition-colors ${
                            answer.isLikedByLoggedInUser
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          <ArrowUp
                            className={`w-6 h-6 ${
                              answer.isLikedByLoggedInUser ? "fill-current" : ""
                            }`}
                          />
                        </button>

                        <span
                          className={`text-center font-bold my-2 flex items-center justify-center ${
                            (answer.answerLikes || 0) -
                              (answer.answerDislikes || 0) >=
                            0
                              ? "text-green-500"
                              : "text-red-500"
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
                          className={`p-1 rounded hover:bg-muted transition-colors ${
                            answer.isDislikedByLoggedInUser
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
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
                      <div className="prose prose-md dark:prose-invert max-w-none flex-1 text-foreground overflow-x-auto">
                        <div className="w-max">{parse(answer.content)}</div>
                      </div>
                    </div>

                    {/* Comment section - Enhanced */}
                    <div className="mt-6 pl-4 md:pl-12">
                      {/* Comment toggle and add button */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleCommentsVisibility(answer._id)}
                            className="text-sm text-muted-foreground flex items-center hover:text-foreground transition-colors"
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
                            className="text-sm text-primary hover:text-primary/80 flex items-center bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-1 rounded-full transition-colors"
                          >
                            {expandedCommentAnswer === answer._id
                              ? "Cancel"
                              : "Add Comment"}
                          </button>
                        </div>
                      </div>

                      {/* Comment form - Always rendered with smooth transitions */}
                      <div
                        className={`mt-3 mb-6 bg-muted/30 rounded-lg border border-border transition-all duration-100 ease-in-out overflow-hidden ${
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

                      {/* Display comments with enhanced styling */}
                      {isCommentLoading === answer._id ? (
                        <div className="flex justify-center items-center py-8">
                          <LoaderDemo />
                        </div>
                      ) : (
                        <>
                          {answer.comments && answer.comments.length > 0 && (
                            <div
                              className={`mt-4 pl-2 border-l-2 border-accent/30 space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${
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
                                    className="text-sm p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors relative border border-border/50"
                                  >
                                    {/* Loader overlay for deleting comment */}
                                    {isCommentDeleting === comment._id && (
                                      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg">
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
                                          className={`p-1 rounded hover:bg-muted transition-colors ${
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
                                          className={`text-center font-medium text-xs my-1 flex items-center justify-center ${
                                            (comment.commentLikes || 0) -
                                              (comment.commentDislikes || 0) >=
                                            0
                                              ? "text-green-500"
                                              : "text-red-500"
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
                                          className={`p-1 rounded hover:bg-muted transition-colors ${
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
                                                alt={
                                                  comment.user.firstName || "User"
                                                }
                                                width={24}
                                                height={24}
                                                className="rounded-full mr-2 border border-border"
                                              />
                                            ) : (
                                              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center mr-2">
                                                <span className="text-muted-foreground text-xs">
                                                  {comment.user?.firstName?.charAt(
                                                    0
                                                  ) || "?"}
                                                </span>
                                              </div>
                                            )}
                                            <span className="font-medium text-xs mr-2 text-foreground">
                                              {comment.user?.firstName}{" "}
                                              {comment.user?.lastName}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              {new Date(
                                                comment.createdAt
                                              ).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                              })}
                                            </span>
                                          </div>

                                          {/* Delete button - only visible to comment author */}
                                          {comment.commenter === userId && (
                                            <button
                                              onClick={() => handleCommentDelete(comment._id, false)}
                                              disabled={isCommentDeleting === comment._id}
                                              className="p-1 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-full transition-colors"
                                              title="Delete comment"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </button>
                                          )}
                                        </div>
                                        <div className="text-foreground text-sm break-words whitespace-pre-wrap max-w-[125ch] overflow-x-auto">
                                          {parse(comment.content)}
                                        </div>
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
