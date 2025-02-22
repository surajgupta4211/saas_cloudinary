import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

interface CloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    [key: string]: any;
}

export async function POST(request: NextRequest) {
    const { userId } = auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "background-removal-uploads",
                    effect: "background_removal:cloudinary_ai", // ✅ Uses Cloudinary AI (Free Plan)
                    format: "png" // ✅ PNG to preserve transparency
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary API Error:", error);
                        reject(error);
                    } else {
                        resolve(result as CloudinaryUploadResult);
                    }
                }
            );
            uploadStream.end(buffer);
        });

        return NextResponse.json(
            {
                publicId: result.public_id,
                secureUrl: result.secure_url // ✅ Background removed image URL
            },
            {
                status: 200
            }
        );

    } catch (error: any) {
        console.error("Background removal failed:", error);
        return NextResponse.json({ error: error.message || "Background removal failed" }, { status: 500 });
    }
}
