//lib/cloudinary.ts

import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary configuration
 * This file is SERVER-ONLY
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * Upload a file buffer to Cloudinary
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<{
  secure_url: string;
  public_id: string;
}> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error || !result) {
            reject(error);
            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      )
      .end(buffer);
  });
}

export default cloudinary;
