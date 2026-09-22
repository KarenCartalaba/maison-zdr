import { ENV } from '@/config/env'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    secure: true,
    cloud_name: ENV.CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_SECRET_KEY
})

/** Allowed image formats passed to Cloudinary to reject unsupported types server-side. */
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp", "gif"];

/** Maximum decoded payload (bytes) accepted before forwarding to Cloudinary. */
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export const uploadImage = async (base64: string, folder = 'maison-zdr') => {
    // Server-side decoded-size guard (mirrors controller validation)
    const raw = base64.includes(",") ? base64.split(",")[1] : base64;
    const decodedBytes = Math.ceil((raw.length * 3) / 4);
    if (decodedBytes > MAX_UPLOAD_BYTES) {
        const err = new Error("File size too large. Maximum decoded size is 5 MB.");
        (err as any).http_code = 413;
        throw err;
    }

    try {
        const result = await cloudinary.uploader.upload(base64, {
            folder,
            allowed_formats: ALLOWED_FORMATS,
        })
        return result
    } catch (error) {
        console.log("Upload image error: ", error)
        throw error
    }
}

export const getPublicIdFromUrl = (url: string) => {
    try {
        const parts = url.split('/');
        const folder = parts[parts.length - 2];
        const lastPart = parts[parts.length - 1];
        const filename = lastPart.split('.')[0];
        return `${folder}/${filename}`;
    } catch {
        return "";
    }
}

export const deleteImage = async (publicId: string) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.log("Delete image error: ", error);
    }
}

export default cloudinary;
