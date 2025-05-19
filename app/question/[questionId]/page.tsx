"use client";

import { AnswerFormTA } from "@/components/Forms/AnswerFormTA";
import { CommentFormTA } from "@/components/Forms/CommentFormTA";
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
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CommentForm } from "../../../components/Forms/CommentForm";

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
  console.log("This is the questionId", questionId);
  const [question, setQuestion] = useState<QuestionType | null>(null);
  const [answers, setAnswers] = useState<AnswerWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    <div className="container mx-auto py-8 px-4 md:px-6 flex flex-col gap-6 max-w-[1200px] min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Question Section - Enhanced */}
      <div className="bg-white dark:bg-card rounded-xl shadow-lg p-6 md:p-8 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          {question.title}
        </h1>

        {/* Author info with enhanced styling */}
        <div className="flex flex-wrap items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center mr-4 mb-2">
            {question.user?.imageUrl ? (
              <div className="rounded-full overflow-hidden border-2 border-blue-100 dark:border-blue-800 mr-3">
                <Image
                  src={question.user.imageUrl}
                  alt={question.user.firstName || "User"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-500 dark:text-blue-300 font-semibold text-sm">
                  {question.user?.firstName?.charAt(0) || "?"}
                </span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {question.user?.firstName} {question.user?.lastName}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(question.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {question.subject && (
            <span className="ml-auto text-xs px-3 py-1.5 rounded-full font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
              {question.subject}
            </span>
          )}
        </div>

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
              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                question.isLikedByLoggedInUser
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400"
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
              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                question.isDislikedByLoggedInUser
                  ? "text-red-500 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400"
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
          <div className="prose prose-lg dark:prose-invert max-w-none flex-1 text-gray-700 dark:text-gray-300">
            <div>{parse(question.description)}</div>
          </div>
        </div>

        {/* Tags with improved styling */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {question.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-3 py-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
                className="text-sm text-gray-500 dark:text-gray-400 flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
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
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full transition-colors"
              >
                {isQuestionCommentFormExpanded ? "Cancel" : "Add Comment"}
              </button>
            </div>
          </div>

          {/* Question Comment Form */}
          {isQuestionCommentFormExpanded && (
            <div className="mt-3 mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700 transition-all">
              <CommentFormTA
                questionId={questionId as string}
                userId={userId || ""}
                setIsCommentLoading={() => setIsQuestionCommentLoading(true)}
                questionComments={questionComments}
                setQuestionComments={setQuestionComments}
                isQuestionCommentLoading={isQuestionCommentLoading}
                setIsQuestionCommentLoading={setIsQuestionCommentLoading}
              />
              {/* <CommentForm
                questionId={questionId as string}
                userId={userId || ""}
                setIsCommentLoading={() => setIsQuestionCommentLoading(true)}
                questionComments={questionComments}
                setQuestionComments={setQuestionComments}
                isQuestionCommentLoading={isQuestionCommentLoading}
                setIsQuestionCommentLoading={setIsQuestionCommentLoading}
              /> */}
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
                  className={`mt-4 pl-2 border-l-2 border-gray-200 dark:border-gray-700 space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${
                    isQuestionCommentsVisible
                      ? "max-h-[2000px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {questionComments.map(
                    (comment: CommentWithUser, commentIndex: number) => (
                      <div
                        key={commentIndex}
                        className="text-sm p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
                      >
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
                              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                comment.isLikedByLoggedInUser
                                  ? "text-blue-500 dark:text-blue-400"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
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
                                  ? "text-green-500 dark:text-green-500"
                                  : "text-red-500 dark:text-red-500"
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
                              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                comment.isDislikedByLoggedInUser
                                  ? "text-red-500 dark:text-red-400"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
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
                            <div className="flex items-center mb-2">
                              {comment.user?.imageUrl ? (
                                <Image
                                  src={comment.user.imageUrl}
                                  alt={comment.user.firstName || "User"}
                                  width={24}
                                  height={24}
                                  className="rounded-full mr-2 border border-gray-200 dark:border-gray-700"
                                />
                              ) : (
                                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-2">
                                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                                    {comment.user?.firstName?.charAt(0) || "?"}
                                  </span>
                                </div>
                              )}
                              <span className="font-medium text-xs mr-2 text-gray-700 dark:text-gray-300">
                                {comment.user?.firstName}{" "}
                                {comment.user?.lastName}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(comment.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </span>
                            </div>
                            <div className="text-gray-700 dark:text-gray-300 text-sm break-words whitespace-pre-wrap max-w-[125ch] overflow-hidden">
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
          <div className="bg-white dark:bg-card rounded-xl shadow-md p-6 md:p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                Your Answer
              </h2>
              <button
                onClick={toggleAnswerForm}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full transition-colors cursor-pointer"
              >
                {isAnswerFormExpanded ? "Cancel" : "Give Answer"}
              </button>
            </div>

            {/* Answer form - conditionally rendered */}
            {isAnswerFormExpanded && (
              <div className="mt-6 transition-all">
                {/* <AnswerForm
                  questionId={questionId as string}
                  userId={userId || ""}
                  setIsLoadingAnswers={setIsLoadingAnswers}
                  setAnswers={setAnswers}
                  answers={answers}
                /> */}
                <AnswerFormTA
                  questionId={questionId as string}
                  userId={userId || ""}
                  setIsLoadingAnswers={setIsLoadingAnswers}
                  setAnswers={setAnswers}
                  answers={answers}
                />
              </div>
            )}
          </div>

          {/* Answers Section - Enhanced */}
          <div className="bg-white dark:bg-card rounded-xl shadow-md p-6 md:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center">
              Answers
              <span className="ml-2 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2.5 py-0.5 rounded-full">
                {answers.length}
              </span>
            </h2>

            {answers.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">
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
                        ? "border-t border-gray-100 dark:border-gray-800 pt-8"
                        : ""
                    } transition-all`}
                  >
                    {/* Answer header with better styling */}
                    <div className="flex items-center mb-4">
                      {answer.user?.imageUrl ? (
                        <div className="rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-700 mr-3">
                          <Image
                            src={answer.user.imageUrl}
                            alt={answer.user.firstName || "User"}
                            width={36}
                            height={36}
                            className="rounded-full"
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mr-3">
                          <span className="text-gray-500 dark:text-gray-400 font-semibold text-sm">
                            {answer.user?.firstName?.charAt(0) || "?"}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {answer.user?.firstName} {answer.user?.lastName}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
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
                          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            answer.isLikedByLoggedInUser
                              ? "text-blue-500 dark:text-blue-400"
                              : "text-gray-500 dark:text-gray-400"
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
                              ? "text-green-500 dark:text-green-500"
                              : "text-red-500 dark:text-red-500"
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
                          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            answer.isDislikedByLoggedInUser
                              ? "text-red-500 dark:text-red-400"
                              : "text-gray-500 dark:text-gray-400"
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
                      <div className="prose prose-md dark:prose-invert max-w-none flex-1 text-gray-700 dark:text-gray-300">
                        <div>{parse(answer.content)}</div>
                      </div>
                    </div>

                    {/* Comment section - Enhanced */}
                    <div className="mt-6 pl-4 md:pl-12">
                      {/* Comment toggle and add button */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleCommentsVisibility(answer._id)}
                            className="text-sm text-gray-500 dark:text-gray-400 flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
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
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full transition-colors"
                          >
                            {expandedCommentAnswer === answer._id
                              ? "Cancel"
                              : "Add Comment"}
                          </button>
                        </div>
                      </div>

                      {/* Comment form - Enhanced styling */}
                      {answer._id && expandedCommentAnswer === answer._id && (
                        <div className="mt-3 mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700 transition-all">
                          <CommentFormTA
                            questionId={questionId as string}
                            userId={userId || ""}
                            setIsCommentLoading={setIsCommentLoading}
                            setAnswers={setAnswers}
                            answers={answers}
                            answerId={answer._id}
                            isQuestionCommentLoading={isQuestionCommentLoading}
                            setIsQuestionCommentLoading={
                              setIsQuestionCommentLoading
                            }
                          />
                          {/* <CommentForm
                questionId={questionId as string}
                userId={userId || ""}
                setIsCommentLoading={() => setIsQuestionCommentLoading(true)}
                questionComments={questionComments}
                setQuestionComments={setQuestionComments}
                isQuestionCommentLoading={isQuestionCommentLoading}
                setIsQuestionCommentLoading={setIsQuestionCommentLoading}
              /> */}
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
                              className={`mt-4 pl-2 border-l-2 border-gray-200 dark:border-gray-700 space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${
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
                                    className="text-sm p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
                                  >
                                    <div className="flex items-start">
                                      {/* Vote buttons for comment */}
                                      <div className="flex flex-col items-center mr-3">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation(); // Prevent event bubbling
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
                                          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                            comment.isLikedByLoggedInUser
                                              ? "text-blue-500 dark:text-blue-400"
                                              : "text-gray-500 dark:text-gray-400"
                                          }`}
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
                                              ? "text-green-500 dark:text-green-500"
                                              : "text-red-500 dark:text-red-500"
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
                                            e.stopPropagation(); // Prevent event bubbling
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
                                          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                            comment.isDislikedByLoggedInUser
                                              ? "text-red-500 dark:text-red-400"
                                              : "text-gray-500 dark:text-gray-400"
                                          }`}
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
                                        <div className="flex items-center mb-2">
                                          {comment.user?.imageUrl ? (
                                            <Image
                                              src={comment.user.imageUrl}
                                              alt={
                                                comment.user.firstName || "User"
                                              }
                                              width={24}
                                              height={24}
                                              className="rounded-full mr-2 border border-gray-200 dark:border-gray-700"
                                            />
                                          ) : (
                                            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-2">
                                              <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                {comment.user?.firstName?.charAt(
                                                  0
                                                ) || "?"}
                                              </span>
                                            </div>
                                          )}
                                          <span className="font-medium text-xs mr-2 text-gray-700 dark:text-gray-300">
                                            {comment.user?.firstName}{" "}
                                            {comment.user?.lastName}
                                          </span>
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(
                                              comment.createdAt
                                            ).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                            })}
                                          </span>
                                        </div>
                                        <div className="text-gray-700 dark:text-gray-300 text-sm break-words whitespace-pre-wrap max-w-[125ch] overflow-hidden">
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
