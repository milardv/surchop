import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';

import { CoupleView } from '../models/models';
import CoupleCard from '../components/CoupleCard/CoupleCard';
import SurchopeFooter from '../components/SurchopeFooter';

export default function PlayModePage({
    couples,
    user,
    myVotes,
    onVote,
}: {
    couples: CoupleView[];
    user: any;
    myVotes: Record<string, 'A' | 'B' | 'tie'>;
    onVote: (c: CoupleView, choice: 'A' | 'B' | 'tie') => void;
}) {
    const navigate = useNavigate();

    // 🔍 Couples non votés uniquement
    const couplesToPlay = useMemo(() => couples.filter((c) => !myVotes[c.id]), [couples, myVotes]);

    const [index, setIndex] = useState(0);
    const [finished, setFinished] = useState(false);

    const nextCouple = () => {
        if (index < couplesToPlay.length - 1) {
            setIndex(index + 1);
        } else {
            setFinished(true);
        }
    };

    const handleVote = (couple: CoupleView, choice: 'A' | 'B' | 'tie') => {
        onVote(couple, choice);
        setTimeout(nextCouple, 400);
    };

    // 🎉 Déclenche les confettis quand on a fini
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

    // 💫 Si terminé ou rien à jouer
    if (finished || couplesToPlay.length === 0) {
        return (
            <main className="max-w-md mx-auto px-4 py-12 flex flex-col items-center justify-center text-center space-y-6">
                <h1 className="text-3xl font-semibold text-pink-600">🎉 Bravo !</h1>
                <p className="text-gray-700 leading-relaxed">
                    Tu as voté pour tous les couples disponibles 💘 Reviens bientôt, de nouveaux
                    duos t’attendent !
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-medium shadow-sm transition"
                >
                    ⬅️ Retour à l’accueil
                </button>

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
    }

    const couple = couplesToPlay[index];

    return (
        <main className="max-w-md mx-auto px-4 py-6 flex flex-col items-center justify-center gap-6">
            <div className="flex justify-between w-full items-center">
                <button
                    onClick={() => navigate('/')}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                >
                    ⬅️ Quitter
                </button>
                <div className="text-sm text-gray-400">
                    {index + 1}/{couplesToPlay.length}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={couple?.id}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
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
