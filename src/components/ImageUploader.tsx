import React from "react";
import {Camera} from "lucide-react";

interface ImageUploaderProps {
    label: string;
    imageUrl: string;
    file: File | null;
    onFileChange: (file: File | null) => void;
    onUrlChange: (url: string) => void;
}

export default function ImageUploader({
                                          label,
                                          imageUrl,
                                          file,
                                          onFileChange,
                                          onUrlChange,
                                      }: ImageUploaderProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] ?? null;
        onFileChange(f);
    };

    const preview = file ? URL.createObjectURL(file) : imageUrl;

    return (
        <div>
            <div className="flex flex-col items-center gap-3">
                <div
                    className="relative w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                    {preview ? (
                        <img
                            src={preview}
                            alt="Aperçu"
                            className="object-cover w-full h-full rounded-full"
                        />
                    ) : (
                        <Camera className="text-gray-400 w-10 h-10"/>
                    )}
                    <label
                        htmlFor={`${label}-file`}
                        className="absolute bottom-1 mb-2 bg-pink-500 text-white text-xs px-2 py-1 rounded cursor-pointer shadow hover:bg-pink-600 transition"
                    >
                        {file || imageUrl ? "Changer" : "Choisir"}
                    </label>
                    <input
                        id={`${label}-file`}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                <input
                    type="text"
                    placeholder="Ou coller une URL d’image"
                    value={imageUrl}
                    onChange={(e) => onUrlChange(e.target.value)}
                    className="w-full border rounded p-2 text-sm"
                />
            </div>
        </div>
    );
}
