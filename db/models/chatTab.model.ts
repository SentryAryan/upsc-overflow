import mongoose, { Document, Schema } from "mongoose";
import { UIMessage } from "ai";

export interface ChatTabTypeSchema extends Document {
  name: string;
  chatter: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatTabSchema: Schema<ChatTabTypeSchema> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    chatter: {
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

const ChatTab =
  mongoose.models.ChatTab ||
  mongoose.model<ChatTabTypeSchema>("ChatTab", chatTabSchema);

export default ChatTab;
