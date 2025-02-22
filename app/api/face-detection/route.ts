import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: NextRequest) {
    const { userId } = auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // ✅ Upload Image to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "face-detection" }, 
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        const { public_id, secure_url } = uploadResult as any; // Cloudinary image URL

        if (!public_id) {
            return NextResponse.json({ error: "Upload failed" }, { status: 500 });
        }

        // ✅ Apply Smart Cropping & Face Detection
        const transformedUrl = cloudinary.url(public_id, {
            secure: true, // Ensures HTTPS URL
            crop: "thumb",
            gravity: "face", // AI detects faces and centers them
            width: 300,
            height: 300
        });

        console.log("Original Image:", secure_url);
        console.log("Transformed Image:", transformedUrl);

        return NextResponse.json({ transformedUrl, originalUrl: secure_url }, { status: 200 });

    } catch (error: any) {
        console.error("❌ Face detection failed", error);
        return NextResponse.json({ error: error.message || "Face detection failed" }, { status: 500 });
    }
}
