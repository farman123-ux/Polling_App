import {v2 as cloudinary} from 'cloudinary'
import multer from 'multer'

cloudinary.config({
    cloud_name: process.env.CLOUDDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDDINARY_API_KEY || process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET
})

export const upload = multer({storage : multer.memoryStorage()})

// to upload images to cloudinary
export const uploadToCloudinary = (buffer) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {folder : "polling-app"},
            (err, result) => (err ? reject(err) : resolve(result.secure_url))
        )
        stream.end(buffer)
    })

export default cloudinary