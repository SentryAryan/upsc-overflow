import mongoose, { Document, Schema } from "mongoose";
import { UIMessage } from "ai";

export interface ChatTypeSchema extends Document {
  chatTab: mongoose.Types.ObjectId;
  message: UIMessage;
  ai_model: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema: Schema<ChatTypeSchema> = new mongoose.Schema(
  {
    chatTab: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "ChatTab",
      index: true,
    },
    ai_model: {
      type: String,
      required: true,
      index: true,
    },
    message: {
      type: Object,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Chat =
  mongoose.models.Chat || mongoose.model<ChatTypeSchema>("Chat", chatSchema);

export default Chat;
