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
      return NextResponse.json({ error: "File not found" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "color-enhancement",
          transformation: [
            { effect: "auto_color" },
            { effect: "auto_contrast:50" }, // Boosts contrast more aggressively
            { effect: "auto_brightness:40" }, // Increases brightness significantly
            { effect: "saturation:60" }, // Boosts color vibrancy
            { effect: "vibrance:70" } // Enhances dull colors
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
      transformedUrl: (result as any).secure_url,
    });

  } catch (error) {
    console.error("Color enhancement failed", error);
    return NextResponse.json({ error: "Color enhancement failed" }, { status: 500 });
  }
}
