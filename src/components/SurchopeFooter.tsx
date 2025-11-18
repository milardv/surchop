import React from 'react';

export default function SurchopeFooter() {
    return (
        <footer className="mt-14 py-8 border-t border-gray-200 text-center text-sm text-gray-500">
            {/* Phrase fun */}
            <p className="italic mb-4 text-gray-600">
                “Surchoper” : être en couple avec quelqu’un d’un peu trop canon pour soi 😏
            </p>

            {/* Liens */}
            <div className="flex items-center justify-center gap-4 text-xs">
                <a href="/faq" className="underline hover:text-pink-600 transition-colors">
                    FAQ
                </a>

                <span className="text-gray-400">•</span>

                <a
                    href="/confidentialite"
                    className="underline hover:text-pink-600 transition-colors"
                >
                    Politique de confidentialité
                </a>
            </div>

            {/* Baseline */}
            <p className="mt-6 text-[11px] text-gray-400">Fait avec amour, aucun jugement 😇</p>
        </footer>
    );
}
