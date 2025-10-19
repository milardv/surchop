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
    const [cropping, setCropping] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onCropComplete = useCallback((_croppedArea, pixels) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const createImage = async (url: string): Promise<HTMLImageElement> => {
        if (url.startsWith('data:') || url.startsWith('blob:')) {
            return loadImage(url);
        }

        // 🔁 Proxy CORS public (corsproxy.io)
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;

        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`Erreur proxy: ${res.status}`);

        const blob = await res.blob();
        const localUrl = URL.createObjectURL(blob);
        return loadImage(localUrl);
    };

    const loadImage = (src: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = src;
        });

    /** Fonction principale de recadrage */
    const getCroppedImage = async () => {
        if (!croppedAreaPixels) {
            setError('Zone de recadrage non définie');
            return;
        }

        setCropping(true);
        setError(null);

        try {
            const image = await createImage(imageSrc);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Impossible d'obtenir le contexte du canvas");

            const { width, height, x, y } = croppedAreaPixels;
            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    setCropping(false);
                    if (blob) onCrop(blob);
                    else setError('Échec de la conversion en image.');
                },
                'image/jpeg',
                0.9,
            );
        } catch (err: any) {
            console.error('Erreur lors du recadrage :', err);
            setError(err.message || 'Erreur inconnue lors du recadrage.');
            setCropping(false);
        }
    };

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

                {/* Slider de zoom fluide */}
                <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full mt-4 accent-pink-500"
                />

                {/* Boutons */}
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={onCancel}
                        disabled={cropping}
                        className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={getCroppedImage}
                        disabled={cropping}
                        className={`px-4 py-2 text-sm rounded text-white ${
                            cropping
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-pink-500 hover:bg-pink-600'
                        }`}
                    >
                        {cropping ? 'Recadrage...' : 'Valider'}
                    </button>
                </div>

                {/* Message d'erreur */}
                {error && <p className="text-red-600 text-xs mt-3">{error}</p>}
            </div>
        </div>
    );
}
