# Cloudinary — Image Uploads

## Provider

**Cloudinary**: https://cloudinary.com

- Free tier: 25GB storage, 25GB bandwidth/month
- Image upload, transformation, and CDN delivery

## Environment Variables

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_SECRET_KEY=your-api-secret
```

## Setup (`src/lib/cloudinary.ts`)

```typescript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  secure: true,
  cloud_name: ENV.CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_SECRET_KEY,
});
```

## Upload Flow

1. Frontend sends base64 image data in request body
2. Express body parser limit set to `10mb` for large base64 strings
3. Backend uploads to Cloudinary folder `maison-zdr`
4. Returns `secure_url` stored in database

```typescript
export const uploadImage = async (base64: string, folder = "maison-zdr") => {
  const result = await cloudinary.uploader.upload(base64, { folder });
  return result;
};
```

## Available Functions

| Function | Description |
|----------|-------------|
| `uploadImage(base64, folder?)` | Upload base64 image |
| `uploadImageFromUrl(url, folder, publicId?)` | Upload from URL |
| `deleteImage(publicId)` | Delete single image |
| `deleteImages(publicIds[])` | Batch delete images |
| `getPublicIdFromUrl(url)` | Extract public ID from URL |

## Where Used

| Feature | Usage |
|---------|-------|
| Profile picture | User uploads avatar |
| Event gallery | Admin uploads event images |
| News images | Admin uploads news article images |

## Folder Structure

Cloudinary organizes uploads under the `maison-zdr` folder:
```
maison-zdr/
├── profile/        Profile pictures
├── events/         Event gallery images
└── news/           News article images
```

## Frontend Integration

Images are uploaded as base64 from the frontend:
1. User selects image file
2. FileReader converts to base64
3. Base64 string sent in API request body
4. Backend uploads to Cloudinary
5. Cloudinary URL stored in database
6. Frontend displays the Cloudinary URL
