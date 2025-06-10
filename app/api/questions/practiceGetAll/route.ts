import dbConnect from "@/db/dbConnect";
import Question from "@/db/models/question.model";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { NextRequest, NextResponse as res } from "next/server";

export const GET = errorHandler(async (req: NextRequest) => {
  await dbConnect();

  // Original raw pipeline approach
  // const aggregationPipeline = [
  //   {
  //     $match: {},
  //   },
  //   {
  //     $lookup: {
  //       from: "answers",
  //       localField: "_id",
  //       foreignField: "question",
  //       as: "answers",
  //       pipeline: [
  //         {
  //           $match: {},
  //         },
  //         {
  //           $lookup: {
  //             from: "likes",
  //             localField: "_id",
  //             foreignField: "answer",
  //             as: "likes",
  //           },
  //         },
  //         {
  //           $lookup: {
  //             from: "comments",
  //             localField: "_id",
  //             foreignField: "answer",
  //             as: "comments",
  //           },
  //         },
  //       ],
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "likes",
  //       localField: "_id",
  //       foreignField: "question",
  //       as: "likes",
  //     },
  //   },
  //   {
  //     $addFields: {
  //       answerCount: {
  //         $size: "$answers",
  //       },
  //       answerLikeCount: {
  //         $size: "$answers.likes",
  //       },
  //       answerCommentCount: {
  //         $size: "$answers.comments",
  //       },
  //       likeCount: {
  //         $size: "$likes",
  //       },
  //     },
  //   },
  // ];

  // Convert to Mongoose aggregate fluent API and store in question2
  const questions = await Question.aggregate()
    // Stage 1: Match all questions (equivalent to { $match: {} })
    .match({})

    // Stage 2: Lookup answers with nested pipeline for likes and comments
    .lookup({
      from: "answers",
      localField: "_id",
      foreignField: "question",
      as: "answers",
      pipeline: [
        // Lookup likes for each answer
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "answer",
            as: "likes",
          },
        },

        // Lookup comments for each answer
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "answer",
            as: "comments",
          },
        },
      ],
    })
    .lookup({
      from: "likes",
      localField: "_id",
      foreignField: "question",
      as: "likes",
    })
    .addFields({
      answerCount: {
        $size: "$answers",
      },
      answerLikeCount: {
        $sum: {
          $map: {
            input: "$answers",
            as: "answer",
            in: { $size: "$$answer.likes" }
          }
        }
      },
      answerCommentCount: {
        $sum: {
          $map: {
            input: "$answers",
            in: { $size: "$$this.comments" }
          }
        }
      },
      answerCommentCount2: {
        $size: "$answers.comments"
      },
      likeCount: {
        $size: "$likes",
      },
      votes: {
        $subtract: [
          {
            $size: {
              $filter: {
                input: "$likes",
                cond: {
                  $eq: ["$$this.isLiked", true],
                },
              },
            },
          },
          {
            $size: {
              $filter: {
                input: "$likes",
                cond: {
                  $eq: ["$$this.isLiked", false],
                },
              },
            },
          },
        ],
      },
    })
    // .project("votes answerCount answerLikeCount answerCommentCount likeCount");

  // Original approach for comparison
  // const questions = await Question.aggregate(aggregationPipeline);

  return res.json(
    generateApiResponse(200, "Questions fetched successfully", questions)
  );
});
