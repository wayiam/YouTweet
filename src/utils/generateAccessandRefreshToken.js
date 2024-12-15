import { User } from "../models/users.models.js"
import { apiError } from "./apiError.js"

const generateAccessandRefreshToken = async(userID) => {
    const user = await User.findById(userID);
    if (!user) {
        throw new apiError(400, "UserId not found");
    } else {
        try {
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();
            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false })
            return { accessToken, refreshToken }
        } catch (e) {

            throw new apiError(500, "Error generating access/refresh token")
        }

    }
}

export { generateAccessandRefreshToken }