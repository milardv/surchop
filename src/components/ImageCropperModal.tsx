import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

import Button from '@/components/ui/Button';

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 w-80 sm:w-96 flex flex-col items-center shadow-lg animate-fadeIn">
                {/* 🖼️ Zone de recadrage */}
                <div className="relative w-64 h-64 bg-muted rounded-full overflow-hidden border border-border">
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

                {/* 🔍 Slider de zoom */}
                <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full mt-5 accent-[hsl(var(--primary))] cursor-pointer"
                />

                {/* 🩷 Boutons d’action */}
                <div className="flex gap-3 mt-5">
                    <Button
                        onClick={onCancel}
                        variant="outline"
                        size="sm"
                        disabled={cropping}
                        className="rounded-full"
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={getCroppedImage}
                        variant="primary"
                        size="sm"
                        disabled={cropping}
                        className={`rounded-full ${
                            cropping ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                    >
                        {cropping ? 'Recadrage...' : 'Valider 💘'}
                    </Button>
                </div>

                {/* ⚠️ Message d’erreur */}
                {error && <p className="text-destructive text-xs mt-3 text-center">{error}</p>}
            </div>
        </div>
    );
}
