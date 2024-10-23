import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import cloudinary from '@/config/cloudinary.config';
import { cloudinaryVideoUploadResult as CloudinaryUploadResult } from '@/types';

const prisma = new PrismaClient();

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