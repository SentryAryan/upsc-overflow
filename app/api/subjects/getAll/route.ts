import dbConnect from "@/db/dbConnect";
import Answer from "@/db/models/answer.model";
import Comment from "@/db/models/comment.model";
import Question from "@/db/models/question.model";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { NextRequest, NextResponse as res } from "next/server";

export const GET = errorHandler(async (req: NextRequest) => {
  await dbConnect();
  const subjects: string[] = await Question.distinct("subject");
  const page = Number(req.nextUrl.searchParams.get("page")) || 1;
  const limit = Number(req.nextUrl.searchParams.get("limit")) || 10;
  const sortBy = req.nextUrl.searchParams.get("sortBy") || "questions-desc";

  const questionsRelatedToSubjects = await Promise.all(
    subjects.map(async (subject) => {
      const questions = await Question.find({ subject });
      return { subject, questions };
    })
  );

  const totalPages = Math.ceil(questionsRelatedToSubjects.length / limit);

  const subjectsWithQuestionsAndCommentsAndAnswers = await Promise.all(
    questionsRelatedToSubjects.map(async (subjectData) => {
      const comments = await Promise.all(
        subjectData.questions.map(async (question) => {
          const comments = await Comment.find({ question: question._id });
          return comments;
        })
      );
      const answers = await Promise.all(
        subjectData.questions.map(async (question) => {
          const answers = await Answer.find({ question: question._id });
          return answers;
        })
      );
      return {
        subject: subjectData.subject,
        questions: subjectData.questions,
        commentsOnQuestions: comments,
        answersOnQuestions: answers,
      };
    })
  );

  const subjectsWithMetrics = await Promise.all(
    subjectsWithQuestionsAndCommentsAndAnswers.map(async (subjectData) => {
      const questions = subjectData.questions;
      const uniqueTags = [
        ...new Set(questions.flatMap((question) => question.tags || [])),
      ];
      const commentsOnQuestions = subjectData.commentsOnQuestions;
      const answersOnQuestions = subjectData.answersOnQuestions;
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
        subject: subjectData.subject,
        numberOfQuestions: questions.length,
        uniqueTags,
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

  const subjectsWithMetricsSorted = subjectsWithMetrics.sort((a, b) => {
    switch (sortBy) {
      case "questions-desc":
        return b.numberOfQuestions !== a.numberOfQuestions
          ? b.numberOfQuestions - a.numberOfQuestions
          : b.numberOfAnswers !== a.numberOfAnswers
          ? b.numberOfAnswers - a.numberOfAnswers
          : b.numberOfComments !== a.numberOfComments
          ? b.numberOfComments - a.numberOfComments
          : b.uniqueTags.length !== a.uniqueTags.length
          ? b.uniqueTags.length - a.uniqueTags.length
          : 0;
      case "answers-desc":
        return b.numberOfAnswers !== a.numberOfAnswers
          ? b.numberOfAnswers - a.numberOfAnswers
          : b.numberOfQuestions !== a.numberOfQuestions
          ? b.numberOfQuestions - a.numberOfQuestions
          : b.numberOfComments !== a.numberOfComments
          ? b.numberOfComments - a.numberOfComments
          : b.uniqueTags.length !== a.uniqueTags.length
          ? b.uniqueTags.length - a.uniqueTags.length
          : 0;
      case "comments-desc":
        return b.numberOfComments !== a.numberOfComments
          ? b.numberOfComments - a.numberOfComments
          : b.numberOfQuestions !== a.numberOfQuestions
          ? b.numberOfQuestions - a.numberOfQuestions
          : b.numberOfAnswers !== a.numberOfAnswers
          ? b.numberOfAnswers - a.numberOfAnswers
          : b.uniqueTags.length !== a.uniqueTags.length
          ? b.uniqueTags.length - a.uniqueTags.length
          : 0;
      case "tags-desc":
        return b.uniqueTags.length !== a.uniqueTags.length
          ? b.uniqueTags.length - a.uniqueTags.length
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
          : b.uniqueTags.length !== a.uniqueTags.length
          ? b.uniqueTags.length - a.uniqueTags.length
          : 0;
    }
  });
  const slicedSubjectsWithMetrics = subjectsWithMetricsSorted.slice(
    (page - 1) * limit,
    page * limit
  );

  return res.json(
    generateApiResponse(
      200,
      "Subjects fetched successfully",
      slicedSubjectsWithMetrics
    )
  );
});
