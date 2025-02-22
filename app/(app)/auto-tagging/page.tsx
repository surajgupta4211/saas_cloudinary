"use client";
import React, { useState } from "react";

export default function AutoTaggingPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await fetch("/api/auto-tagging", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            if (data.imageUrl) {
                setImageUrl(data.imageUrl);
                setTags(data.tags || []);
            } else {
                alert("Auto-tagging failed.");
            }
        } catch (error) {
            console.error("Failed to tag image", error);
        }

        setLoading(false);
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-center">AI-Powered Auto-Tagging</h1>

            <div className="card">
                <div className="card-body">
                    <h2 className="card-title mb-4">Upload an Image</h2>
                    <input 
                        type="file"
                        className="file-input file-input-bordered w-full mb-4"
                        onChange={handleFileChange}
                    />

                    <button className="btn btn-primary" onClick={handleUpload}>
                        {loading ? "Processing..." : "Upload & Detect Tags"}
                    </button>

                    {imageUrl && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-2">Detected Image:</h3>
                            <img src={imageUrl} alt="Detected Image" className="w-64 h-64 rounded-lg shadow-lg" />
                        </div>
                    )}

                    {tags.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-2">Detected Tags:</h3>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, index) => (
                                    <span key={index} className="badge badge-primary px-3 py-1">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
