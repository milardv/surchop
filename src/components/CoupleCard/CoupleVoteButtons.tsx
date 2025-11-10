import { useState } from 'react';

import { CoupleView } from '../../models/models';

export default function CoupleVoteButtons({
    couple,
    user,
    canVote,
    myChoice,
    onVote,
    onLoginClick, // 👈 nouveau
}: {
    couple: CoupleView;
    user: any;
    canVote: boolean;
    myChoice?: 'A' | 'B' | 'tie';
    onVote?: (c: CoupleView, choice: 'A' | 'B' | 'tie') => void;
    onLoginClick?: () => void; // 👈 callback optionnel
}) {
    const [voted, setVoted] = useState<'A' | 'B' | 'tie' | null>(null);
    const [showLoginHint, setShowLoginHint] = useState(false);

    const handleVote = (choice: 'A' | 'B' | 'tie') => {
        if (!canVote) {
            // 👇 petit feedback visuel si l’utilisateur n’est pas connecté
            setShowLoginHint(true);
            setTimeout(() => setShowLoginHint(false), 2000);
            return;
        }
        if (!onVote) return;
        setVoted(choice);
        onVote(couple, choice);
        setTimeout(() => setVoted(null), 700);
    };

    const baseClasses =
        'flex-1 px-3 py-2 rounded-full border font-medium text-sm transition-all duration-200 ease-out active:scale-95 text-center focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/50 focus:ring-offset-2';
    const disabledClasses = !canVote ? 'opacity-60 cursor-pointer' : ''; // 👈 cursor-pointer même désactivé

    const getAnimationClasses = (choice: 'A' | 'B' | 'tie') => {
        if (voted !== choice) return '';
        return choice === 'tie'
            ? 'animate-[pop_0.4s_ease-out] bg-secondary/10 border-secondary text-secondary'
            : 'animate-[pop_0.4s_ease-out] bg-primary/10 border-primary text-primary shadow-sm';
    };

    return (
        <>
            <style>
                {`
                @keyframes pop {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.12); }
                    100% { transform: scale(1); }
                }
            `}
            </style>

            <div className="mt-4 flex flex-col items-center gap-2 w-full">
                <div className="flex gap-3 justify-center w-full">
                    {['A', 'tie', 'B'].map((choice) => (
                        <button
                            key={choice}
                            onClick={() => handleVote(choice as 'A' | 'B' | 'tie')}
                            className={`${baseClasses} ${disabledClasses} ${
                                myChoice === choice
                                    ? choice === 'tie'
                                        ? 'bg-secondary/10 border-secondary text-secondary'
                                        : 'bg-primary/10 border-primary text-primary'
                                    : 'bg-background border-border text-foreground hover:bg-muted'
                            } ${getAnimationClasses(choice as any)}`}
                        >
                            {choice === 'A'
                                ? couple.personA?.display_name
                                : choice === 'B'
                                  ? couple.personB?.display_name
                                  : 'Égalité'}
                        </button>
                    ))}
                </div>

                {/* 🔐 Message clair si non connecté */}
                {showLoginHint && !user && (
                    <div className="text-sm text-primary mt-2 animate-pulse">
                        Connecte-toi pour voter ❤️
                    </div>
                )}

                {/* 🔘 Optionnel : bouton de connexion */}
                {!user && showLoginHint && onLoginClick && (
                    <button
                        onClick={onLoginClick}
                        className="mt-2 px-4 py-1.5 text-sm rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition"
                    >
                        Se connecter avec Google
                    </button>
                )}
            </div>
        </>
    );
}
