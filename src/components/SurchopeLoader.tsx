import React from 'react';

export default function SurchopeLoader() {
    return (
        <main className="flex flex-col items-center justify-center h-[80vh] text-pink-600">
            <div className="relative w-16 h-16 animate-pulse-heart">
                <div className="absolute inset-0 bg-pink-500 rotate-45 transform rounded-[8px]" />
                <div className="absolute w-16 h-16 bg-pink-500 rounded-full -top-4 left-0" />
                <div className="absolute w-16 h-16 bg-pink-500 rounded-full top-0 -left-4" />
            </div>
            <p className="mt-6 text-lg font-medium animate-fade-in">Ça surchope fort… 💘</p>
        </main>
    );
}
