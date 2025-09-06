import mongoose, { Document, Schema } from "mongoose";
import { User } from "@clerk/nextjs/server";
import { subjects } from "@/lib/constants/subjects";

export interface QuestionTypeSchema extends Document {
  title: string;
  description: string;
  subject: string;
  tags: string[];
  asker: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface QuestionType {
  _id: string;
  title: string;
  description: string;
  subject: string;
  tags: string[];
  asker: string;
  createdAt: Date;
  updatedAt: Date;
  questionLikes: number;
  questionDislikes: number;
  isLikedByLoggedInUser: boolean;
  isDislikedByLoggedInUser: boolean;
  user: User;
}

const questionSchema: Schema<QuestionTypeSchema> = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    subject: {
      type: String,
      required: true,
      enum: subjects,
      lowercase: true,
    },
    tags: {
      type: [
        {
          type: String,
          trim: true,
          lowercase: true,
        },
      ],
    },
    asker: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

const Question =
  mongoose.models.Question ||
  mongoose.model<QuestionTypeSchema>("Question", questionSchema);

export default Question;
