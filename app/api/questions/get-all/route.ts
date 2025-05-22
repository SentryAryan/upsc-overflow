import dbConnect from "@/db/dbConnect";
import Answer, { AnswerTypeSchema } from "@/db/models/answer.model";
import Comment from "@/db/models/comment.model";
import Like from "@/db/models/like.model";
import Question from "@/db/models/question.model";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import getClerkUserById from "@/lib/helpers/getClerkUserById";
import { NextRequest, NextResponse as res } from "next/server";

// Helper function to escape special regex characters
function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export const GET = errorHandler(async (req: NextRequest) => {
  await dbConnect();
  const page = Number(req.nextUrl.searchParams.get("page")) || 1;
  const limit = Number(req.nextUrl.searchParams.get("limit")) || 5;
  const subject = req.nextUrl.searchParams.get("subject");
  const tag = req.nextUrl.searchParams.get("tag");
  const question = req.nextUrl.searchParams.get("question");

  let searchQuery;
  if (question) {
    // Convert the query to a flexible pattern
    const chars = question.toLowerCase().split("");
    // Escape each character individually
    const escapedChars = chars.map((char) => escapeRegex(char));
    // Join with .* between each character
    const flexiblePattern = escapedChars.join(".*");

    searchQuery = { title: { $regex: flexiblePattern, $options: "i" } };
  }

  const questions = subject
    ? await Question.find({ subject })
        .skip((page - 1) * limit)
        .limit(limit)
    : tag
    ? await Question.find({ tags: tag })
        .skip((page - 1) * limit)
        .limit(limit)
    : question && searchQuery
    ? await Question.find(searchQuery)
        .skip((page - 1) * limit)
        .limit(limit)
    : await Question.find({})
        .skip((page - 1) * limit)
        .limit(limit);
  const totalQuestions = subject
    ? await Question.countDocuments({ subject })
    : tag
    ? await Question.countDocuments({ tags: tag })
    : question
    ? await Question.countDocuments(searchQuery)
    : await Question.countDocuments();
  const totalPages = Math.ceil(totalQuestions / limit);

  // Try to fetch user data but handle failures gracefully
  const users = await Promise.all(
    questions.map(async (question) => {
      try {
        const user = await getClerkUserById(question.asker);
        return user;
      } catch (error: any) {
        // Return a minimal user object if fetching fails
        console.log("This is the error", error);
        console.log("This is the error", error.message);
        return {
          firstName: "Anonymous",
          lastName: "",
          imageUrl: null,
        };
      }
    })
  );

  const likesAnswersComments = await Promise.all(
    questions.map(async (question) => {
      const likes = await Like.countDocuments({
        question: question._id,
        isLiked: true,
      });
      const dislikes = await Like.countDocuments({
        question: question._id,
        isLiked: false,
      });
      const answers = await Answer.find({ question: question._id });
      const answersComments = await Promise.all(
        answers.map(async (answer: AnswerTypeSchema) => {
          const answerComments = await Comment.countDocuments({
            answer: answer._id,
          });
          return answerComments;
        })
      );
      const questionComments = await Comment.countDocuments({
        question: question._id,
      });
      return {
        likes,
        dislikes,
        answers: answers.length,
        comments:
          questionComments +
          answersComments.reduce((acc, curr) => acc + curr, 0),
      };
    })
  );

  const questionsWithUsers = questions.map((question, index) => ({
    ...question._doc,
    user: users[index],
    likesAnswersComments: likesAnswersComments[index],
    totalPages,
  }));

  console.log(typeof questions[0]?.createdAt);
  console.log(questionsWithUsers[0]);

  return res.json(
    generateApiResponse(
      200,
      "Questions fetched successfully",
      questionsWithUsers
    )
  );
});
