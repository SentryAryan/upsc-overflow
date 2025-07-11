import mongoose, { Document, Schema } from "mongoose";
import { QuestionTypeSchema } from "./question.model";

export interface AnswerTypeSchema extends Document {
  question: mongoose.Types.ObjectId | QuestionTypeSchema;
  content: string;
  answerer: string;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema: Schema<AnswerTypeSchema> = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    answerer: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Answer =
  mongoose.models.Answer ||
  mongoose.model<AnswerTypeSchema>("Answer", answerSchema);

export default Answer;
