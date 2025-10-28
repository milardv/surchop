import React from 'react';

import Button from '@/components/ui/Button';

export default function SurchopeIntroModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 max-w-sm mx-4 text-center shadow-lg animate-fadeIn">
                <h2 className="text-xl font-semibold text-primary mb-3">
                    Bienvenue sur Surchope 💘
                </h2>

                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    Ici, on <span className="font-semibold text-primary">surchope</span> : c’est
                    quand on est en couple avec quelqu’un de plus attractif que soi — celui ou celle
                    qui a un peu trop bien réussi son coup 😏
                    <br />
                    Tout ça avec humour et bienveillance 💬
                </p>

                <Button onClick={onClose} variant="primary" size="sm" className="rounded-full px-5">
                    J’ai compris
                </Button>
            </div>
        </div>
    );
}
