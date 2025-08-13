import dbConnect from "@/db/dbConnect";
import Answer from "@/db/models/answer.model";
import Comment from "@/db/models/comment.model";
import Question from "@/db/models/question.model";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { NextRequest, NextResponse as res } from "next/server";

export const GET = errorHandler(async (req: NextRequest) => {
  await dbConnect();
  const tags: string[] = await Question.distinct("tags");
  const page = Number(req.nextUrl.searchParams.get("page")) || 1;
  const limit = Number(req.nextUrl.searchParams.get("limit")) || 10;

  const questionsRelatedToTags = await Promise.all(
    tags.map(async (tag) => {
      const questions = await Question.find({ tags: tag });
      return { tag, questions };
    })
  );

  const totalPages = Math.ceil(questionsRelatedToTags.length / limit);

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
        firstQuestion: questions[0].title,
        totalPages,
      };
    })
  );

  const tagsWithMetricsSorted = tagsWithMetrics.sort((a, b) =>
    b.numberOfQuestions !== a.numberOfQuestions
      ? b.numberOfQuestions - a.numberOfQuestions
      : b.numberOfAnswers !== a.numberOfAnswers
      ? b.numberOfAnswers - a.numberOfAnswers
      : b.numberOfComments !== a.numberOfComments
      ? b.numberOfComments - a.numberOfComments
      : 0
  );
  const slicedTagsWithMetrics = tagsWithMetricsSorted.slice(
    (page - 1) * limit,
    page * limit
  );

  return res.json(
    generateApiResponse(200, "Tags fetched successfully", slicedTagsWithMetrics)
  );
});
