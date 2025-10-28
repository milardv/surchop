import React from 'react';

import Button from './Button';

export default function Modal({
    title,
    children,
    onClose,
}: {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card text-card-foreground rounded-2xl shadow-lg max-w-sm w-full p-6 animate-fadeIn border border-border">
                <h2 className="text-lg font-semibold text-primary mb-3 text-center">{title}</h2>
                <div className="text-muted-foreground text-sm mb-5 text-center">{children}</div>
                <div className="flex justify-center">
                    <Button variant="primary" size="sm" onClick={onClose}>
                        Fermer
                    </Button>
                </div>
            </div>
        </div>
    );
}
