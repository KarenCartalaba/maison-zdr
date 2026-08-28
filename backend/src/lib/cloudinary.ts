import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
  secure: true,
});

/**
 * Upload an image buffer to Cloudinary.
 * @param fileBuffer - The file buffer to upload
 * @param folder - Cloudinary folder (e.g. "maison-zdr/profiles", "maison-zdr/events")
 * @param publicId - Optional public ID (without folder prefix)
 * @returns The uploaded image URL and metadata
 */
export async function uploadImage(
  fileBuffer: Buffer,
  folder: string,
  publicId?: string
) {
  return new Promise<{
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
  }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "image",
        overwrite: !!publicId,
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed"));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Upload a file from a URL to Cloudinary.
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  folder: string,
  publicId?: string
) {
  const result = await cloudinary.uploader.upload(imageUrl, {
    folder,
    public_id: publicId,
    resource_type: "image",
    overwrite: !!publicId,
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  };
}

/**
 * Delete an image from Cloudinary by public ID.
 */
export async function deleteImage(publicId: string) {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
  return result;
}

/**
 * Delete multiple images from Cloudinary.
 */
export async function deleteImages(publicIds: string[]) {
  if (publicIds.length === 0) return [];
  const result = await cloudinary.api.delete_resources(publicIds, {
    type: "upload",
    resource_type: "image",
  });
  return result;
}

/**
 * Extract the public ID from a Cloudinary URL.
 * Example: "https://res.cloudinary.com/demo/image/upload/v1234/maison-zdr/profiles/abc.jpg"
 * Returns: "maison-zdr/profiles/abc"
 */
export function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
  return match ? match[1] : null;
}

export default cloudinary;
