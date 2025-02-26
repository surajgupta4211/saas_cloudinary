import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Allowed video formats
const ALLOWED_VIDEO_FORMATS = ["video/mp4", "video/avi", "video/mov", "video/mkv"];
const MAX_FILE_SIZE = 70 * 1024 * 1024; // 70MB

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const originalSize = formData.get("originalSize") as string;

        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 400 });
        }

        // ✅ Validate File Format
        if (!ALLOWED_VIDEO_FORMATS.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file format. Allowed formats: MP4, AVI, MOV, MKV" }, { status: 400 });
        }

        // ✅ Validate File Size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "File size exceeds the 70MB limit" }, { status: 400 });
        }

        // ✅ Validate Title Length
        if (title.length > 255) {
            return NextResponse.json({ error: "Title must be 255 characters or less" }, { status: 400 });
        }

        // ✅ Validate Description Length
        if (description.length > 1000) {
            return NextResponse.json({ error: "Description must be 1000 characters or less" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // ✅ Upload Video to Cloudinary
        const uploadResult = await new Promise<{ public_id: string; bytes: number; duration?: number }>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "video",
                        folder: "video-uploads",
                        transformation: [{ quality: "auto", fetch_format: "mp4" }]
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result as any);
                    }
                );
                uploadStream.end(buffer);
            }
        );

        // ✅ Save Video Data to Database
        const video = await prisma.video.create({
            data: {
                title,
                description,
                publicId: uploadResult.public_id,
                originalSize: originalSize,
                compressedSize: String(uploadResult.bytes),
                duration: uploadResult.duration || 0
            }
        });

        return NextResponse.json(video, { status: 201 });
    } catch (error) {
        console.error("Upload video failed", error);
        return NextResponse.json({ error: "Upload video failed" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
