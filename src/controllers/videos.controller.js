	import mongoose, { isValidObjectId } from "mongoose";
	import { Videos } from "../models/videos.models.js";
	import { User } from "../models/users.models.js";
	import { apiResponse } from "../utils/apiResponse.js";
	import { apiError } from "../utils/apiError.js";
	import { asyncHandler } from "../utils/asyncHandler.js";
	import {
	    uploadOnCloudinary,
	    deletedFromCloudinary,
	} from "../utils/cloudinary.js";

	const getAllVideos = asyncHandler(async(req, res) => {
	    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
	    //TODO: get all videos based on query, sort, pagination

	    const pipeline = [];

	    if (query) {
	        pipeline.push({
	            $match: {
	                $or: [
	                    { title: { $regex: query, $options: "i" } },
	                    { description: { $regex: query, $options: "i" } },
	                ],
	            },
	        });
	    }

	    if (userId) {
	        if (!isValidObjectId(userId)) {
	            throw new apiError(400, "Invalid userId format.");
	        }

	        pipeline.push({
	            $match: {
	                owner: new mongoose.Types.ObjectId(userId),
	            },
	        });
	    }

	    // fetch videos only that are set isPublished as true
	    pipeline.push({ $match: { isPublished: true } });

	    //sortBy can be views, createdAt, duration
	    if (sortBy && sortType) {
	        pipeline.push({
	            $sort: {
	                [sortBy]: sortType === "asc" ? 1 : -1,
	            },
	        });
	    } else {
	        pipeline.push({ $sort: { createdAt: -1 } });
	    }

	    pipeline.push({
	        $lookup: {
	            from: "users",
	            localField: "owner",
	            foreignField: "_id",
	            as: "ownerDetails",
	            pipeline: [{
	                $project: {
	                    username: 1,
	                    "avatar.url": 1,
	                },
	            }, ],
	        },
	    }, {
	        $unwind: "$ownerDetails",
	    });

	    if (!page && !limit) {
	        pipeline.push({ $sample: { size: 10 } });
	    }

	    const videoAggregate = Videos.aggregate(pipeline);

	    const options = {
	        page: parseInt(page, 10),
	        limit: parseInt(limit, 10),
	    };

	    const video = await Videos.aggregatePaginate(videoAggregate, options);

	    return res
	        .status(200)
	        .json(new apiResponse(200, video, "Videos fetched successfully"));
	});

	const publishAVideo = asyncHandler(async(req, res) => {
	    const { title, description } = req.body;
	    // TODO: get video, upload to cloudinary, create video

	    if ([title, description].some((field) => field && field.trim() === "")) {
	        throw new apiError(400, "All fields (title and description) are required.");
	    }

	    const videoFileLocalPath = req.files && req.files.videoFile[0].path;
	    const thumbnailLocalPath = req.files && req.files.thumbnail[0].path;

	    if (!videoFileLocalPath) {
	        throw new apiError(400, "Video file is required for upload.");
	    }

	    if (!thumbnailLocalPath) {
	        throw new apiError(400, "Thumbnail image is required for upload.");
	    }

	    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
	    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

	    if (!videoFile) {
	        throw new apiError(500, "Video upload to cloud failed. Please try again.");
	    }

	    if (!thumbnail) {
	        throw new apiError(500, "Thumbnail upload to cloud failed. Please try again.");
	    }

	    const video = await Videos.create({
	        title,
	        description,
	        duration: videoFile.duration,
	        videoFile: {
	            url: videoFile.url,
	            public_id: videoFile.public_id,
	        },
	        thumbnail: {
	            url: thumbnail.url,
	            public_id: thumbnail.public_id,
	        },
	        owner: req.user && req.user._id,
	        isPublished: false,
	    });

	    const videoUploaded = await Videos.findById(video._id);

	    if (!videoUploaded) {
	        throw new apiError(500, "Video upload failed. Please try again.");
	    }

	    return res
	        .status(200)
	        .json(new apiResponse(200, video, "Video uploaded successfully"));
	});

	const getVideoById = asyncHandler(async(req, res) => {
	    const { videoId } = req.params;
	    //TODO: get video by id
	    if (!isValidObjectId(videoId)) {
	        throw new apiError(400, "Invalid videoId format.");
	    }

	    if (!isValidObjectId(req.user && req.use._id)) {
	        throw new apiError(400, "Invalid userId format.");
	    }

	    const video = await Videos.aggregate([{
	            $match: {
	                _id: new mongoose.Types.ObjectId(videoId),
	            },
	        },
	        {
	            $lookup: {
	                from: "likes",
	                localField: "_id",
	                foreignField: "video",
	                as: "likes",
	            },
	        },
	        {
	            $lookup: {
	                from: "users",
	                localField: "owner",
	                foreignField: "_id",
	                as: "owner",
	                pipeline: [{
	                        $lookup: {
	                            from: "subscriptions",
	                            localField: "_id",
	                            foreignField: "channel",
	                            as: "subscribers",
	                        },
	                    },
	                    {
	                        $addFields: {
	                            subscribersCount: {
	                                $size: { $ifNull: ["$subscribers", []] },
	                            },
	                            isSubscribed: {
	                                $cond: {
	                                    if: {
	                                        $in: [req.user && req.user._id, "$subscribers.subscriber"],
	                                    },
	                                    then: true,
	                                    else: false,
	                                },
	                            },
	                        },
	                    },
	                    {
	                        $project: {
	                            username: 1,
	                            "avatar.url": 1,
	                            subscribersCount: 1,
	                            isSubscribed: 1,
	                        },
	                    },
	                ],
	            },
	        },
	        {
	            $addFields: {
	                likesCount: {
	                    $size: { $ifNull: ["$likes", []] },
	                },
	                owner: {
	                    $first: "$owner",
	                },
	                isLiked: {
	                    $cond: {
	                        if: {
	                            $in: [req.user && req.user._id, "$likes.likedBy"],
	                        },
	                        then: true,
	                        else: false,
	                    },
	                },
	            },
	        },
	        {
	            $project: {
	                "videoFile.url": 1,
	                title: 1,
	                description: 1,
	                views: 1,
	                createdAt: 1,
	                duration: 1,
	                comments: 1,
	                owner: 1,
	                likesCount: 1,
	                isLiked: 1,
	            },
	        },
	    ]);

	    if (!video) {
	        throw new apiError(404, "Video not found.");
	    }

	    await Videos.findByIdAndUpdate(videoId, {
	        $inc: {
	            views: 1,
	        },
	    });

	    await User.findByIdAndUpdate(req.user && req.user._id, {
	        $addToSet: {
	            watchHistory: videoId,
	        },
	    });

	    return res
	        .status(200)
	        .json(
	            new apiResponse(200, video[0], "Video details retrieved successfully.")
	        );
	});

	const updateVideo = asyncHandler(async(req, res) => {
	    const { videoId } = req.params;
	    //TODO: update video details like title, description, thumbnail

	    if (!isValidObjectId(videoId)) {
	        throw new apiError(400, "Invalid videoId format.");
	    }

	    if (!(title && description)) {
	        throw new apiError(400, "Both title and description are required.");
	    }

	    const video = await Videos.findById(videoId);

	    if (!video) {
	        throw new apiError(404, "Video not found.");
	    }

	    if (video && video.owner.toString() !== req.user && req.user._id.toString()) {
	        throw new apiError(403, "You are not authorized to update this video.");
	    }

	    //deleting old thumbnail and updating with new one
	    const thumbnailToDelete = video.thumbnail.public_id;

	    const thumbnailLocalPath = req.file && req.file.path;

	    if (!thumbnailLocalPath) {
	        throw new apiError(400, "New thumbnail image is required.");
	    }

	    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

	    if (!thumbnail) {
	        throw new apiError(500, "Thumbnail upload to cloud failed. Please try again.");
	    }

	    const updatedVideo = await Videos.findByIdAndUpdate(
	        videoId, {
	            $set: {
	                title,
	                description,
	                thumbnail: {
	                    public_id: thumbnail.public_id,
	                    url: thumbnail.url,
	                },
	            },
	        }, { new: true }
	    );

	    if (!updatedVideo) {
	        throw new apiError(500, "Video update failed. Please try again.");
	    }

	    if (updatedVideo) {
	        await deletedFromCloudinary(thumbnailToDelete);
	    }

	    return res
	        .status(200)
	        .json(new apiResponse(200, updatedVideo, "Video updated successfully."));
	});

	const deleteVideo = asyncHandler(async(req, res) => {
	    const { videoId } = req.params;
	    //TODO: delete video

	    if (!isValidObjectId(videoId)) {
	        throw new apiError(400, "Invalid videoId format.");
	    }


	    const video = await Videos.findById(videoId);

	    if (!video) {
	        throw new apiError(404, "Video not found.");
	    }

	    if (video && video.owner.toString() !== req.user && req.user._id.toString()) {
	        throw new apiError(403, "You are not authorized to delete this video.");
	    }

	    const videoDeleted = await Videos.findByIdAndDelete(video && video._id);

	    if (!videoDeleted) {
	        throw new apiError(400, "Failed to delete the video please try again");
	    }

	    await deletedFromCloudinary(video.thumbnail.public_id); // video model has thumbnail public_id stored in it->check videoModel
	    await deletedFromCloudinary(video.videoFile.public_id, "video"); // specify video while deleting video

	    await Like.deleteMany({
	        video: videoId,
	    })

	    await Comment.deleteMany({
	        video: videoId,
	    });

	    return res
	        .status(200)
	        .json(new apiResponse(200, null, "Video deleted successfully."));
	});

	const togglePublishStatus = asyncHandler(async(req, res) => {
	    const { videoId } = req.params;

	    if (!isValidObjectId(videoId)) {
	        throw new apiError(400, "Invalid videoId format.");
	    }

	    const video = await Videos.findById(videoId);

	    if (!video) {
	        throw new apiError(404, "Video not found");
	    }

	    if (video && video.owner.toString() !== req.user && req.user._id.toString()) {
	        throw new apiError(403, "You are not authorized to change the publish status of this video.");
	    }

	    const toggleVideoPublish = await Videos.findByIdAndUpdate(
	        videoId, {
	            $set: {
	                isPublished: !video && video.isPublished,
	            },
	        }, { new: true }
	    );

	    if (!toggleVideoPublish) {
	        throw new apiError(500, "Failed to toogle video publish status");
	    }

	    return res
	        .status(200)
	        .json(
	            new apiResponse(
	                200, { isPublished: toggleVideoPublish.isPublished },
	                "Video publish toggled successfully"
	            )
	        );
	});

	export {
	    getAllVideos,
	    publishAVideo,
	    getVideoById,
	    updateVideo,
	    deleteVideo,
	    togglePublishStatus,
	};