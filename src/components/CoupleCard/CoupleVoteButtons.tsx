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
        { choice: 'tie' as const, label: 'Égalité', Icon: Scale },
        { choice: 'B' as const, label: couple.personB?.display_name ?? 'B', Icon: Heart },
    ];

    return (
        <div className="mt-4 w-full">
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {myChoice ? 'Ton verdict' : 'À toi de choisir'}
            </p>
            <div className="flex w-full gap-2">
                {options.map(({ choice, label, Icon }) => {
                    const selected = myChoice === choice;
                    const tie = choice === 'tie';
                    return (
                        <button
                            key={choice}
                            type="button"
                            onClick={() => onVote?.(couple, choice)}
                            disabled={!onVote}
                            aria-pressed={selected}
                            className={`flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-2xl border px-2 py-2 text-center text-xs font-semibold transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm ${
                                selected
                                    ? tie
                                        ? 'border-amber-300 bg-amber-50 text-amber-800 shadow-sm'
                                        : 'border-primary/40 bg-primary/10 text-primary shadow-sm'
                                    : 'border-border bg-background text-foreground hover:border-primary/30 hover:bg-primary/5'
                            }`}
                        >
                            {selected ? <Check size={15} /> : <Icon size={15} />}
                            <span className="truncate">{label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
