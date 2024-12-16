import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async(req, res) => {
    //TODO: create tweet
    const { content, owner } = req.body;

    if (!content) {
        throw new apiError(400, "Invalid content for tweet");
    }

    const tweet = await Tweet.create({
        content: String(content),
        owner: req.user && req.user._id,
    });

    if (!tweet) {
        throw new apiError(400, "Tweet not created");
    }

    return res
        .status(200)
        .json(new apiResponse(200, tweet, "Tweet created Successfully"));
});

const getUserTweets = asyncHandler(async(req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new apiError(400, "Invalid userId");
    }

    const Tweets = await Tweet.aggregate([{
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [{
                    $project: {
                        username: 1,
                        "avatar.url": 1,
                    }
                }]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likeDetails",
                pipeline: [{
                    $project: {
                        likedBy: 1,
                    }
                }, ]
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likeDetails"
                },
                ownerDetails: {
                    $first: "$ownerDetails"
                },
                isLiked: {
                    $cond: {
                        if: {
                            $in: [req.user && req.user._id, "$likeDetails.likedBy"]
                        },
                        then: true,
                        else: false
                    },
                },
            },
        },
        {
            $sort: {
                createdAt: -1,
            }
        },
        {
            $project: {
                content: 1,
                ownerDetails: 1,
                likesCount: 1,
                createdAt: 1,
                isLiked: 1,
            }
        },
    ]);

    return res
        .status(200)
        .json(
            new apiResponse(200, Tweets, "All tweets created by user fetched successfully")
        );
});

const updateTweet = asyncHandler(async(req, res) => {
    //TODO: update tweet
    const { content } = req.body;
    const { tweetId } = req.params;

    if (!content) {
        throw new apiError(404, "Invalid Tweet");
    }
    if (!isValidObjectId(tweetId)) {
        throw new apiError(404, "Invalid TweetId");
    }
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new apiError(404, "Tweet not found");
    }

    const rqUserId = req.user && req.user._id.toString();
    if (tweet.owner && tweet.owner.toString() !== rqUserId) {
        throw new apiError(404, "Invalid Credentials");
    }

    const updatedTweet = await Tweet.update(tweetId, {
        $set: {
            content,
        },
    }, { new: true });

    if (!updatedTweet) {
        throw new apiError(400, "Tweet cannot be edited");
    }
})

const deleteTweet = asyncHandler(async(req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;
    if (isValidObjectId(tweetId)) {
        throw new apiError(400, "Tweet cannot be deleted");
    }

    const tweet = await findTweetById(tweetId);

    if (!tweet) {
        throw new apiError(400, "Tweet not found");
    }

    const reqUserId = req.user._id;
    if (tweet.owner.toString() !== reqUserId) {
        throw new apiError(400, "Tweet cannot be deleted by different users");
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
        .status(200)
        .json(new apiResponse(200, {}, "Successfully deleted"))
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };