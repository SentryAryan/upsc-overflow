import mongoose, { Document, Schema } from "mongoose";

export interface TestTypeSchema extends Document {
  questions: string;
  answers: string[];
  review: string;
  ai_model: string;
  creator: string;
  createdAt: Date;
  updatedAt: Date;
}

const testSchema: Schema<TestTypeSchema> = new mongoose.Schema(
  {
    questions: {
      type: String,
      required: true,
      trim: true,
    },
    answers: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    review: {
      type: String,
      required: true,
      trim: true,
    },
    ai_model: {
      type: String,
      required: true,
      index: true,
    },
    creator: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Test =
  mongoose.models.Test || mongoose.model<TestTypeSchema>("Test", testSchema);

export default Test;
