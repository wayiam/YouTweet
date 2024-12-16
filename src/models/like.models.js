import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema({
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet",
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
    },
}, {
    timestamp: true,
}, );

export const Like = mongoose.model("Like", likeSchema);