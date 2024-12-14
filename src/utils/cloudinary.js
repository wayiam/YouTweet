import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import env from "dotenv";

env.config();

//Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async(localfilepath) => {
    try {
        if (!localfilepath) return null;
        const response = await cloudinary.uploader.upload(localfilepath, {
            resourceType: "auto",
        });
        console.log(`File uploaded on Cloudinary. FilePath: ${response.url}`);
        //Once the file is uploaded delete it fom our server
        fs.unlinkSync(localfilepath);
        return response;
    } catch (e) {
        fs.unlinkSync(localfilepath);
        return null;
    }
};

const deletedFromCloudinary = async(publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Deleted from cloudinary.PublicId: " + publicId);
    } catch (error) {
        console.log("Error deleting  from cloudinary", error);
        return null;
    }
};

export { uploadOnCloudinary, deletedFromCloudinary };