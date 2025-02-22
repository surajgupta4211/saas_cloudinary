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

        // ✅ Upload Image to Cloudinary with AWS Rekognition Auto-Tagging
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "auto-tagging",
                    categorization: "aws_rek_tagging", // ✅ Use AWS Rekognition Instead of Google Vision
                    auto_tagging: 0.6 // 🔥 Only return relevant tags with >60% confidence
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        const { public_id, secure_url, tags } = uploadResult as any; // Cloudinary image URL & tags

        if (!public_id) {
            return NextResponse.json({ error: "Upload failed" }, { status: 500 });
        }

        console.log("✅ Image Uploaded:", secure_url);
        console.log("✅ Detected Tags:", tags);

        return NextResponse.json({ imageUrl: secure_url, tags }, { status: 200 });

    } catch (error: any) {
        console.error("❌ Auto-Tagging failed", error);
        return NextResponse.json({ error: error.message || "Auto-Tagging failed" }, { status: 500 });
    }
}
