import React, { useState, useEffect } from 'react';
import { getCldImageUrl, getCldVideoUrl } from "next-cloudinary";
import { Download, Clock, FileDown, FileUp } from "lucide-react";
import dayjs from 'dayjs';
import relativeTime from "dayjs/plugin/relativeTime";
import { filesize } from "filesize";
import Image from 'next/image';

import { VideoCardProps } from '@/types';

dayjs.extend(relativeTime);

const VideoCard: React.FC<VideoCardProps> = ({ video, onDownload }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [previewError, setPreviewError] = useState(false);

    const getCldUrl = (publicId: string, type: 'thumbnail' | 'full' | 'preview') => {
        const options = type === 'thumbnail'
            ? { width: 400, height: 225, crop: "fill" as 'fill', gravity: "auto", format: "jpg", quality: "auto", assetType: "video" }
            : type === 'full'
                ? { width: 1920, height: 1080, assetType: "video" }
                : { width: 400, height: 225, rawTransformations: ["e_preview:duration_15:max_seg_9:min_seg_dur_1"], assetType: "video" };
        if (type === 'thumbnail') {
            return getCldImageUrl({ src: publicId, ...options });
        }
        return getCldVideoUrl({ src: publicId, ...options });
    };

    const formatSize = (size: number) => filesize(size);
    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    const compressionPercentage = Math.round((1 - Number(video.compressedSize) / Number(video.originalSize)) * 100);
    useEffect(() => {
        setPreviewError(false);
    }, [isHovered]);

    return (
        <div
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <figure className="aspect-video relative">
                {isHovered && !previewError ? (
                    <video
                        src={getCldUrl(video.publicId, 'preview')}
                        autoPlay
                        muted
                        loop
                        className="w-full h-full object-cover"
                        onError={() => setPreviewError(true)}
                    />
                ) : previewError ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <p className="text-red-500">Preview not available</p>
                    </div>
                ) : (
                    <Image
                        src={getCldUrl(video.publicId, 'thumbnail')}
                        alt={video.title}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute bottom-2 right-2 bg-base-100 bg-opacity-70 px-2 py-1 rounded-lg text-sm flex items-center">
                    <Clock size={16} className="mr-1" />
                    {formatDuration(video.duration)}
                </div>
            </figure>
            <div className="card-body p-4">
                <h2 className="card-title text-lg font-bold">{video.title}</h2>
                <p className="text-sm text-base-content opacity-70 mb-4">
                    {video.description}
                </p>
                <p className="text-sm text-base-content opacity-70 mb-4">
                    Uploaded {dayjs(video.createdAt).fromNow()}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                        <FileUp size={18} className="mr-2 text-primary" />
                        <div>
                            <div className="font-semibold">Original</div>
                            <div>{formatSize(Number(video.originalSize))}</div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <FileDown size={18} className="mr-2 text-secondary" />
                        <div>
                            <div className="font-semibold">Compressed</div>
                            <div>{formatSize(Number(video.compressedSize))}</div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm font-semibold">
                        Compression:{" "}
                        <span className="text-accent">{compressionPercentage}%</span>
                    </div>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                            onDownload(getCldUrl(video.publicId, 'full'), video.title)
                        }
                    >
                        <Download size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoCard;