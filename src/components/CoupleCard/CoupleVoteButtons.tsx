import { Check, Heart, Scale } from 'lucide-react';

import { Couple } from '../../models/models';

export default function CoupleVoteButtons({
    couple,
    myChoice,
    onVote,
}: {
    couple: Couple;
    myChoice?: 'A' | 'B' | 'tie';
    // eslint-disable-next-line no-unused-vars -- ESLint's base rule misreads TypeScript callback signatures.
    onVote?: (...args: [Couple, 'A' | 'B' | 'tie']) => void;
}) {
    const options = [
        { choice: 'A' as const, label: couple.personA?.display_name ?? 'A', Icon: Heart },
        { choice: 'B' as const, label: couple.personB?.display_name ?? 'B', Icon: Heart },
        { choice: 'tie' as const, label: 'Égalité, les deux !', Icon: Scale },
    ];

    return (
        <div className="w-full">
            <p className="mb-2 text-center text-sm font-bold text-foreground">
                {myChoice ? 'Ton choix est enregistré. Tu peux le changer.' : 'Qui surchope qui ?'}
            </p>
            <div className="vote-actions">
                {options.map(({ choice, label, Icon }) => {
                    const selected = myChoice === choice;
                    return (
                        <button
                            key={choice}
                            type="button"
                            onClick={() => onVote?.(couple, choice)}
                            disabled={!onVote}
                            aria-pressed={selected}
                            className={`vote-choice flex items-center justify-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60 ${choice === 'tie' ? 'vote-choice--tie' : ''}`}
                        >
                            {selected ? <Check size={15} /> : <Icon size={15} />}
                            <span className="min-w-0 line-clamp-2">{label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
