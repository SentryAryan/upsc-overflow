import mongoose, { Document, Schema } from "mongoose";
import { AnswerTypeSchema } from "./answer.model";
import { QuestionTypeSchema } from "./question.model";
import { CommentTypeSchema } from "./comment.model";

export interface LikeTypeSchema extends Document {
  question?: mongoose.Types.ObjectId | QuestionTypeSchema;
  answer?: mongoose.Types.ObjectId | AnswerTypeSchema;
  comment?: mongoose.Types.ObjectId | CommentTypeSchema;
  isLiked: boolean;
  liker: string;
  createdAt: Date;
  updatedAt: Date;
}

const likeSchema: Schema<LikeTypeSchema> = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      index: true,
    },
    answer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
      index: true,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      index: true,
    },
    isLiked: {
      type: Boolean,
      required: true,
    },
    liker: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Like =
  mongoose.models.Like || mongoose.model<LikeTypeSchema>("Like", likeSchema);

export default Like;
