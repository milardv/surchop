import React, { useCallback, useState } from 'react';
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

    type ImageSource = 'local' | 'direct' | 'proxy';
    type LoadedImage = {
        image: HTMLImageElement;
        source: ImageSource;
        cleanup?: () => void;
    };

    const onCropComplete = useCallback((_croppedArea, pixels) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const isRemoteHttpUrl = (url: string) => /^https?:\/\//i.test(url);
    const isCanvasSecurityError = (err: unknown) =>
        err instanceof DOMException && err.name === 'SecurityError';

    const loadImage = (src: string, withCrossOrigin = false): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const img = new Image();

            if (withCrossOrigin) {
                img.crossOrigin = 'anonymous';
            }

            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = src;
        });

    const createImageViaProxy = async (url: string): Promise<LoadedImage> => {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`Erreur proxy: ${res.status}`);

        const blob = await res.blob();
        const localUrl = URL.createObjectURL(blob);
        const image = await loadImage(localUrl);

        return {
            image,
            source: 'proxy',
            cleanup: () => URL.revokeObjectURL(localUrl),
        };
    };

    const createImage = async (
        url: string,
        strategy: 'auto' | 'proxy' = 'auto',
    ): Promise<LoadedImage> => {
        if (url.startsWith('data:') || url.startsWith('blob:') || !isRemoteHttpUrl(url)) {
            const image = await loadImage(url);
            return { image, source: 'local' };
        }

        if (strategy === 'proxy') {
            return createImageViaProxy(url);
        }

        try {
            const image = await loadImage(url, true);
            return { image, source: 'direct' };
        } catch {
            return createImageViaProxy(url);
        }
    };

    const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
        new Promise((resolve, reject) => {
            try {
                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Échec de la conversion en image.'));
                    },
                    'image/jpeg',
                    0.9,
                );
            } catch (err) {
                reject(err);
            }
        });

    const getCroppedImage = async () => {
        if (!croppedAreaPixels) {
            setError('Zone de recadrage non définie');
            return;
        }

        setCropping(true);
        setError(null);
        let cleanup: (() => void) | undefined;

        try {
            const loaded = await createImage(imageSrc);
            cleanup = loaded.cleanup;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Impossible d'obtenir le contexte du canvas");

            const { width, height, x, y } = croppedAreaPixels;
            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(loaded.image, x, y, width, height, 0, 0, width, height);

            let blob: Blob;
            try {
                blob = await canvasToBlob(canvas);
            } catch (err) {
                if (isCanvasSecurityError(err) && loaded.source === 'direct') {
                    cleanup?.();
                    cleanup = undefined;

                    const proxyLoaded = await createImage(imageSrc, 'proxy');
                    cleanup = proxyLoaded.cleanup;

                    ctx.clearRect(0, 0, width, height);
                    ctx.drawImage(proxyLoaded.image, x, y, width, height, 0, 0, width, height);
                    blob = await canvasToBlob(canvas);
                } else {
                    throw err;
                }
            }

            onCrop(blob);
            setCropping(false);
        } catch (err: any) {
            console.error('Erreur lors du recadrage :', err);
            if (err?.message?.includes('Erreur proxy: 413')) {
                setError(
                    "L'image est trop volumineuse pour le proxy. Essaie une URL plus légère ou télécharge l'image puis envoie le fichier.",
                );
            } else {
                setError(err.message || 'Erreur inconnue lors du recadrage.');
            }
            setCropping(false);
        } finally {
            cleanup?.();
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
                        restrictPosition={false} // 👈 permet de déplacer l'image librement
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>

                {/* 🔍 Slider de zoom */}
                <input
                    type="range"
                    min={0.1} // 👈 permet de zoomer très loin en arrière
                    max={10} // 👈 permet de zoomer très loin en avant
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
