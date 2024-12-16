import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js"
import { apiResponse } from "../utils/apiResponse.js"
import { apiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async(req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid videoId");
    }

    const likedAlready = await Like.findOne({
        video: videoId,
        likedBy: req.user && user._id,
    });

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready && likedAlready._id)

        return res
            .status(200)
            .json(
                new apiResponse(200, { isLiked: false })
            )
    }

    await Like.create({
        video: videoId,
        likedBy: req.user && req.user._id
    })

    return res
        .status(200)
        .json(
            new apiResponse(200, { isLiked: true }, "Like updated successfully")
        )
})

const toggleCommentLike = asyncHandler(async(req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new apiError(400, "Invalid Comment Id");
    }


    const likedAlready = await Like.findOne({
        comment: commentId,
        likedBy: req.user && req.user._id,
    });

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready && likedAlready._id);

        return res
            .status(200)
            .json(new apiResponse(200, { isLiked: false }));
    }

    await Like.create({
        comment: commentId,
        likedBy: req.user && req.user._id,
    });

    return res
        .status(200)
        .json(new apiResponse(200, { isLiked: true }));
});

const toggleTweetLike = asyncHandler(async(req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "The tweetId is Invalid");
    }


    const likedAlready = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user && req.user._id,
    });

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready && likedAlready._id);

        return res
            .status(200)
            .json(new apiResponse(200, { tweetId, isLiked: false }));
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user && req.user._id,
    });

    return res
        .status(200)
        .json(new apiResponse(200, { isLiked: true }));
});

const getLikedVideos = asyncHandler(async(req, res) => {
    const likedVideosAggegate = await Like.aggregate([{
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user && req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo",
                pipeline: [{
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                        }
                    },
                    {
                        $unwind: "$ownerDetails",
                    },
                ],
            }
        },
        {
            $unwind: "$likedVideo",
        },
        {
            $sort: {
                createdAt: -1,
            }
        },
        {
            $project: {
                _id: 0,
                likedVideo: {
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    owner: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    duration: 1,
                    createdAt: 1,
                    isPublished: 1,
                    ownerDetails: {
                        username: 1,
                        fullName: 1,
                        "avatar.url": 1,
                    }
                }
            }
        }
    ])

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                likedVideosAggegate,
                "All liked videos were fetched successfully"
            )
        );
})

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };