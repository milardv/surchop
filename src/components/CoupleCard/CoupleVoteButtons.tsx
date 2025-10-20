import { useState } from 'react';

import { CoupleView } from '../../models/models';

export default function CoupleVoteButtons({
    couple,
    user,
    canVote,
    myChoice,
    onVote,
}: {
    couple: CoupleView;
    user: any;
    canVote: boolean;
    myChoice?: 'A' | 'B' | 'tie';
    onVote?: (c: CoupleView, choice: 'A' | 'B' | 'tie') => void;
}) {
    const [voted, setVoted] = useState<'A' | 'B' | 'tie' | null>(null);

    const handleVote = (choice: 'A' | 'B' | 'tie') => {
        if (!canVote || !onVote) return;
        setVoted(choice);
        onVote(couple, choice);
        setTimeout(() => setVoted(null), 700); // animation temporaire
    };

    const baseClasses =
        'px-3 py-2 rounded border font-medium transition-transform duration-300 ease-out active:scale-95';
    const disabledClasses = !canVote ? 'opacity-60 cursor-not-allowed' : '';

    const getAnimationClasses = (choice: 'A' | 'B' | 'tie') => {
        if (voted !== choice) return '';
        return choice === 'tie'
            ? 'animate-pulse bg-blue-50 border-blue-500 text-blue-600'
            : 'animate-[pop_0.4s_ease-out] bg-pink-100 border-pink-500 text-pink-600 shadow-md';
    };

    return (
        <>
            {/* Définition de l’animation "pop" */}
            <style>
                {`
          @keyframes pop {
            0% { transform: scale(1); }
            50% { transform: scale(1.12); }
            100% { transform: scale(1); }
          }
        `}
            </style>

            <div className="mt-4 flex flex-col gap-2">
                <div className="flex gap-2">
                    {/* Personne A */}
                    <button
                        disabled={!canVote}
                        onClick={() => handleVote('A')}
                        className={`${baseClasses} flex-1 ${
                            myChoice === 'A'
                                ? 'bg-pink-50 border-pink-500 text-pink-600'
                                : 'hover:bg-gray-50'
                        } ${getAnimationClasses('A')} ${disabledClasses}`}
                    >
                        {couple.personA.display_name} surchope
                    </button>

                    {/* Personne B */}
                    <button
                        disabled={!canVote}
                        onClick={() => handleVote('B')}
                        className={`${baseClasses} flex-1 ${
                            myChoice === 'B'
                                ? 'bg-pink-50 border-pink-500 text-pink-600'
                                : 'hover:bg-gray-50'
                        } ${getAnimationClasses('B')} ${disabledClasses}`}
                    >
                        {couple.personB.display_name} surchope
                    </button>
                </div>

                {/* Égalité parfaite */}
                <button
                    disabled={!canVote}
                    onClick={() => handleVote('tie')}
                    className={`${baseClasses} text-sm ${
                        myChoice === 'tie'
                            ? 'bg-blue-50 border-blue-500 text-blue-600'
                            : 'hover:bg-gray-50 text-gray-600'
                    } ${getAnimationClasses('tie')} ${disabledClasses}`}
                >
                    ⚖️ Égalité parfaite
                </button>
            </div>
        </>
    );
}
