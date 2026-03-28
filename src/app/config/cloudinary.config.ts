import { v2 as cloudinary } from "cloudinary";
import AppError from "../errorHelpers/AppError";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const deleteImageFromCloudinary = async (url: string) => {
    try {
        // Extract public_id from URL
        const regex = /\/v\d+\/(.+)\./;
        const match = url.match(regex);
        
        if (match && match[1]) {
            const publicId = match[1];
            await cloudinary.uploader.destroy(publicId);
            console.log(`✅ Image deleted: ${publicId}`);
        }
    } catch (error: any) {
        throw new AppError(500, "Failed to delete image from Cloudinary");
    }
};

export const cloudinaryUpload = cloudinary;


// /* eslint-disable @typescript-eslint/no-explicit-any */

// // Frontedn -> Form Data with Image File -> Multer -> Form data -> Req (Body + File)

// import { v2 as cloudinary } from "cloudinary";
// import AppError from "../errorHelpers/AppError";
// // import { envVars } from "./env";

// // Amader folder -> image -> form data -> File -> Multer -> Amader project / pc te Nijer ekta folder(temporary) -> Req.file

// //req.file -> cloudinary(req.file) -> url -> mongoose -> mongodb


// cloudinary.config({
//     // cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME  ,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// })

// export const deleteImageFromCLoudinary = async (url: string) => {
//     try {
//         //https://res.cloudinary.com/djzppynpk/image/upload/v1753126572/ay9roxiv8ue-1753126570086-download-2-jpg.jpg.jpg

//         const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;

//         const match = url.match(regex);

//         console.log({ match });

//         if (match && match[1]) {
//             const public_id = match[1];
//             await cloudinary.uploader.destroy(public_id)
//             console.log(`File ${public_id} is deleted from cloudinary`);

//         }
//     } catch (error: any) {
//         throw new AppError(401, "Cloudinary image deletion failed", error.message)
//     }
// }

// export const cloudinaryUpload = cloudinary



// const uploadToCloudinary = cloudinary.uploader.upload()

//

//Multer storage cloudinary
//Amader folder -> image -> form data -> File -> Multer -> storage in cloudinary -> url ->  req.file  -> url  -> mongoose -> mongodb