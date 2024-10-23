import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

/**
 * Handles GET request to /api/video
 * Retrieves all videos ordered by createdAt in descending order
 * @param request NextRequest object
 * @returns NextResponse with status 200 and the videos in JSON format
 * If there's an error, returns NextResponse with status 500 and the error message in JSON format
 */
export async function GET() {
    try {
        const videos = await prisma.video.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json({
            videos
        }, StatusCodes.OK as any);
    } catch (error) {
        console.log("Error in Retriving Videos: ", error);
        return NextResponse.json({
            message: "Error in Retriving Videos: " + error
        }, StatusCodes.INTERNAL_SERVER_ERROR as any);
    } finally {
        await prisma.$disconnect();
    }
}