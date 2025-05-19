import mongoose, { Document, Schema } from "mongoose";
import { AnswerTypeSchema } from "./answer.model";
import { QuestionTypeSchema } from "./question.model";

export interface CommentTypeSchema extends Document {
  answer?: mongoose.Types.ObjectId | AnswerTypeSchema;
  question?: mongoose.Types.ObjectId | QuestionTypeSchema;
  content: string;
  commenter: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema: Schema<CommentTypeSchema> = new mongoose.Schema(
  {
    answer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    commenter: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Comment =
  mongoose.models.Comment ||
  mongoose.model<CommentTypeSchema>("Comment", commentSchema);

export default Comment;
