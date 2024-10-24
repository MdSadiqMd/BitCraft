export interface Video {
    id: string;
    title: string;
    description: string;
    publicId: string;
    originalSize: number;
    compressedSize: number;
    duration: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface VideoCardProps {
    video: Video;
    onDownload: (url: string, title: string) => void;
}