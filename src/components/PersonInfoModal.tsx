import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

import SurchopeLoader from '@/components/SurchopeLoader';

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
            } catch {
                setInfo(null);
            } finally {
                setLoading(false);
            }
        };

        fetchInfo();
    }, [name]);

    return (
        <AnimatePresence>
            <motion.div
                key="backdrop"
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    key="modal"
                    className="bg-card text-card-foreground border border-border rounded-2xl p-6 max-w-sm w-full shadow-lg relative overflow-hidden animate-fadeIn"
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ✖️ Bouton de fermeture */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2"
                        title="Fermer"
                    >
                        <X size={18} />
                    </button>

                    {/* Contenu */}
                    <div className="min-h-[250px] flex flex-col items-center justify-center text-center">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loader"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <SurchopeLoader />
                                </motion.div>
                            ) : info ? (
                                <motion.div
                                    key="content"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col items-center text-center"
                                >
                                    {info.image && (
                                        <img
                                            src={info.image}
                                            alt={info.title}
                                            className="max-w-full max-h-64 rounded-lg mb-3 object-contain border border-border"
                                        />
                                    )}
                                    <h2 className="text-lg font-semibold text-primary mb-1">
                                        {info.title}
                                    </h2>
                                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                                        {info.summary.slice(0, 200)}...
                                    </p>
                                    <a
                                        href={info.source}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:text-primary/80 text-sm font-medium underline underline-offset-2 transition"
                                    >
                                        Voir sur Wikipédia
                                    </a>
                                </motion.div>
                            ) : (
                                <motion.p
                                    key="noinfo"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center text-muted-foreground"
                                >
                                    Aucune information trouvée 😅
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
