import React, { useEffect, useState } from 'react';

import { CoupleView } from '../models/models';

export default function Gauge({ couple }: { couple: CoupleView }) {
    const [animatedA, setAnimatedA] = useState(0);
    const [animatedB, setAnimatedB] = useState(0);
    const [hovered, setHovered] = useState<'A' | 'B' | null>(null);

    const aVotes = couple.countA || 0;
    const bVotes = couple.countB || 0;
    const total = Math.max(1, aVotes + bVotes);
    const pctA = (aVotes / total) * 100;
    const pctB = (bVotes / total) * 100;

    const winner =
        aVotes > bVotes
            ? { name: couple.personA.display_name, pct: pctA, color: 'text-primary' }
            : bVotes > aVotes
              ? { name: couple.personB.display_name, pct: pctB, color: 'text-accent-foreground' }
              : null;

    // ⚡ Animation fluide
    useEffect(() => {
        const startA = animatedA;
        const startB = animatedB;
        const endA = pctA;
        const endB = pctB;
        const duration = 1100;
        const startTime = performance.now();

        const animate = (time: number) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.cos((progress * Math.PI) / 2);
            setAnimatedA(startA + (endA - startA) * eased);
            setAnimatedB(startB + (endB - startB) * eased);
            if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, [pctA, pctB]);

    return (
        <div className="w-full mt-3 select-none">
            {/* 🌈 Barre principale */}
            <div className="relative w-full h-4 bg-muted rounded-full overflow-visible shadow-inner">
                {/* Barre A */}
                {aVotes > 0 && (
                    <div
                        className={`absolute left-0 top-0 bottom-0 rounded-l-full transition-all duration-300 ease-out ${
                            hovered === 'A' ? 'scale-y-150 shadow-md' : 'scale-y-100'
                        } ${bVotes === 0 ? 'rounded-r-full' : ''}`}
                        style={{
                            width: `${animatedA}%`,
                            background: 'hsl(var(--primary))',
                            transformOrigin: 'bottom',
                            zIndex: 2,
                        }}
                        onMouseEnter={() => setHovered('A')}
                        onMouseLeave={() => setHovered(null)}
                        onTouchStart={() => setHovered('A')}
                        onTouchEnd={() => setHovered(null)}
                    >
                        {hovered === 'A' && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-primary bg-background border border-border rounded-full px-2 py-0.5 shadow-md whitespace-nowrap z-20 scale-y-75">
                                {aVotes} votes
                            </div>
                        )}
                    </div>
                )}

                {/* Barre B */}
                {bVotes > 0 && (
                    <div
                        className={`absolute right-0 top-0 bottom-0 rounded-r-full transition-all duration-300 ease-out ${
                            hovered === 'B' ? 'scale-y-150 shadow-md' : 'scale-y-100'
                        } ${aVotes === 0 ? 'rounded-l-full' : ''}`}
                        style={{
                            width: `${animatedB}%`,
                            background: 'hsl(var(--secondary))',
                            transformOrigin: 'bottom',
                            zIndex: 1,
                        }}
                        onMouseEnter={() => setHovered('B')}
                        onMouseLeave={() => setHovered(null)}
                        onTouchStart={() => setHovered('B')}
                        onTouchEnd={() => setHovered(null)}
                    >
                        {hovered === 'B' && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-secondary bg-background border border-border rounded-full px-2 py-0.5 shadow-md whitespace-nowrap z-20 scale-y-75">
                                {bVotes} votes
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 🩷 Résumé */}
            <div className="text-xs mt-2 text-center text-muted-foreground">
                {winner ? (
                    <>
                        <span className={`font-semibold ${winner.color}`}>{winner.name}</span>{' '}
                        surchope à{' '}
                        <span className="text-foreground font-medium">
                            {Math.round(winner.pct)} %
                        </span>
                    </>
                ) : (
                    <span className="text-muted-foreground italic">Égalité parfaite 😳</span>
                )}
            </div>
        </div>
    );
}
