"use client";
import React, { useState } from "react";

export default function ColorEnhancementPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [transformedUrl, setTransformedUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      // ✅ Check for valid file format
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage("Invalid file format! Only JPEG and PNG are allowed.");
        setSelectedFile(null);
        return;
      }

      setErrorMessage(null);
      setSelectedFile(file);
    }
  };

  const handleTransform = async () => {
    if (!selectedFile) {
      alert("Please select an image before enhancing color.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/color-enhancement", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (data.error) {
        setErrorMessage(data.error);
        setLoading(false);
        return;
      }

      if (data.transformedUrl) {
        setOriginalUrl(data.originalUrl);
        setTransformedUrl(data.transformedUrl);
      } else {
        alert("Color enhancement failed.");
      }
    } catch (error) {
      console.error("Failed to enhance color", error);
    }

    setLoading(false);
  };

  const handleDownload = () => {
    if (!transformedUrl) {
      alert("No transformed image available for download.");
      return;
    }

    fetch(transformedUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "enhanced_image.jpg"; // ✅ Fixes Download Issue
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">AI Auto Color Enhancement</h1>

      <div className="card bg-base-200 shadow-lg p-6">
        <div className="card-body">
          <h2 className="card-title mb-4">Upload an Image</h2>
          <input
            type="file"
            className="file-input file-input-bordered w-full mb-4"
            onChange={handleFileChange}
          />

          {errorMessage && <p className="text-red-500">{errorMessage}</p>}

          <button className="btn btn-primary w-full" onClick={handleTransform}>
            {loading ? "Processing..." : "Enhance Color"}
          </button>

          {/* Show Images Side by Side */}
          {originalUrl && transformedUrl && (
            <div className="flex justify-center items-start mt-6 space-x-6">
              {/* Original Image */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Original</h3>
                <img src={originalUrl} alt="Original Image" className="w-64 h-64 rounded-lg shadow-lg" />
              </div>

              {/* Transformed Image */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Enhanced</h3>
                <img src={transformedUrl} alt="Enhanced Image" className="w-64 h-64 rounded-lg shadow-lg" />

                {/* Download Button */}
                <button 
                  className="mt-4 bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
                  onClick={handleDownload}
                >
                  ⬇ Download
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
