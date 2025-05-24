import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const uploadToCloudnary = async function (localFilePath) {
    try {
        if (!localFilePath) return null;
        cloudinary.config({ 
        cloud_name: process.env.CLOUDNARY_NAME, 
        api_key: process.env.CLOUDNARY_API_KEY, 
        api_secret: process.env.CLOUDNARY_API_SECRET 
        });
        console.log("localFilePath", localFilePath);

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type:'auto'
        });

        console.log("File upload to cloudnary ", response.url);
        fs.unlinkSync(localFilePath);

        return response.url;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.log(error, "Failed to upload file to cloudnary");
    }
}

export { uploadToCloudnary }