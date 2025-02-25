"use client";
import React, { useState } from "react";

export default function ContentAnalysisPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await fetch("/api/image-analyze", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            if (data.url) {
                setImageUrl(data.secure_url);
                setAnalysis(data);
            } else {
                alert("Image analysis failed.");
            }
        } catch (error) {
            console.error("Failed to analyze image", error);
        }

        setLoading(false);
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-center">AI Content Analysis</h1>

            <div className="card">
                <div className="card-body">
                    <h2 className="card-title mb-4">Upload an Image</h2>
                    <input 
                        type="file"
                        className="file-input file-input-bordered w-full mb-4"
                        onChange={handleFileChange}
                    />

                    <button className="btn btn-primary" onClick={handleAnalyze}>
                        {loading ? "Processing..." : "Analyze Image"}
                    </button>

                    {imageUrl && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-2">Uploaded Image:</h3>
                            <img src={imageUrl} alt="Analyzed Image" className="w-64 h-64 rounded-lg shadow-lg" />
                        </div>
                    )}

                    {analysis && (
                        <div className="mt-6 bg-gray-800 text-white p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">AI Analysis Results:</h3>
                            <pre className="text-sm">{JSON.stringify(analysis, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
