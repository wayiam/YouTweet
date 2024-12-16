import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-paginate-v2";

const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
    },
}, {
    timestamp: true,
}, );
commentSchema.plugin(mongooseAggregatePaginate);
export const Comment = mongoose.model("Comment", { commentSchema });