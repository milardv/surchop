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
        setTimeout(() => setVoted(null), 700);
    };

    const baseClasses =
        'flex-1 px-3 py-2 rounded border font-medium text-sm transition-all duration-200 ease-out active:scale-95 text-center';
    const disabledClasses = !canVote ? 'opacity-60 cursor-not-allowed' : '';

    const getAnimationClasses = (choice: 'A' | 'B' | 'tie') => {
        if (voted !== choice) return '';
        return choice === 'tie'
            ? 'animate-pulse bg-blue-50 border-blue-500 text-blue-600'
            : 'animate-[pop_0.4s_ease-out] bg-pink-100 border-pink-500 text-pink-600 shadow-md';
    };

    return (
        <>
            {/* Animation "pop" */}
            <style>
                {`
        @keyframes pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
      `}
            </style>

            <div className="mt-4 flex gap-2 justify-center w-full">
                {/* A */}
                <button
                    disabled={!canVote}
                    onClick={() => handleVote('A')}
                    className={`${baseClasses} ${
                        myChoice === 'A'
                            ? 'bg-pink-50 border-pink-500 text-pink-600'
                            : 'hover:bg-gray-50 border-gray-300 text-gray-700'
                    } ${getAnimationClasses('A')} ${disabledClasses}`}
                >
                    {couple.personA.display_name}
                </button>

                {/* Égalité */}
                <button
                    disabled={!canVote}
                    onClick={() => handleVote('tie')}
                    className={`${baseClasses} max-w-[120px] ${
                        myChoice === 'tie'
                            ? 'bg-blue-50 border-blue-500 text-blue-600'
                            : 'hover:bg-gray-50 border-gray-300 text-gray-500'
                    } ${getAnimationClasses('tie')} ${disabledClasses}`}
                >
                    Égalité
                </button>

                {/* B */}
                <button
                    disabled={!canVote}
                    onClick={() => handleVote('B')}
                    className={`${baseClasses} ${
                        myChoice === 'B'
                            ? 'bg-pink-50 border-pink-500 text-pink-600'
                            : 'hover:bg-gray-50 border-gray-300 text-gray-700'
                    } ${getAnimationClasses('B')} ${disabledClasses}`}
                >
                    {couple.personB.display_name}
                </button>
            </div>
        </>
    );
}
