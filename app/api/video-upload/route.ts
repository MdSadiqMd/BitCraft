import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import cloudinary from '@/config/cloudinary.config';
import { cloudinaryVideoUploadResult as CloudinaryUploadResult } from '@/types';

const prisma = new PrismaClient();

/**
 * Handles POST request to /api/video-upload
 * Uploads a file to Cloudinary in the video-uploads folder
 * Returns a JSON response with the created video in JSON format
 * If the user is not authenticated, returns a 401 Unauthorized response
 * If the file is not found, returns a 404 Not Found response
 * If there's an error during the upload, returns a 500 Internal Server Error response
 * @param request NextRequest object
 * @returns NextResponse with status 200 and the created video in JSON format
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
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const originalSize = formData.get("originalSize") as string;
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
                    {
                        resource_type: "video",
                        folder: "video-uploads",
                        transformation: [
                            { quality: "auto", fetch_format: "mp4" },
                        ]
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result as CloudinaryUploadResult);
                    }
                );
                uploadStream.end(buffer);
            }
        );
        const video = await prisma.video.create({
            data: {
                userId,
                title,
                description,
                publicId: result.public_id,
                originalSize: originalSize,
                compressedSize: String(result.bytes),
                duration: result.duration || 0,
            }
        });
        return NextResponse.json({
            data: video
        }, { status: StatusCodes.OK });
    } catch (error) {
        console.log("Image Upload Failed: ", error);
        return NextResponse.json({
            error: "Image Upload Failed"
        }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
    } finally {
        await prisma.$disconnect();
    }
}