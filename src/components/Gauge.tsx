import React, { useEffect, useState } from 'react';

import { CoupleView } from '../models/models';

export default function Gauge({ couple }: { couple: CoupleView }) {
    const [animatedValue, setAnimatedValue] = useState(0);
    const aVotes = couple.countA || 0;
    const bVotes = couple.countB || 0;
    const total = Math.max(1, aVotes + bVotes);
    const pctA = Math.round((aVotes / total) * 100);

    // Animation fluide à chaque changement
    useEffect(() => {
        const start = animatedValue;
        const end = pctA;
        const duration = 600; // en ms
        const startTime = performance.now();

        const animate = (time: number) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = Math.sin((progress * Math.PI) / 2); // effet spring
            const current = start + (end - start) * eased;
            setAnimatedValue(current);
            if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, [pctA]); // se rejoue à chaque changement de votes

    return (
        <div className="w-full mt-1">
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden relative">
                {/* Barre rose animée */}
                <div
                    className="absolute left-0 top-0 h-full bg-pink-500 transition-all duration-300"
                    style={{ width: `${animatedValue}%` }}
                />
            </div>

            <div className="text-xs mt-1 text-gray-600 text-center">
                {aVotes} vs {bVotes} • {aVotes + bVotes} vote{aVotes + bVotes > 1 ? 's' : ''}
            </div>
        </div>
    );
}
