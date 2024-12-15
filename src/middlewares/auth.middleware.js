import jwt from "jsonwebtoken";
import {
    apiError
} from "../utils/apiError.js"
import {
    User
} from "../models/users.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"



export const verifyJWT = asyncHandler(async(req, _, next) => {


    const token = req.header("Authorization") && req.header("Authorization").replace("Bearer ", "");

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = User.findById(decodedToken ? decodedToken._id : null).select("-password -refreshToken")

        if (!user) {
            throw new apiError(401, "Unauthorized access")
        }

        req.user = user;
        next();
    } catch (err) {
        throw new apiError(404, "Unauthorized access")
    }
})