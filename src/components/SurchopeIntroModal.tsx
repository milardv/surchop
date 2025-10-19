import React from 'react';

export default function SurchopeIntroModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 text-center shadow-lg animate-fadeIn">
                <h2 className="text-xl font-semibold text-pink-600 mb-3">
                    Bienvenue sur Surchope 💘
                </h2>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">
                    Ici, on <span className="font-semibold text-pink-500">surchope</span> 💘 : c’est
                    quand on est en couple avec quelqu’un de plus attractif que soi — celui ou celle
                    qui a un peu trop bien réussi son coup 😏
                    <br />
                    Tout ça avec humour et bienveillance 💬
                </p>
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm rounded-full shadow-sm transition"
                >
                    J’ai compris 💘
                </button>
            </div>
        </div>
    );
}
