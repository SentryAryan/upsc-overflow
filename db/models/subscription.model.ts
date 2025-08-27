import mongoose, { Document, Schema } from "mongoose";

export interface SubscriptionTypeSchema extends Document {
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema: Schema<SubscriptionTypeSchema> = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Subscription =
  mongoose.models.Subscription ||
  mongoose.model<SubscriptionTypeSchema>("Subscription", subscriptionSchema);

export default Subscription;
