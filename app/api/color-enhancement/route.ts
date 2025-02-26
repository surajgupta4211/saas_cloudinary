import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File not found. Please upload an image." }, { status: 400 });
    }

    // ✅ File type validation (Only allow JPEG & PNG)
    const allowedMimeTypes = ["image/jpeg", "image/png"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file format. Only JPEG and PNG are allowed." }, { status: 400 });
    }

    // ✅ Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ✅ Upload Image to Cloudinary with Enhancements
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "color-enhancement",
          format: "jpg", // Convert all uploads to JPG
          transformation: [
            { effect: "auto_color" },
            { effect: "auto_contrast" },
            { effect: "auto_brightness" },
            { effect: "saturation:80" }, // Increased for stronger effect
            { effect: "vibrance:90" } // More color pop effect
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      originalUrl: (result as any).secure_url,
      transformedUrl: (result as any).secure_url, // ✅ Fixes Download issue
    });

  } catch (error) {
    console.error("❌ Color enhancement failed", error);
    return NextResponse.json({ error: "Color enhancement failed" }, { status: 500 });
  }
}
