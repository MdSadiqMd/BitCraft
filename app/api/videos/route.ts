import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

/**
 * Handles GET request to /api/video
 * Retrieves all videos ordered by createdAt in descending order
 * @param request NextRequest object
 * @returns NextResponse with status 200 and the videos in JSON format
 * If there's an error, returns NextResponse with status 500 and the error message in JSON format
 */
export async function GET() {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({
            message: "Unauthorized"
        }, { status: StatusCodes.UNAUTHORIZED });
    }
    
    try {
        const videos = await prisma.video.findMany({
            where: {
                userId: userId as string
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json({
            videos
        }, { status: StatusCodes.OK });
    } catch (error) {
        console.log("Error in Retrieving Videos: ", error);
        return NextResponse.json({
            message: "Error in Retrieving Videos: " + error
        }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
    } finally {
        await prisma.$disconnect();
    }
}