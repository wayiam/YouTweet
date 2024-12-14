import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscribers: {
      types: Schema.Types.ObjectId, //User who subscribed
      ref: "User",
    },
    channel: {
      types: Schema.Types.ObjectId, //One to whom
      ref: "User",
    },
  },
  {
    timestamp: true,
  },
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
