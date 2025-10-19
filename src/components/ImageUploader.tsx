import React, { useState } from 'react';
import { Camera } from 'lucide-react';

import ImageCropperModal from './ImageCropperModal';

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
        <div>
            {/* zone drag & drop + preview */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                className={`relative w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition ${
                    dragOver ? 'border-pink-400 bg-pink-50' : 'border-gray-300 bg-gray-100'
                }`}
            >
                {file || imageUrl ? (
                    <img
                        src={file ? URL.createObjectURL(file) : imageUrl}
                        alt="Aperçu"
                        className="object-cover w-full h-full rounded-full"
                    />
                ) : (
                    <Camera className="text-gray-400 w-10 h-10" />
                )}

                <label
                    htmlFor={`${label}-file`}
                    className="absolute bottom-1 mb-2 bg-pink-500 text-white text-xs px-2 py-1 rounded cursor-pointer shadow hover:bg-pink-600 transition"
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

            {/* champ URL */}
            <div className="flex gap-2 items-center mt-3">
                <input
                    type="text"
                    placeholder="Ou coller une URL d’image"
                    value={imageUrl}
                    onChange={(e) => onUrlChange(e.target.value)}
                    className="flex-1 border rounded p-2 text-sm"
                />
                <button
                    type="button"
                    onClick={handleUrlCrop}
                    disabled={!imageUrl}
                    className={`px-3 py-1.5 rounded text-sm text-white ${
                        imageUrl
                            ? 'bg-pink-500 hover:bg-pink-600'
                            : 'bg-gray-300 cursor-not-allowed'
                    }`}
                >
                    Recadrer
                </button>
            </div>

            {/* modale cropper */}
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
