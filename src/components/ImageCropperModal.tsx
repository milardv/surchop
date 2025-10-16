import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

interface Props {
    imageSrc: string;
    onCancel: () => void;
    onCrop: (blob: Blob) => void;
}

export default function ImageCropperModal({ imageSrc, onCancel, onCrop }: Props) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onCropComplete = useCallback((_croppedArea, pixels) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const getCroppedImage = async () => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const { width, height, x, y } = croppedAreaPixels;

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

        canvas.toBlob((blob) => {
            if (blob) onCrop(blob);
        }, 'image/jpeg');
    };

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const img = new Image();
            img.addEventListener('load', () => resolve(img));
            img.addEventListener('error', (e) => reject(e));
            img.crossOrigin = 'anonymous'; // permet de recadrer des images en URL
            img.src = url;
        });

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-2xl w-80 sm:w-96 flex flex-col items-center shadow-lg">
                <div className="relative w-64 h-64 bg-gray-100 rounded-full overflow-hidden">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>

                {/* slider de zoom fluide */}
                <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full mt-4 accent-pink-500"
                />

                <div className="flex gap-3 mt-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={getCroppedImage}
                        className="px-4 py-2 text-sm bg-pink-500 text-white rounded hover:bg-pink-600"
                    >
                        Valider
                    </button>
                </div>
            </div>
        </div>
    );
}
