import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { StatusCodes } from 'http-status-codes';

import cloudinary from '@/config/cloudinary.config';

interface CloudinaryUploadResult {
    public_id: string;
    [key: string]: any;
}

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
            error: "Upload image failed"
        }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
    }
}