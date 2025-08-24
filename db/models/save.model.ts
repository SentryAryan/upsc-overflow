import mongoose, { Document, Schema } from "mongoose";
import { QuestionTypeSchema } from "./question.model";

export interface SaveTypeSchema extends Document {
  question: mongoose.Types.ObjectId | QuestionTypeSchema;
  saver: string;
  createdAt: Date;
  updatedAt: Date;
}

const saveSchema: Schema<SaveTypeSchema> = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true,
    },
    saver: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Save =
  mongoose.models.Save || mongoose.model<SaveTypeSchema>("Save", saveSchema);

export default Save;
