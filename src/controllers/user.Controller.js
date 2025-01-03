import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/users.models.js";
import {
    uploadOnCloudinary,
    deletedFromCloudinary,
} from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import { generateAccessandRefreshToken } from "../utils/generateAccessandRefreshToken.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async(req, res, next) => {
    const { fullName, email, username, password } = req.body;

    //Validation
    if (
        [fullName, username, email, password].some(
            (field) => field && field.trim() === ""
        )
    ) {
        throw new apiError(400, "All fields are required");
    }
    const existedUser = await User.findOne({
        $or: [{
                username,
            },
            {
                email,
            },
        ],
    });
    if (existedUser) {
        throw new apiError(400, "User already exists");
    }

    const avatarLocalPath =
        req.files &&
        req.files.avatar &&
        req.files.avatar[0] &&
        req.files.avatar[0].path;
    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar not found");
    }
    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath);
        //console.log("Uploaded Avatar" , avatar)
    } catch (err) {
        console.log("Error uploading avatar: " + err);
        throw new apiError(500, "Failed to upload avatar");
    }
    const coverLocalPath =
        req.files &&
        req.files.coverImage &&
        req.files.coverImage[0] &&
        req.files.coverImage[0].path;
    if (!coverLocalPath) {
        throw new apiError(400, "CoverImage not found");
    }
    let coverImage;
    try {
        coverImage = await uploadOnCloudinary(coverLocalPath);
        //console.log("Uploaded coverImage" , coverImage)
    } catch (err) {
        console.log("Error uploading coverImage: " + err);
        throw new apiError(500, "Failed to upload coverImage");
    }
    try {
        const user = await User.create({
            fullName: fullName,
            avatar: avatar.url,
            coverImage: (coverImage && coverImage.url) || "",
            email,
            password,
            username: username.toLowerCase(),
        });

        const createdUser = await User.findById(user.id).select(
            "-password -refreshToken"
        );

        if (!createdUser) {
            throw new apiError(500, "Something went wrong");
        }

        return res
            .status(201)
            .json(new apiResponse(200, createdUser, "User created successfully"));
    } catch (error) {
        console.log("User creation failed");
        if (avatar) {
            await deletedFromCloudinary(avatar.public_id);
        }
        if (coverImage) {
            await deletedFromCloudinary(coverImage.public_id);
        }
        throw new apiError(
            500,
            "Something went wrong while registering a user and image deleted"
        );
    }
});

const loggedInUser = asyncHandler(async(req, res, next) => {
    const { email, username, password } = req.body;

    if (!email && !username) {
        new apiError(403, "Invalid email or username");
    }
    const user = await User.findOne({
        $or: [{ email: email }, { username: username }],
    });

    if (!user) {
        throw new apiError(404, "User doesn't exists");
    }
    //validatepassword
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new apiError(404, "Password is incorrect");
    }

    const { accessToken, refreshToken } = await generateAccessandRefreshToken(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!loggedInUser) {
        throw new apiError(400, "User needs to be LogIn");
    }

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", options, accessToken)
        .cookie("refreshToken", options, refreshToken)
        .json(
            new apiResponse(
                200, { user: loggedInUser, accessToken, refreshToken },
                "User successfully Logged In"
            )
        );
});

const loggedOutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        // ToDo:need to come back after the middleware
        req.user._id, {
            $set: {
                refreshToken: undefined,
            },
        }, { new: true }
    );

    const options = {
        httpsOnly: true,
        secure: process.env.NODE_ENV === "production",
    };
    return res
        .status(200)
        .clearCookies("accessToken", options)
        .clearCookies("refreshToken", options)
        .json(200, {}, "User logged out successfully");
});

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new apiError(401, "Refresh token is required");
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decodedToken && decoded._id);

        if (!user) {
            throw new apiError(404, "Session expired");
        }
        if (!incomingRefreshToken) {
            throw new apiError(404, "Invalid refresh token");
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        };

        const { accessToken, refreshToken: newRefreshToken } =
        await generateAccessandRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new apiResponse(
                    200, {
                        accessToken,
                        refreshToken: newRefreshToken,
                    },
                    "Access token refreshed successfully"
                )
            );
    } catch (e) {
        throw new apiError(
            404,
            (e && e.message) || "Something  went wrong with the refresh Token"
        );
    }
});

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const { currentpassword, newpassword } = req.body;

    const user = req.user && req.user._id && (await User.findById(req.user._id));

    const isPasswordValid = user.isPasswordCorrect(currentpassword);

    if (!isPasswordValid) {
        throw new apiError("Invalid password");
    }

    user.password = newpassword;

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new apiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async(req, res) => {
    return res.status(200).json(new apiResponse(200, req.user, "Current user"));
});

const updateAccountDetails = asyncHandler(async(req, res) => {
    const { fullName, email } = req.body;

    if (!email && !fullName) {
        throw new apiError(400, "Name or email not valid");
    }

    const user = await User.findByIdAndUpdate(
        req.user && req.user._id, {
            $set: {
                fullName: fullName,
                email: email,
            },
        }, { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new apiResponse(200, user, "Account details Updated Successfully"));
});

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file && req.file.path;

    if (!coverImageLocalPath) {
        new apiError(404, "No cover image");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage) {
        throw new apiError(500, "Failed to update cover Image");
    }

    const user = await User.findByIdAndUpdate(
        req.user && req.user._id, {
            $set: {
                coverImage: coverImage.url,
            },
        }, { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new apiResponse(200, user, "Cover Image Updated Successfully"));
});

const updateUserAvatarImage = asyncHandler(async(req, res) => {
    const avatarImagePath = req.file && req.file.path;

    if (!avatarImagePath) {
        throw new apiError(403, "Invalid avatar");
    }

    const avatar = await uploadOnCloudinary(avatarImagePath);

    if (!avatar) {
        throw new apiError(403, "Invalid avatar file");
    }

    const user = User.findByIdAndUpdate(
        req.user && req.user._id, {
            $set: {
                avatar: avatar.url,
            },
        }, { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new apiResponse(200, user, "Avatar image updated Successfully"));
});

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const { username } = req.params;

    if (!username && username.trim()) {
        throw new apiError(400, "Invalid username");
    }

    const channel = await User.aggregate([{
            $match: {
                username: username && username.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user && req.user._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            },
        },
    ]);

    if (!channel && channel.length) {
        throw new apiError(404, "channel does not exists");
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, channel[0], "User channel fetched successfully")
        );
});

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([{
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [{
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [{
                                $project: {
                                    fullName: 1,
                                    username: 1,
                                    avatar: 1,
                                },
                            }, ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new apiResponse(200, user[0].watchHistory, "Watch history data fetched")
        );
});

export {
    getWatchHistory,
    getUserChannelProfile,
    updateUserAvatarImage,
    updateUserCoverImage,
    updateAccountDetails,
    getCurrentUser,
    changeCurrentPassword,
    refreshAccessToken,
    loggedOutUser,
    loggedInUser,
    registerUser,
};