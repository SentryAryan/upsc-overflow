import dbConnect from "@/db/dbConnect";
import Answer from "@/db/models/answer.model";
import Comment from "@/db/models/comment.model";
import Question from "@/db/models/question.model";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { NextRequest, NextResponse as res } from "next/server";
import { generateApiError } from "../../../../lib/helpers/api-error.helper";

export const GET = errorHandler(async (req: NextRequest) => {
  await dbConnect();

  let page = Number(req.nextUrl.searchParams.get("page"));
  const limit = Number(req.nextUrl.searchParams.get("limit")) || 10;
  const sortBy = req.nextUrl.searchParams.get("sortBy") || "questions-desc";
  const sortByOptions = [
    "questions-desc",
    "answers-desc",
    "comments-desc",
    "subjects-desc",
  ];

  console.log("page received =", req.nextUrl.searchParams.get("page"));
  console.log("sortBy received =", req.nextUrl.searchParams.get("sortBy"));

  if (isNaN(page) || page < 1) {
    throw generateApiError(400, "Invalid Page Number", ["Invalid Page Number"]);
  }

  const tags: string[] = await Question.distinct("tags");
  if (tags.length === 0) {
    throw generateApiError(404, "No tags found", ["No tags found"]);
  }

  const totalPages = Math.ceil(tags.length / limit);
  if (page > totalPages) {
    throw generateApiError(400, "Invalid Page Number", ["Invalid Page Number"]);
  }

  if (!sortByOptions.includes(sortBy)) {
    throw generateApiError(400, "Invalid Sort By", ["Invalid Sort By"]);
  }

  const questionsRelatedToTags = await Promise.all(
    tags.map(async (tag) => {
      const questions = await Question.find({ tags: tag });
      return { tag, questions };
    })
  );

  const tagsWithQuestionsAndCommentsAndAnswers = await Promise.all(
    questionsRelatedToTags.map(async (tagData) => {
      const comments = await Promise.all(
        tagData.questions.map(async (question) => {
          const comments = await Comment.find({ question: question._id });
          return comments;
        })
      );
      const answers = await Promise.all(
        tagData.questions.map(async (question) => {
          const answers = await Answer.find({ question: question._id });
          return answers;
        })
      );
      return {
        tag: tagData.tag,
        questions: tagData.questions,
        commentsOnQuestions: comments,
        answersOnQuestions: answers,
      };
    })
  );

  const tagsWithMetrics = await Promise.all(
    tagsWithQuestionsAndCommentsAndAnswers.map(async (tagData) => {
      const questions = tagData.questions;
      const uniqueSubjects = [
        ...new Set(questions.map((question) => question.subject)),
      ];
      const commentsOnQuestions = tagData.commentsOnQuestions;
      const answersOnQuestions = tagData.answersOnQuestions;
      const commentsOnAnswers = await Promise.all(
        answersOnQuestions.map(async (answers) => {
          const comments = await Promise.all(
            answers.map(async (answer) => {
              const comments = await Comment.find({ answer: answer._id });
              return comments;
            })
          );
          return comments;
        })
      );
      return {
        tag: tagData.tag,
        numberOfQuestions: questions.length,
        uniqueSubjects,
        numberOfComments:
          commentsOnQuestions.reduce((acc, curr) => acc + curr.length, 0) +
          commentsOnAnswers.reduce(
            (acc, curr) =>
              acc + curr.reduce((acc, curr) => acc + curr.length, 0),
            0
          ),
        numberOfAnswers: answersOnQuestions.reduce(
          (acc, curr) => acc + curr.length,
          0
        ),
        firstQuestion: questions[0]?.title,
        totalPages,
      };
    })
  );

  const tagsWithMetricsSorted = tagsWithMetrics.sort((a, b) => {
    switch (sortBy) {
      case "questions-desc":
        return b.numberOfQuestions !== a.numberOfQuestions
          ? b.numberOfQuestions - a.numberOfQuestions
          : b.numberOfAnswers !== a.numberOfAnswers
            ? b.numberOfAnswers - a.numberOfAnswers
            : b.numberOfComments !== a.numberOfComments
              ? b.numberOfComments - a.numberOfComments
              : b.uniqueSubjects.length !== a.uniqueSubjects.length
                ? b.uniqueSubjects.length - a.uniqueSubjects.length
                : 0;
      case "answers-desc":
        return b.numberOfAnswers !== a.numberOfAnswers
          ? b.numberOfAnswers - a.numberOfAnswers
          : b.numberOfQuestions !== a.numberOfQuestions
            ? b.numberOfQuestions - a.numberOfQuestions
            : b.numberOfComments !== a.numberOfComments
              ? b.numberOfComments - a.numberOfComments
              : b.uniqueSubjects.length !== a.uniqueSubjects.length
                ? b.uniqueSubjects.length - a.uniqueSubjects.length
                : 0;
      case "comments-desc":
        return b.numberOfComments !== a.numberOfComments
          ? b.numberOfComments - a.numberOfComments
          : b.numberOfQuestions !== a.numberOfQuestions
            ? b.numberOfQuestions - a.numberOfQuestions
            : b.numberOfAnswers !== a.numberOfAnswers
              ? b.numberOfAnswers - a.numberOfAnswers
              : b.uniqueSubjects.length !== a.uniqueSubjects.length
                ? b.uniqueSubjects.length - a.uniqueSubjects.length
                : 0;
      case "subjects-desc":
        return b.uniqueSubjects.length !== a.uniqueSubjects.length
          ? b.uniqueSubjects.length - a.uniqueSubjects.length
          : b.numberOfQuestions !== a.numberOfQuestions
            ? b.numberOfQuestions - a.numberOfQuestions
            : b.numberOfAnswers !== a.numberOfAnswers
              ? b.numberOfAnswers - a.numberOfAnswers
              : b.numberOfComments !== a.numberOfComments
                ? b.numberOfComments - a.numberOfComments
                : 0;
      default:
        return b.numberOfQuestions !== a.numberOfQuestions
          ? b.numberOfQuestions - a.numberOfQuestions
          : b.numberOfAnswers !== a.numberOfAnswers
            ? b.numberOfAnswers - a.numberOfAnswers
            : b.numberOfComments !== a.numberOfComments
              ? b.numberOfComments - a.numberOfComments
              : b.uniqueSubjects.length !== a.uniqueSubjects.length
                ? b.uniqueSubjects.length - a.uniqueSubjects.length
                : 0;
    }
  });
  const slicedTagsWithMetrics = tagsWithMetricsSorted.slice(
    (page - 1) * limit,
    page * limit
  );

  return res.json(
    generateApiResponse(200, "Tags fetched successfully", slicedTagsWithMetrics)
  );
});
