"use client";
import React, { useState, useEffect, useRef } from 'react';
import { CldImage } from 'next-cloudinary';
import axios from 'axios';

import socialFormats from '@/constants/socialFormats.constant';

type SocialFormat = keyof typeof socialFormats;
const SocialShare = () => {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [selectedFormat, setSelectedFormat] = useState<SocialFormat>("Instagram Square (1:1)");
    const [isUploading, setIsUploading] = useState(false);
    const [isTransforming, setIsTransforming] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (uploadedImage) {
            setIsTransforming(true);
        }
    }, [selectedFormat, uploadedImage]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const response = await axios.post("/api/image-upload", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.status !== 200) throw new Error("Failed to upload image");
            const data = response.data;
            setUploadedImage(data.publicId);
        } catch (error) {
            console.error("Failed to Upload Image to Cloudinary: ", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = async () => {
        if (!imageRef.current) return;
        try {
            const response = await axios.get(imageRef.current.src, {
                responseType: 'blob'
            });
            const blob = response.data;
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${selectedFormat
                .replace(/\s+/g, "_")
                .toLowerCase()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to Download Image: ", error);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-center">
                Social Media Image Creator
            </h1>
            <div className="card">
                <div className="card-body">
                    <h2 className="card-title mb-4">Upload an Image</h2>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Choose an image file</span>
                        </label>
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            className="file-input file-input-bordered file-input-primary w-full"
                        />
                    </div>
                    {isUploading && (
                        <div className="mt-4">
                            <progress className="progress progress-primary w-full"></progress>
                        </div>
                    )}
                    {uploadedImage && (
                        <div className="mt-6">
                            <h2 className="card-title mb-4">Select Social Media Format</h2>
                            <div className="form-control">
                                <select
                                    className="select select-bordered w-full"
                                    value={selectedFormat}
                                    onChange={(e) =>
                                        setSelectedFormat(e.target.value as SocialFormat)
                                    }
                                >
                                    {Object.keys(socialFormats).map((format) => (
                                        <option key={format} value={format}>
                                            {format}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mt-6 relative">
                                <h3 className="text-lg font-semibold mb-2">Preview:</h3>
                                <div className="flex justify-center">
                                    {isTransforming && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50 z-10">
                                            <span className="loading loading-spinner loading-lg"></span>
                                        </div>
                                    )}
                                    <CldImage
                                        width={socialFormats[selectedFormat].width}
                                        height={socialFormats[selectedFormat].height}
                                        src={uploadedImage}
                                        sizes="100vw"
                                        alt="transformed image"
                                        crop="fill"
                                        aspectRatio={socialFormats[selectedFormat].aspectRatio}
                                        gravity='auto'
                                        ref={imageRef}
                                        onLoad={() => setIsTransforming(false)}
                                    />
                                </div>
                            </div>
                            <div className="card-actions justify-end mt-6">
                                <button className="btn btn-primary" onClick={handleDownload}>
                                    Download for {selectedFormat}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SocialShare;