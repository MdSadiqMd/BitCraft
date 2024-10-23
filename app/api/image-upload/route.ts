import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { StatusCodes } from 'http-status-codes';

import cloudinary from '@/config/cloudinary.config';
import { cloudinaryImageUploadResult as CloudinaryUploadResult } from '@/types';

/**
 * Handles POST request to /api/image-upload
 * Uploads a file to Cloudinary in the bit-craft-image-uploads folder
 * Returns a JSON response with the public_id of the uploaded file
 * If the user is not authenticated, returns a 401 Unauthorized response
 * If the file is not found, returns a 404 Not Found response
 * If there's an error during the upload, returns a 500 Internal Server Error response
 * @param request NextRequest object
 * @returns NextResponse with status 200 and the publicId of the uploaded image in JSON format
 */
export async function POST(request: NextRequest) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({
            error: "Unauthorized"
        }, { status: StatusCodes.UNAUTHORIZED });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        if (!file) {
            return NextResponse.json({
                error: "File not found"
            }, { status: StatusCodes.NOT_FOUND });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const result = await new Promise<CloudinaryUploadResult>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "bit-craft-image-uploads" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result as CloudinaryUploadResult);
                    }
                );
                uploadStream.end(buffer);
            }
        );
        return NextResponse.json({
            publicId: result.public_id
        }, { status: StatusCodes.OK });
    } catch (error) {
        console.log("Image Upload Failed: ", error);
        return NextResponse.json({
            error: "Image Upload Failed"
        }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
    }
}