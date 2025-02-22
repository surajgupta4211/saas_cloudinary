"use client";
import React, { useState, useRef } from "react";
import { CldImage } from "next-cloudinary";

export default function BackgroundRemovalPage() {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [bgRemovedImage, setBgRemovedImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/background-removal", { // ✅ Calls the new API
                method: "POST",
                body: formData
            });

            if (!response.ok) throw new Error("Failed to upload image");

            const data = await response.json();
            setUploadedImage(data.publicId);
            setBgRemovedImage(data.secureUrl); // ✅ Stores the background-removed image URL
        } catch (error) {
            console.error(error);
            alert("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = () => {
        if (!bgRemovedImage) return;

        fetch(bgRemovedImage)
            .then((response) => response.blob())
            .then((blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "background_removed.png"; // ✅ Download filename
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            });
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-center">AI-Powered Background Removal</h1>

            <div className="card">
                <div className="card-body">
                    <h2 className="card-title mb-4">Upload an Image</h2>
                    <input type="file" onChange={handleFileUpload} className="file-input file-input-bordered file-input-primary w-full" />

                    {isUploading && <progress className="progress progress-primary w-full"></progress>}

                    {bgRemovedImage ? (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-2">Background Removed Image:</h3>
                            <CldImage width={300} height={300} src={bgRemovedImage} alt="Background Removed" />

                            <button className="btn btn-primary mt-4" onClick={handleDownload}>
                                Download
                            </button>
                        </div>
                    ) : uploadedImage ? (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-2">Processing Image...</h3>
                            <progress className="progress progress-accent w-full"></progress>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
