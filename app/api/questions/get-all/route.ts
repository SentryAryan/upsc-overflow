import dbConnect from "@/db/dbConnect";
import Answer, { AnswerTypeSchema } from "@/db/models/answer.model";
import Comment from "@/db/models/comment.model";
import Like from "@/db/models/like.model";
import Question, {
  QuestionTypeSchema,
  QuestionType,
} from "@/db/models/question.model";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import getClerkUserById from "@/lib/helpers/getClerkUserById";
import { NextRequest, NextResponse as res } from "next/server";
import { generateApiError } from "@/lib/helpers/api-error.helper";

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
  const sortBy = req.nextUrl.searchParams.get("sortBy") || "date-desc";

  let searchQuery;
  if (question) {
    // Convert the query to a flexible pattern
    const chars = question.toLowerCase().split("");
    // Escape each character individually
    const escapedChars = chars.map((char) => escapeRegex(char));
    // Join with .* between each character
    const flexiblePattern = escapedChars
      .map((char) => (char === " " ? "\\s*" : char))
      .join(".*");

    searchQuery = { title: { $regex: flexiblePattern, $options: "i" } };
  }

  let questions: any[] = [];
  let totalQuestions: number = 0;
  if (sortBy) {
    // METHOD 1: Using MongoDB Aggregation Pipeline
    // const aggregationPipeline = [
    //   // Match stage for filtering by subject, tag, or question title
    //   {
    //     $match: subject
    //       ? { subject }
    //       : tag
    //       ? { tags: tag }
    //       : question && searchQuery
    //       ? searchQuery
    //       : {},
    //   },
    //   // Lookup likes for vote calculation
    //   {
    //     $lookup: {
    //       from: "likes",
    //       localField: "_id",
    //       foreignField: "question",
    //       as: "questionLikes",
    //     },
    //   },
    //   // Lookup answers
    //   {
    //     $lookup: {
    //       from: "answers",
    //       localField: "_id",
    //       foreignField: "question",
    //       as: "questionAnswers",
    //     },
    //   },
    //   // Lookup direct comments on questions
    //   {
    //     $lookup: {
    //       from: "comments",
    //       localField: "_id",
    //       foreignField: "question",
    //       as: "directComments",
    //     },
    //   },
    //   // Lookup comments on answers
    //   {
    //     $lookup: {
    //       from: "comments",
    //       localField: "questionAnswers._id",
    //       foreignField: "answer",
    //       as: "answerComments",
    //     },
    //   },
    //   // Add calculated fields
    //   {
    //     $addFields: {
    //       votes: {
    //         $subtract: [
    //           {
    //             $size: {
    //               $filter: {
    //                 input: "$questionLikes",
    //                 cond: { $eq: ["$$this.isLiked", true] },
    //               },
    //             },
    //           },
    //           {
    //             $size: {
    //               $filter: {
    //                 input: "$questionLikes",
    //                 cond: { $eq: ["$$this.isLiked", false] },
    //               },
    //             },
    //           },
    //         ],
    //       },
    //       answerCount: { $size: "$questionAnswers" },
    //       commentCount: {
    //         $add: [{ $size: "$directComments" }, { $size: "$answerComments" }],
    //       },
    //     },
    //   },
    //   // Sort stage
    //   {
    //     $sort:
    //       sortBy === "date-desc"
    //         ? { createdAt: -1 }
    //         : sortBy === "date-asc"
    //         ? { createdAt: 1 }
    //         : sortBy === "votes-desc"
    //         ? { votes: -1, createdAt: -1 }
    //         : sortBy === "answers-desc"
    //         ? { answerCount: -1, createdAt: -1 }
    //         : sortBy === "comments-desc"
    //         ? { commentCount: -1, createdAt: -1 }
    //         : { createdAt: 1 },
    //   },
    //   // Pagination
    //   { $skip: (page - 1) * limit },
    //   { $limit: limit },
    //   // Remove temporary fields
    //   {
    //     $project: {
    //       questionLikes: 0,
    //       questionAnswers: 0,
    //       directComments: 0,
    //       answerComments: 0,
    //       votes: 0,
    //       answerCount: 0,
    //       commentCount: 0,
    //     },
    //   },
    // ];

    // const questions2 = await Question.aggregate(aggregationPipeline);

    // METHOD 2: Without Aggregation Pipeline (Pure JS + Mongoose)

    // Step 1: Get base questions with filter
    let baseQuestions = subject
      ? await Question.find({ subject })
      : tag
      ? await Question.find({ tags: tag })
      : question && searchQuery
      ? await Question.find(searchQuery)
      : await Question.find({});

    totalQuestions = subject
      ? await Question.countDocuments({ subject })
      : tag
      ? await Question.countDocuments({ tags: tag })
      : question && searchQuery
      ? await Question.countDocuments(searchQuery)
      : await Question.countDocuments();

    if (baseQuestions.length === 0) {
      throw generateApiError(404, "No questions found", ["No questions found"]);
    }

    // Step 2: Calculate sorting metrics for each question
    const questionsWithMetrics = await Promise.all(
      baseQuestions.map(async (q) => {
        console.log("q =", q);
        console.log("q._doc =", { ...q._doc });
        console.log("q.toObject() =", { ...q.toObject() });
        console.log("q.toJSON() =", { ...q.toJSON() });
        let votes = 0;
        let answerCount = 0;
        let commentCount = 0;

        if (sortBy === "votes-desc") {
          const likes = await Like.countDocuments({
            question: q._id,
            isLiked: true,
          });
          const dislikes = await Like.countDocuments({
            question: q._id,
            isLiked: false,
          });
          votes = likes - dislikes;
        }

        if (sortBy === "answers-desc") {
          answerCount = await Answer.countDocuments({ question: q._id });
        }

        if (sortBy === "comments-desc") {
          const directComments = await Comment.countDocuments({
            question: q._id,
          });
          const answers = await Answer.find({ question: q._id });
          const answerComments = await Promise.all(
            answers.map(async (answer: AnswerTypeSchema) => {
              const answerComments = await Comment.countDocuments({
                answer: answer._id,
              });
              return answerComments;
            })
          );
          commentCount =
            directComments +
            answerComments.reduce((acc, curr) => acc + curr, 0);
        }

        return {
          ...q._doc,
          _votes: votes,
          _answerCount: answerCount,
          _commentCount: commentCount,
        };
      })
    );
    console.log("Single question", questionsWithMetrics[0]);
    console.log("Date field =", questionsWithMetrics[0].createdAt);
    console.log(
      "Type of Date field =",
      typeof questionsWithMetrics[0].createdAt
    );

    // Step 3: Sort based on criteria
    questionsWithMetrics.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          console.log(
            "Difference of Dates in date-desc =",
            b.createdAt - a.createdAt
          );
          return b.createdAt - a.createdAt;
        case "date-asc":
          return (
            console.log(
              "Difference of Dates in date-asc =",
              a.createdAt - b.createdAt
            ),
            a.createdAt - b.createdAt
          );
        case "votes-desc":
          return b._votes !== a._votes
            ? b._votes - a._votes
            : b.createdAt - a.createdAt;
        case "answers-desc":
          return b._answerCount !== a._answerCount
            ? b._answerCount - a._answerCount
            : b.createdAt - a.createdAt;
        case "comments-desc":
          return b._commentCount !== a._commentCount
            ? b._commentCount - a._commentCount
            : b.createdAt - a.createdAt;
        case "tags-desc":
          return b.tags.length !== a.tags.length
            ? b.tags.length - a.tags.length
            : b.createdAt - a.createdAt;
        default:
          return b.createdAt - a.createdAt;
      }
    });

    // Step 4: Apply pagination
    questions = questionsWithMetrics
      .slice((page - 1) * limit, page * limit)
      .map(({ _votes, _answerCount, _commentCount, ...q }) => q); // Remove temp fields
  } else {
    questions = subject
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

    if (questions.length === 0) {
      throw generateApiError(404, "No questions found", ["No questions found"]);
    }

    totalQuestions = subject
      ? await Question.countDocuments({ subject })
      : tag
      ? await Question.countDocuments({ tags: tag })
      : question && searchQuery
      ? await Question.countDocuments(searchQuery)
      : await Question.countDocuments();
  }

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

  const questionsWithUsers = sortBy
    ? questions.map((question, index) => ({
        ...question,
        user: users[index],
        likesAnswersComments: likesAnswersComments[index],
        totalPages: Math.ceil(totalQuestions / limit),
      }))
    : questions.map((question, index) => ({
        ...question._doc,
        user: users[index],
        likesAnswersComments: likesAnswersComments[index],
        totalPages: Math.ceil(totalQuestions / limit),
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
