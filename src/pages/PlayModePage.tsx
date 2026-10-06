import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';

import CoupleCard from '../components/CoupleCard/CoupleCard';
import SurchopeFooter from '../components/SurchopeFooter';
import VoteProgress from '../components/VoteProgress';

import { Couple } from '@/models/models';
import BackButton from '@/components/ui/BackButton';

export default function PlayModePage({
    couples,
    user,
    myVotes,
    onVote,
}: {
    couples: Couple[];
    user: any;
    myVotes: Record<string, 'A' | 'B' | 'tie'>;
    // eslint-disable-next-line no-unused-vars -- ESLint's base rule misreads TypeScript callback signatures.
    onVote: (c: Couple, choice: 'A' | 'B' | 'tie') => void;
}) {
    const [couplesToPlay] = useState(() => couples.filter((c) => !myVotes[c.id]));
    const [index, setIndex] = useState(0);
    const [finished, setFinished] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [voteDirection, setVoteDirection] = useState<'left' | 'right' | 'down' | null>(null);

    const nextCouple = () => {
        if (index + 1 < couplesToPlay.length) setIndex((i) => i + 1);
        else setFinished(true);
        setVoteDirection(null);
    };

    const handleVote = (couple: Couple, choice: 'A' | 'B' | 'tie') => {
        if (isAnimating) return;
        setIsAnimating(true);
        onVote(couple, choice);

        if (choice === 'A') setVoteDirection('left');
        else if (choice === 'B') setVoteDirection('right');
        else setVoteDirection('down');

        setTimeout(() => {
            nextCouple();
            setIsAnimating(false);
        }, 400);
    };

    useEffect(() => {
        if (finished || couplesToPlay.length === 0) {
            confetti({
                particleCount: 120,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ec4899', '#f472b6', '#fde68a'],
            });
        }
    }, [finished, couplesToPlay.length]);

    const couple = couplesToPlay[index];

    if (finished || couplesToPlay.length === 0)
        return (
            <main className="max-w-md mx-auto px-4 py-12 flex flex-col items-center justify-center text-center space-y-6">
                <h1 className="text-3xl font-extrabold text-primary drop-shadow-sm">🎉 Bravo !</h1>
                <p className="text-muted-foreground leading-relaxed">
                    Tu as voté pour tous les couples disponibles 💘 <br />
                    Reviens bientôt, de nouveaux duos t’attendent !
                </p>

                <div className="w-full text-left">
                    <VoteProgress votes={Object.keys(myVotes).length} />
                </div>

                <BackButton to="/" label="Retour à la liste" />

                <motion.div
                    className="mt-8 text-4xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    💞
                </motion.div>

                <SurchopeFooter />
            </main>
        );

    const exitVariants = {
        left: { opacity: 0, x: -200, rotate: -10 },
        right: { opacity: 0, x: 200, rotate: 10 },
        down: { opacity: 0, y: 100, scale: 0.9 },
        none: { opacity: 0, x: 0 },
    };

    return (
        <main className="max-w-md mx-auto px-4 py-6 flex flex-col items-center justify-center gap-6">
            {/* Header */}
            <div className="flex justify-between w-full items-center">
                <BackButton to="/" label="Retour à la liste" />
                <div className="text-sm text-muted-foreground">
                    {index + 1}/{couplesToPlay.length}
                </div>
            </div>

            <div className="w-full space-y-3">
                <div>
                    <div className="mb-1.5 flex justify-between text-xs font-semibold text-gray-600">
                        <span>Défi express</span>
                        <span className="tabular-nums">
                            {index}/{couplesToPlay.length} duos votés
                        </span>
                    </div>
                    <div
                        className="h-2 overflow-hidden rounded-full bg-pink-100"
                        role="progressbar"
                        aria-label="Progression du défi express"
                        aria-valuemin={0}
                        aria-valuemax={couplesToPlay.length}
                        aria-valuenow={index}
                    >
                        <div
                            className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
                            style={{ width: `${(index / couplesToPlay.length) * 100}%` }}
                        />
                    </div>
                </div>
                <VoteProgress votes={Object.keys(myVotes).length} compact />
            </div>

            {/* Titre */}
            <h2 className="text-xl font-extrabold text-center text-primary mt-2 tracking-wide">
                💞 Qui surchope ?
            </h2>

            {/* Couple */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={couple?.id}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={exitVariants[voteDirection ?? 'none']}
                    transition={{ duration: 0.4 }}
                    className="w-full"
                >
                    {couple && (
                        <CoupleCard
                            couple={couple}
                            user={user}
                            onVote={handleVote}
                            compact={false}
                            onlyMyVotes={false}
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            <SurchopeFooter />
        </main>
    );
}
