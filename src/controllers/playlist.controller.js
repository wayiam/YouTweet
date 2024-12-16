import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js"
import { Videos } from "../models/videos.models.js"
import { apiResponse } from "../utils/apiResponse.js"
import { apiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async(req, res) => {

    //TODO: create playlist
    const { name, description } = req.body

    if (!name || !description) {
        throw new apiError(400, "name and description both are required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user && req.use._id,
    })

    if (!playlist) {
        throw new apiError(500, "Playlist cannot be created");
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, playlist, "Playlist has been created successfully")
        );
})

const getUserPlaylists = asyncHandler(async(req, res) => {
    const { userId } = req.params
        //TODO: get user playlists

    if (!isValidObjectId(userId)) {
        throw new apiError(400, "Invalid userId");
    }

    const playlists = await Playlist.aggregate([{
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                },
                totalVideos: {
                    $size: "$videos"
                },
                totalViews: {
                    $sum: "$videos.views"
                },
                firstVideoThumbnail: {
                    $arrayElemAt: ["$videos.thumbnail.url", 0]
                }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                totalVideos: 1,
                totalViews: 1,
                updatedAt: 1,
                createdAt: 1,
                firstVideoThumbnail: 1,
                owner: {
                    username: 1,
                }
            }
        },
    ]);

    return res
        .status(200)
        .json(new apiResponse(200, playlists, "Current User playlists fetched successfully"));

})

const getPlaylistById = asyncHandler(async(req, res) => {
    const { playlistId } = req.params
        //TODO: get playlist by id
    if (!isValidObjectId(playlistId)) {
        throw new apiError(400, "PlaylistId doesn't exist");
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }

    const playlistVideos = await Playlist.aggregate([{
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $unwind: {
                path: "$videos",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $match: {
                "videos.isPublished": true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "videos.owner",
                foreignField: "_id",
                as: "videos.owner" // Embed the video owner details
            }
        },
        {
            $addFields: {
                "videos.owner": { $arrayElemAt: ["$videos.owner", 0] } // Extract the first owner (single owner per video)
            }
        },
        {
            $group: {
                _id: "$_id",
                name: { $first: "$name" },
                description: { $first: "$description" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
                totalViews: { $sum: "$videos.views" },
                totalVideos: { $sum: 1 }, // Count total videos during grouping
                videos: { $push: "$videos" }
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1,
                totalVideos: 1,
                totalViews: 1,
                videos: {
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    createdAt: 1,
                    views: 1,
                    owner: {
                        username: 1,
                        fullName: 1,
                        "avatar.url": 1
                    }
                }
            }
        }
    ]);

    return res
        .status(200)
        .json(new apiResponse(200, playlistVideos[0], "Playlist fetched successfully"));

})

const addVideoToPlaylist = asyncHandler(async(req, res) => {
    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid PlaylistId or videoId");
    }

    const playlist = await Playlist.findById(playlistId);
    const video = await Videos.findById(videoId);

    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }
    if (!video) {
        throw new apiError(404, "video not found");
    }

    if (playlist.owner.toString() !== req.user && req.user._id.toString()) {
        throw new apiError(400, "only owner can add video to thier playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlist && playlist._id, {
            $addToSet: {
                videos: videoId,
            }
        }, { new: true }
    )

    if (!updatedPlaylist) {
        throw new apiError(
            400,
            "failed to add video to playlist please try again"
        );
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, updatedPlaylist, "Added video to playlist successfully")
        );
})

const removeVideoFromPlaylist = asyncHandler(async(req, res) => {
    const { playlistId, videoId } = req.params
        // TODO: remove video from playlist
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid PlaylistId or videoId");
    }

    const playlist = await Playlist.findById(playlistId);
    const video = await Videos.findById(videoId);

    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }
    if (!video) {
        throw new apiError(404, "video not found");
    }

    if (playlist.owner && playlist.owner.toString() !== req.user && req._id.toString()) {
        throw new apiError(
            404,
            "only owner can remove video from thier playlist"
        );
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId, {
            $pull: {
                videos: videoId,
            },
        }, { new: true }
    );

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                updatedPlaylist,
                "Removed video from playlist successfully"
            )
        );
})

const deletePlaylist = asyncHandler(async(req, res) => {
    const { playlistId } = req.params
        // TODO: delete playlist

    if (!isValidObjectId(playlistId)) {
        throw new apiError(400, "Invalid PlaylistId");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user && req.user._id.toString()) {
        throw new apiError(400, "only owner can delete the playlist");
    }

    await Playlist.findByIdAndDelete(playlist && playlist._id);

    return res
        .status(200)
        .json(
            new apiResponse(
                200, {},
                "playlist deleted successfully"
            )
        );
})

const updatePlaylist = asyncHandler(async(req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
        //TODO: update playlist

    if (!name || !description) {
        throw new apiError(400, "name and description both are required");
    }

    if (!isValidObjectId(playlistId)) {
        throw new apiError(400, "Invalid PlaylistId");
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user && req.user._id.toString()) {
        throw new apiError(400, "Admin can only edit this playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlist && playlist._id, {
            $set: {
                name,
                description,
            }
        }, { new: true }
    )

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                updatedPlaylist,
                "The Playlist has been updated successfully"
            )
        );
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}