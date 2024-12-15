import { Router } from "express";
import {
    getUserChannelProfile,
    getWatchHistory,
    updateUserAvatarImage,
    updateUserCoverImage,
    updateAccountDetails,
    getCurrentUser,
    changeCurrentPassword,
    refreshAccessToken,
    loggedOutUser,
    loggedInUser,
    registerUser,
} from "../controllers/user.Controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multers.middlewares.js";
const routers = Router();

//Routes which can be accesable by anyone  (Unsecured routes)
routers.route("/register").post(
    upload.fields([{
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser,
);
routers.route("/login").post(loggedInUser);
routers.route("/refreshtoken").post(refreshAccessToken);




//Routes which can only be accessed after security check (Secured Routes)
routers.route("/logout").post(verifyJWT, loggedOutUser);
routers.route("/user").get(verifyJWT, getCurrentUser);


routers.route("/changepassword").post(verifyJWT, changeCurrentPassword)
routers.route("/updatedetails").patch(verifyJWT, updateAccountDetails);


routers.route("/updatecoverimg").patch(verifyJWT, upload.single("coverimg"), updateUserCoverImage);
routers.route("/updateavatarimg").patch(verifyJWT, upload.single("avatarimg"), updateUserAvatarImage);


routers.route("/channel/:username").get(verifyJWT, getUserChannelProfile)
routers.route("/history").get(verifyJWT, getWatchHistory)

export default routers;