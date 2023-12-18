import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
dotenv.config();


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

export async function uploadimage(photo, username, folder) {
    try {
        const result = await cloudinary.uploader
            .upload(photo, {
                folder: `${folder}/${username}`,
                resource_type: 'image'
            });
        return result;
    } catch (error) {
        return error;
    }
}