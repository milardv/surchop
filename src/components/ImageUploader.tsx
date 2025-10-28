import React, { useState } from 'react';
import { Camera } from 'lucide-react';

import ImageCropperModal from './ImageCropperModal';

import Button from '@/components/ui/Button';

export default function ImageUploader({
    label,
    imageUrl,
    file,
    onFileChange,
    onUrlChange,
}: {
    label: string;
    imageUrl: string;
    file: File | null;
    onFileChange: (file: File | null) => void;
    onUrlChange: (url: string) => void;
}) {
    const [dragOver, setDragOver] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

    const handleFile = (f: File) => {
        const reader = new FileReader();
        reader.onload = (e) => setCropImageSrc(e.target?.result as string);
        reader.readAsDataURL(f);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) handleFile(f);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handleFile(f);
    };

    const handleCrop = (croppedBlob: Blob) => {
        const croppedFile = new File([croppedBlob], 'cropped.jpg', { type: 'image/jpeg' });
        onFileChange(croppedFile);
        setCropImageSrc(null);
    };

    const handleUrlCrop = async () => {
        if (imageUrl) {
            setCropImageSrc(imageUrl);
        }
    };

    return (
        <div className="space-y-3">
            {/* 🖼️ Zone drag & drop + aperçu */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                className={`relative w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-all duration-200 ${
                    dragOver
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-muted hover:bg-muted/80'
                }`}
            >
                {file || imageUrl ? (
                    <img
                        src={file ? URL.createObjectURL(file) : imageUrl}
                        alt="Aperçu"
                        className="object-cover w-full h-full rounded-full border border-border shadow-sm"
                    />
                ) : (
                    <Camera className="text-muted-foreground w-10 h-10" />
                )}

                <label
                    htmlFor={`${label}-file`}
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full cursor-pointer shadow hover:opacity-90 transition"
                >
                    {file || imageUrl ? 'Changer' : 'Choisir'}
                </label>
                <input
                    id={`${label}-file`}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {/* 🌐 Champ URL */}
            <div className="flex gap-2 items-center">
                <input
                    type="text"
                    placeholder="Ou coller une URL d’image"
                    value={imageUrl}
                    onChange={(e) => onUrlChange(e.target.value)}
                    className="flex-1 bg-background border border-border rounded-full px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2 transition"
                />
                <Button
                    type="button"
                    onClick={handleUrlCrop}
                    disabled={!imageUrl}
                    variant={imageUrl ? 'primary' : 'outline'}
                    size="sm"
                    className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                        !imageUrl ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                >
                    Recadrer
                </Button>
            </div>

            {/* ✂️ Modale cropper */}
            {cropImageSrc && (
                <ImageCropperModal
                    imageSrc={cropImageSrc}
                    onCancel={() => setCropImageSrc(null)}
                    onCrop={handleCrop}
                />
            )}
        </div>
    );
}
