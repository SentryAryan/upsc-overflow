import dbConnect from "@/db/dbConnect";
import Answer, { AnswerTypeSchema } from "@/db/models/answer.model";
import Comment from "@/db/models/comment.model";
import Like from "@/db/models/like.model";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { NextRequest, NextResponse as res } from "next/server";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import { auth, User } from "@clerk/nextjs/server";
import Save from "@/db/models/save.model";
import getClerkUserById from "@/lib/helpers/getClerkUserById";

export const GET = errorHandler(async (req: NextRequest) => {
  await dbConnect();
  let page = Number(req.nextUrl.searchParams.get("page"));
  const limit = Number(req.nextUrl.searchParams.get("limit")) || 10;
  const sortBy = req.nextUrl.searchParams.get("sortBy") || "saved-date-desc";
  const sortByOptions = [
    "saved-date-desc",
    "saved-date-asc",
    "date-desc",
    "date-asc",
    "votes-desc",
    "answers-desc",
    "comments-desc",
    "tags-desc",
  ];

  console.log("page received =", req.nextUrl.searchParams.get("page"));
  console.log(
    "isNaN(req.nextUrl.searchParams.get('page')) =",
    isNaN(Number(req.nextUrl.searchParams.get("page")))
  );
  console.log("sortBy received =", req.nextUrl.searchParams.get("sortBy"));

  if (isNaN(page) || page < 1) {
    throw generateApiError(400, "Invalid Page Number", ["Invalid Page Number"]);
  }

  const subject = req.nextUrl.searchParams.get("subject") || null;
  const { userId } = await auth();

  if (!userId) {
    throw generateApiError(
      400,
      "User ID is required, kindly login to continue",
      ["User ID is required, kindly login to continue"]
    );
  }

  const savedQuestions = await Save.find({
    saver: userId,
  }).populate("question");

  const uniqueSubjectsRelatedToSavedQuestions = [
    ...new Set(
      savedQuestions.map((savedQuestion) => savedQuestion.question.subject)
    ),
  ];

  // If invalid subject, throw error
  if (subject && !uniqueSubjectsRelatedToSavedQuestions.includes(subject)) {
    throw generateApiError(404, "Invalid Subject", ["Invalid Subject"]);
  }

  // If no saved questions found, throw error
  if (savedQuestions.length === 0) {
    throw generateApiError(404, "No saved questions found", [
      "No saved questions found",
    ]);
  }

  let filteredSavedQuestions = savedQuestions;
  if (subject) {
    filteredSavedQuestions = savedQuestions.filter(
      (savedQuestion) => savedQuestion.question.subject === subject
    );
    console.log("filteredSavedQuestions", filteredSavedQuestions);
  }
  const totalPages = Math.ceil(filteredSavedQuestions.length / limit);
  if (page > totalPages) {
    throw generateApiError(400, "Invalid Page Number", ["Invalid Page Number"]);
  }
  if (!sortByOptions.includes(sortBy)) {
    throw generateApiError(400, "Invalid Sort By", ["Invalid Sort By"]);
  }

  const savedQuestionsWithMetrics = await Promise.all(
    filteredSavedQuestions.map(async (savedQuestion) => {
      try {
        const user: User = await getClerkUserById(savedQuestion.question.asker);
        const upvotes = await Like.countDocuments({
          question: savedQuestion.question._id,
          isLiked: true,
        });
        const downvotes = await Like.countDocuments({
          question: savedQuestion.question._id,
          isLiked: false,
        });
        const answers = await Answer.find({
          question: savedQuestion.question._id,
        });
        const commentsOnQuestion = await Comment.countDocuments({
          question: savedQuestion.question._id,
        });
        const commentsOnAnswers = await Promise.all(
          answers.map(async (answer) => {
            const comments = await Comment.countDocuments({
              answer: answer._id,
            });
            return comments;
          })
        );
        const comments =
          commentsOnQuestion +
          commentsOnAnswers.reduce((acc, curr) => acc + curr, 0);
        return {
          ...savedQuestion.question._doc,
          savedCreatedAt: savedQuestion.createdAt,
          user: user || {
            firstName: "Anonymous",
            lastName: "",
            imageUrl: null,
          },
          likesAnswersComments: {
            likes: upvotes,
            dislikes: downvotes,
            answers: answers.length,
            comments,
          },
          totalPages,
        };
      } catch (error) {
        return {
          ...savedQuestion.question._doc,
          savedCreatedAt: savedQuestion.createdAt,
          user: {
            firstName: "Anonymous",
            lastName: "",
            imageUrl: null,
          },
          likesAnswersComments: {
            likes: 0,
            dislikes: 0,
            answers: 0,
            comments: 0,
          },
          totalPages,
        };
      }
    })
  );

  const sortedSavedQuestionsWithMetrics = savedQuestionsWithMetrics.sort(
    (a, b) => {
      switch (sortBy) {
        case "saved-date-desc":
          return b.savedCreatedAt - a.savedCreatedAt;
        case "saved-date-asc":
          return a.savedCreatedAt - b.savedCreatedAt;
        case "date-desc":
          return b.createdAt - a.createdAt;
        case "date-asc":
          return a.createdAt - b.createdAt;
        case "votes-desc":
          return b.likesAnswersComments.likes -
            b.likesAnswersComments.dislikes !==
            a.likesAnswersComments.likes - a.likesAnswersComments.dislikes
            ? b.likesAnswersComments.likes -
                b.likesAnswersComments.dislikes -
                (a.likesAnswersComments.likes - a.likesAnswersComments.dislikes)
            : b.savedCreatedAt - a.savedCreatedAt;
        case "answers-desc":
          return b.likesAnswersComments.answers !==
            a.likesAnswersComments.answers
            ? b.likesAnswersComments.answers - a.likesAnswersComments.answers
            : b.savedCreatedAt - a.savedCreatedAt;
        case "comments-desc":
          return b.likesAnswersComments.comments !==
            a.likesAnswersComments.comments
            ? b.likesAnswersComments.comments - a.likesAnswersComments.comments
            : b.savedCreatedAt - a.savedCreatedAt;
        case "tags-desc":
          return b.tags.length !== a.tags.length
            ? b.tags.length - a.tags.length
            : b.savedCreatedAt - a.savedCreatedAt;
        default:
          return b.savedCreatedAt - a.savedCreatedAt;
      }
    }
  );

  const slicedSavedQuestionsWithMetrics = sortedSavedQuestionsWithMetrics.slice(
    (page - 1) * limit,
    page * limit
  );

  return res.json(
    generateApiResponse(
      200,
      "Questions fetched successfully",
      slicedSavedQuestionsWithMetrics
    )
  );
});
