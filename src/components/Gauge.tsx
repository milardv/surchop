import React, { useEffect, useState } from 'react';

import { CoupleView } from '../models/models';

export default function Gauge({ couple }: { couple: CoupleView }) {
    const [animatedPct, setAnimatedPct] = useState(0);

    const aVotes = couple.countA || 0;
    const bVotes = couple.countB || 0;
    const total = Math.max(1, aVotes + bVotes);

    const pctA = (aVotes / total) * 100;
    const pctB = (bVotes / total) * 100;

    const isAWinner = aVotes > bVotes;
    const isBWinner = bVotes > aVotes;
    const winnerPct = Math.max(pctA, pctB);

    // Animation fluide
    useEffect(() => {
        const start = animatedPct;
        const end = winnerPct;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (time: number) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.cos((progress * Math.PI) / 2);
            setAnimatedPct(start + (end - start) * eased);
            if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, [winnerPct]);

    return (
        <div className="w-full mt-3 select-none">
            {/* 🌈 Barre principale */}
            <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden shadow-inner">
                <div
                    className={`absolute top-0 bottom-0 bg-primary transition-all duration-300 ease-out rounded-full`}
                    style={{
                        width: `${animatedPct}%`,
                        left: isAWinner ? 0 : undefined,
                        right: isBWinner ? 0 : undefined,
                    }}
                />
            </div>

            {/* 🩷 Résumé */}
            <div className="text-xs mt-2 text-center text-muted-foreground">
                {aVotes === bVotes ? (
                    <span className="italic">Égalité parfaite 😳</span>
                ) : (
                    <>
                        <span className="font-semibold text-primary">
                            {isAWinner ? couple.personA.display_name : couple.personB.display_name}
                        </span>{' '}
                        surchope à{' '}
                        <span className="text-foreground font-medium">
                            {Math.round(winnerPct)} %
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}
