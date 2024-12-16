import mongoose from "mongoose"
import { Comment } from "../models/comment.models.js"
import { apiError } from "../utils/apiError.js"
import { Videos } from "../models/videos.models.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const getVideoComments = asyncHandler(async(req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const video = Videos.findById(videoId)

    if (!video) {
        throw new apiError(404, "Video not found");
    }

    const commentsAggregate = Comment.aggregate([{
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user && req.user._id, "$likes.likedBy"] },
                        then: true,
                        else: false,
                    }
                }
            }
        },
        {
            $sort: {
                createdAt: -1,
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                likesCount: 1,
                owner: {
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1
                },
                isLiked: 1
            }
        },
    ])

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const comments = await Comment.aggregatePaginate(
        commentsAggregate,
        options,
    )

    return res
        .status(200)
        .json(
            new apiResponse(200, comments, "Comments fetched successfully")
        )
})
const addComment = asyncHandler(async(req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const video = Video.findById(videoId)

    if (!video) {
        throw new apiError(404, "Video not found");
    }

    const commentsAggregate = Comment.aggregate([{
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user && req.user._id, "$likes.likedBy"] },
                        then: true,
                        else: false,
                    }
                }
            }
        },
        {
            $sort: {
                createdAt: -1,
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                likesCount: 1,
                owner: {
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1
                },
                isLiked: 1
            }
        },
    ])

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const comments = await Comment.aggregatePaginate(
        commentsAggregate,
        options,
    )

    return res
        .status(200)
        .json(
            new apiResponse(200, comments, "Comments fetched successfully")
        )
})

const updateComment = asyncHandler(async(req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new apiError(400, "Content is required");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new apiError(404, "Comment not found");
    }

    if (comment.owner && comment.owner.toString() !== req.user && req.user._id.toString()) {
        throw new apiError(400, "Only comment owner can edit their comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        comment && comment._id, {
            $set: {
                content,
            }
        }, { new: true },
    )

    if (!updatedComment) {
        throw new apiError(500, "Failed to edit comment please try again");
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, updatedComment, "Comment updated successfully")
        );
})

const deleteComment = asyncHandler(async(req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new apiError(404, "Comment not found");
    }

    if (comment && comment.owner.toString() !== req.user && req.user._id.toString()) {
        throw new apiError(400, "only comment owner can delete their comment");
    }

    await Comment.findByIdAndDelete(commentId);

    await Like.deleteMany({
        comment: commentId,
        likedBy: req.user
    });

    return res
        .status(200)
        .json(
            new apiResponse(200, { commentId }, "Comment deleted successfully")
        );
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}