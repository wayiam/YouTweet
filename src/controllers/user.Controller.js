import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/users.models.js";
import {uploadOnCloudinary, deletedFromCloudinary } from "../utils/cloudinary.js";
import {apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async(req, res,next) => {
    const { fullName, email, username, password } = req.body;

    //Validation
    if (
        [fullName, username, email, password].some((field) => field?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required")
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

  if(existedUser){
	  throw new apiError(400, "User already exists")
  }

  // const avatar = await uploadOnCloudinary(avatarLocalPath)
// let coverImage = ""

// if(coverLocalPath){
// 	coverImage = await uploadOnCloudinary(coverImage)
// }
const avatarLocalPath = req.files?.avatar?.[0]?.path;
if(!avatarLocalPath){
	throw new apiError(400, "Avatar not found")
}
let avatar;
try{
 avatar =  await uploadOnCloudinary(avatarLocalPath)
 console.log("Uploaded Avatar" , avatar)
}catch(err){
	console.log("Error uploading avatar: " + err)
	throw new apiError(500, "Failed to upload avatar")
}


const coverLocalPath = req.files?.coverImage?.[0]?.path;
if(!coverLocalPath){
	throw new apiError(400, "CoverImage not found")
}
let  coverImage;
try{
 coverImage =  await uploadOnCloudinary(coverLocalPath)
 console.log("Uploaded coverImage" , coverImage)
}catch(err){
	console.log("Error uploading coverImage: " + err)
	throw new apiError(500, "Failed to upload coverImage")
}


try{
	const user = await User.create({
		fullName,
		avatar:avatar.url,
		coverImage:coverImage?.url || "",
		email,
		password,
		username:username.toLowerCase(),
	})
	
	const createdUser = await User.findById(user.id).select("-password -refreshToken" )
	
	if(!createdUser){
		throw new apiError(500, "Something went wrong")
	}
	
	return res.status(201).json(new apiResponse(200, createdUser, "User created successfully"))
	
	
} catch(error){
  console.log("User creation failed");
  if(avatar){
	 await deletedFromCloudinary(avatar.public_id)
  }
  if(coverImage){
	await deletedFromCloudinary(coverImage.public_id)
  }


	throw new apiError(500, "Something went wrong while registering a user and image deleted")

}

})
export { registerUser }