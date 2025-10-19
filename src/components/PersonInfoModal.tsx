import React, { useEffect, useState } from 'react';

export default function PersonInfoModal({ name, onClose }: { name: string; onClose: () => void }) {
    const [loading, setLoading] = useState(true);
    const [info, setInfo] = useState<any>(null);

    useEffect(() => {
        if (!name) return;

        const fetchInfo = async () => {
            try {
                const res = await fetch(
                    `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
                );
                if (!res.ok) throw new Error("Pas d'info trouvée");
                const data = await res.json();
                setInfo({
                    title: data.title,
                    summary: data.extract,
                    image: data.thumbnail?.source,
                    source: data.content_urls?.desktop?.page,
                });
            } catch (e) {
                setInfo(null);
            } finally {
                setLoading(false);
            }
        };

        fetchInfo();
    }, [name]);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>

                {loading ? (
                    <p className="text-center">Chargement...</p>
                ) : info ? (
                    <div className="flex flex-col items-center text-center">
                        {info.image && (
                            <img
                                src={info.image}
                                alt={info.title}
                                className="w-48 h-48 rounded-full mb-3 object-cover"
                            />
                        )}
                        <h2 className="text-lg font-semibold">{info.title}</h2>
                        <p className="text-sm text-gray-600 mb-2">
                            {info.summary.slice(0, 200)}...
                        </p>
                        <a
                            href={info.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-500 text-sm underline"
                        >
                            Voir sur Wikipédia
                        </a>
                    </div>
                ) : (
                    <p className="text-center text-gray-500">Aucune information trouvée 😅</p>
                )}
            </div>
        </div>
    );
}
