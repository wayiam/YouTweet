import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

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
            resourceType: "auto"
        })
        console.log(`File uploaded on Cloudinary. FilePath: ${response.url}`)
            //Once the file is uploaded delete it fom our server
        fs.unlinkSync(localfilepath);
        return response;
    } catch (e) {
        fs.unlinkSync(localfilepath);
        return null;
    }
}

export { uploadOnCloudinary }




















(async function() {
    // Configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
    });

    // Upload an image
    const uploadResult = await cloudinary.uploader
        .upload(
            "https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg", {
                public_id: "shoes",
            }
        )
        .catch((error) => {
            console.log(error);
        });

    console.log(uploadResult);

    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.url("shoes", {
        fetch_format: "auto",
        quality: "auto",
    });

    console.log(optimizeUrl);

    // Transform the image: auto-crop to square aspect_ratio
    const autoCropUrl = cloudinary.url("shoes", {
        crop: "auto",
        gravity: "auto",
        width: 500,
        height: 500,
    });

    console.log(autoCropUrl);
})();