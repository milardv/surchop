import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowRight, Zap } from 'lucide-react';

import CoupleCard from '../components/CoupleCard/CoupleCard';
import VoteProgress from '../components/VoteProgress';
import SurchopeLoader from '../components/SurchopeLoader';

import { Couple } from '@/models/models';
import BackButton from '@/components/ui/BackButton';

export default function PlayModePage({
    couples,
    user,
    myVotes,
    onVote,
    loading,
}: {
    couples: Couple[];
    user: any;
    myVotes: Record<string, 'A' | 'B' | 'tie'>;
    // eslint-disable-next-line no-unused-vars -- ESLint's base rule misreads TypeScript callback signatures.
    onVote: (c: Couple, choice: 'A' | 'B' | 'tie') => void;
    loading: boolean;
}) {
    const [couplesToPlay, setCouplesToPlay] = useState<Couple[] | null>(null);
    const [index, setIndex] = useState(0);
    const [finished, setFinished] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [voteDirection, setVoteDirection] = useState<'left' | 'right' | 'down' | null>(null);
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        if (loading || couplesToPlay !== null) return;
        setCouplesToPlay(couples.filter((couple) => !myVotes[couple.id]));
    }, [loading, couples, myVotes, couplesToPlay]);

    const nextCouple = () => {
        if (couplesToPlay && index + 1 < couplesToPlay.length) setIndex((i) => i + 1);
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

        setTimeout(
            () => {
                nextCouple();
                setIsAnimating(false);
            },
            reduceMotion ? 0 : 220,
        );
    };

    useEffect(() => {
        if (finished && !reduceMotion) {
            confetti({
                particleCount: 65,
                spread: 60,
                origin: { y: 0.6 },
                colors: ['#ec397c', '#ffd370', '#7dd8dd'],
            });
        }
    }, [finished, reduceMotion]);

    if (loading || couplesToPlay === null) return <SurchopeLoader />;

    const couple = couplesToPlay[index];

    if (finished || couplesToPlay.length === 0)
        return (
            <main className="mx-auto flex max-w-xl flex-col items-center justify-center space-y-6 px-4 py-14 text-center">
                <span className="grid h-20 w-20 place-items-center rounded-[26px] bg-accent text-secondary">
                    <Zap size={38} fill="currentColor" />
                </span>
                <h1 className="stage-title text-4xl text-foreground">Bien joué !</h1>
                <p className="max-w-sm leading-relaxed text-muted-foreground">
                    {couplesToPlay.length === 0
                        ? 'Tous les duos disponibles ont déjà ton vote. Reviens bientôt !'
                        : 'Tu as terminé ta rafale. Tes choix sont enregistrés !'}
                </p>

                <div className="w-full text-left">
                    <VoteProgress votes={Object.keys(myVotes).length} />
                </div>

                <BackButton to="/" label="Retour à la liste" />
            </main>
        );

    const exitVariants = {
        left: { opacity: 0, x: -200, rotate: -10 },
        right: { opacity: 0, x: 200, rotate: 10 },
        down: { opacity: 0, y: 100, scale: 0.9 },
        none: { opacity: 0, x: 0 },
    };

    return (
        <main className="mx-auto flex max-w-xl flex-col items-center justify-center gap-5 px-4 pb-24 pt-5">
            {/* Header */}
            <div className="flex justify-between w-full items-center">
                <BackButton to="/" label="Retour à la liste" />
                <div className="text-sm text-muted-foreground">
                    {index + 1}/{couplesToPlay.length}
                </div>
            </div>

            <div className="w-full space-y-3 rounded-[22px] bg-secondary px-5 py-5 text-white">
                <div>
                    <div className="mb-2 flex justify-between text-sm font-bold">
                        <span className="flex items-center gap-1.5">
                            <Zap size={16} fill="currentColor" /> Mode rafale
                        </span>
                        <span className="tabular-nums">
                            {index}/{couplesToPlay.length} duos votés
                        </span>
                    </div>
                    <div
                        className="h-2 overflow-hidden rounded-full bg-white/20"
                        role="progressbar"
                        aria-label="Progression du défi express"
                        aria-valuemin={0}
                        aria-valuemax={couplesToPlay.length}
                        aria-valuenow={index}
                    >
                        <div
                            className="h-full rounded-full bg-accent transition-[width] duration-200 ease-out"
                            style={{ width: `${(index / couplesToPlay.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex w-full items-end justify-between gap-3">
                <div>
                    <h1 className="section-title">Qui surchope ?</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Choisis, découvre les scores, continue.
                    </p>
                </div>
                <ArrowRight size={22} className="text-primary" />
            </div>

            {/* Couple */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={couple?.id}
                    initial={reduceMotion ? false : { opacity: 0, transform: 'translateX(28px)' }}
                    animate={{ opacity: 1, transform: 'translateX(0px)' }}
                    exit={exitVariants[voteDirection ?? 'none']}
                    transition={{ duration: reduceMotion ? 0 : 0.2 }}
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

            <div className="w-full">
                <VoteProgress votes={Object.keys(myVotes).length} compact />
            </div>
        </main>
    );
}
