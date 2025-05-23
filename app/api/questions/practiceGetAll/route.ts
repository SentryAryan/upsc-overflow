import dbConnect from "@/db/dbConnect";
import Question from "@/db/models/question.model";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import getClerkUserById from "@/lib/helpers/getClerkUserById";
import { NextRequest, NextResponse as res } from "next/server";

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const GET = errorHandler(async (req: NextRequest) => {
  await dbConnect();

  const questions2 = await Question.aggregate([
   // Stage 1: Match all questions (equivalent to Question.find({}))
   { $match: {} },
   
   // Stage 2: Lookup likes for questions
   {
     $lookup: {
       from: "likes",
       localField: "_id",
       foreignField: "question",
       as: "likes"
     }
   },
   
   // Stage 3: Lookup answers for questions
   {
     $lookup: {
       from: "answers",
       localField: "_id",
       foreignField: "question",
       as: "answers"
     }
   },
   
   // Stage 4: Lookup direct comments on questions
   {
     $lookup: {
       from: "comments",
       localField: "_id",
       foreignField: "question",
       as: "comments"
     }
   },
   
   // Stage 5: Lookup likes for each answer
   {
     $lookup: {
       from: "likes",
       localField: "answers._id",
       foreignField: "answer",
       as: "answerLikes"
     }
   },
   
   // Stage 6: Lookup comments for each answer
   {
     $lookup: {
       from: "comments",
       localField: "answers._id",
       foreignField: "answer",
       as: "answerComments"
     }
   },
   
   // Stage 7: Calculate virtual fields
   {
     $addFields: {
       votes: {
         $subtract: [
           {
             $size: {
               $filter: {
                 input: "$likes",
                 cond: { $eq: ["$$this.isLiked", true] }
               }
             }
           },
           {
             $size: {
               $filter: {
                 input: "$likes",
                 cond: { $eq: ["$$this.isLiked", false] }
               }
             }
           }
         ]
       },
       answerCount: { $size: "$answers" },
       commentCount: {
         $add: [
           { $size: "$comments" },
           { $size: "$answerComments" }
         ]
       }
     }
   },
   
   // Stage 8: Clean up temporary fields (optional)
   // {
   //   $project: {
   //     answerLikes: 0, // Remove temporary field
   //     // Keep everything else
   //     title: 1,
   //     description: 1,
   //     subject: 1,
   //     tags: 1,
   //     asker: 1,
   //     createdAt: 1,
   //     updatedAt: 1,
   //     likes: 1,
   //     answers: 1,
   //     comments: 1,
   //     answerComments: 1,
   //     votes: 1,
   //     answerCount: 1,
   //     commentCount: 1
   //   }
   // }
 ]);

  const questions = await Question.find({})
    .populate("likes")
    .populate({
      path: "answers",
      populate: [
        {
          path: "likes",
          model: "Like",
        },
        {
          path: "comments",
          model: "Comment",
        },
      ],
    })
    .populate("comments");

  // const questionWithAnswersAndComments = questions.map((question) => ({
  //   ...question._doc,
  //   answers: question.answers.map((answer) => ({
  //     ...answer._doc,
  //     likes: answer.likes,
  //     comments: answer.comments,
  //   })),
  //   votes: question.votes,
  //   answerCount: question.answerCount,
  //   commentCount: question.commentCount,
  //   likes: question.likes,
  //   comments: question.comments,
  // }));

  const questionsWithVotes = questions.map((question) => ({
    ...question._doc,
    votes: question.votes,
    answerCount: question.answerCount,
    commentCount: question.commentCount,
    likes: question.likes,
    answers: question.answers,
    comments: question.comments,
  }));

  return res.json(
    generateApiResponse(
      200,
      "Questions fetched successfully",
      [questions, questions2]
    ),
    { status: 200 }
  );
});
