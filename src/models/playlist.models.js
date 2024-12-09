import mongoose, { Schema } from "mongoose";

const playListSchema = new Schema({
        name: {
            type: string,
            required: true,
        },
        description: {
            type: string,
            required: true,
        },
        videos: [{
            type: Schema.Types.ObjectId,
            ref: "Videos",
        }, ],
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },

    {
        timestamp: true,
    }
);

export const Playlist = mongoose.model("Playlist", playListSchema);