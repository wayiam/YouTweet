import mongoose, { Schema } from "mongoose";

const playListSchema = new Schema({
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        videos: [{
            type: Schema.Types.ObjectId,
            ref: "Videos",
        }, ],
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },

    {
        timestamp: true,
    },
);

export const Playlist = mongoose.model("Playlist", playListSchema);