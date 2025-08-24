import dbConnect from "@/db/dbConnect";
import Answer from "@/db/models/answer.model";
import Comment from "@/db/models/comment.model";
import Question from "@/db/models/question.model";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { NextRequest, NextResponse as res } from "next/server";
import getAllClerkUsers from "@/lib/helpers/getAllClerkUsers";
import { User } from "@clerk/nextjs/server";

export const GET = errorHandler(async (req: NextRequest) => {
  await dbConnect();
  const subjects: string[] = await Question.distinct("subject");
  const page = Number(req.nextUrl.searchParams.get("page")) || 1;
  const limit = Number(req.nextUrl.searchParams.get("limit")) || 10;
  const sortBy = req.nextUrl.searchParams.get("sortBy") || "questions-desc";

  // Get all users from clerk
  const clerkUsers = await getAllClerkUsers();
  console.log("This is the clerkUsers", clerkUsers);

  const users = clerkUsers.data.map((u: User) => u);
  const totalPages = Math.ceil(users.length / limit);

  const usersWithQuestions = await Promise.all(
    users.map(async (user) => {
      const questions = await Question.find({ asker: user.id });
      return { user, questions };
    })
  );

  const usersWithQuestionsAndCommentsAndAnswers = await Promise.all(
    usersWithQuestions.map(async (userData) => {
      const comments = await Comment.countDocuments({ commenter: userData.user.id });
      const answers = await Answer.countDocuments({ answerer: userData.user.id });
      return { user: userData.user, comments, answers, questions: userData.questions };
    })
  );

  const usersWithMetrics = await Promise.all(
    usersWithQuestionsAndCommentsAndAnswers.map(async (userData) => {
      const questions = userData.questions;
      const uniqueTags = [
        ...new Set(questions.flatMap((question) => question.tags || [])),
      ];
      const uniqueSubjects = [
        ...new Set(questions.map((question) => question.subject)),
      ];
      
      return {
        user: userData.user,
        numberOfQuestions: questions.length,
        uniqueTags,
        uniqueSubjects,
        numberOfComments: userData.comments,
        numberOfAnswers: userData.answers,
        firstQuestion: questions[0]?.title || "",
        totalPages,
      };
    })
  );

  // Sorting the users with metrics
  const usersWithMetricsSorted = usersWithMetrics.sort((a, b) => {
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
          : b.uniqueSubjects.length !== a.uniqueSubjects.length
          ? b.uniqueSubjects.length - a.uniqueSubjects.length
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
          : b.uniqueSubjects.length !== a.uniqueSubjects.length
          ? b.uniqueSubjects.length - a.uniqueSubjects.length
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
      case "subjects-desc":
        return b.uniqueSubjects.length !== a.uniqueSubjects.length
          ? b.uniqueSubjects.length - a.uniqueSubjects.length
          : b.numberOfQuestions !== a.numberOfQuestions
          ? b.numberOfQuestions - a.numberOfQuestions
          : b.numberOfAnswers !== a.numberOfAnswers
          ? b.numberOfAnswers - a.numberOfAnswers
          : b.numberOfComments !== a.numberOfComments
          ? b.numberOfComments - a.numberOfComments
          : b.uniqueTags.length !== a.uniqueTags.length
          ? b.uniqueTags.length - a.uniqueTags.length
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
          : b.uniqueTags.length !== a.uniqueTags.length
          ? b.uniqueTags.length - a.uniqueTags.length
          : 0;
    }
  });

  // Slicing/Paginating the users with metrics
  const slicedUsersWithMetrics = usersWithMetricsSorted.slice(
    (page - 1) * limit,
    page * limit
  );

  // Returning the users with metrics
  return res.json(
    generateApiResponse(
      200,
      "Users fetched successfully",
      slicedUsersWithMetrics
    )
  );
});
