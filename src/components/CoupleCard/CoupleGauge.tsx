import Gauge from '../Gauge';

import { Couple } from '@/models/models';

export default function CoupleGauge({
    couple,
    myChoice,
    onlyMyVotes,
    revealResultsAfterVote,
    onSelectPerson,
}: {
    couple: Couple;
    myChoice?: 'A' | 'B' | 'tie';
    onlyMyVotes: boolean;
    revealResultsAfterVote?: boolean;
    // eslint-disable-next-line no-unused-vars -- ESLint's base rule misreads TypeScript callback signatures.
    onSelectPerson: (...args: [string]) => void;
}) {
    const renderPerson = (
        person: { display_name: string; image_url?: string },
        index: 'A' | 'B',
    ) => {
        const colorClass =
            index === 'A'
                ? 'ring-primary bg-primary/25 text-primary'
                : 'ring-secondary bg-secondary/25 text-secondary';

        return (
            <button
                key={index}
                type="button"
                aria-label={`En savoir plus sur ${person.display_name}`}
                className="group relative flex cursor-pointer flex-col items-center gap-2 rounded-2xl text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                onClick={() => onSelectPerson(person.display_name)}
            >
                <div
                    className={`pointer-events-none absolute inset-1 rounded-full blur-xl opacity-50 ${colorClass}`}
                />

                <div className="relative flex items-center justify-center">
                    <div
                        className="person-avatar relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-muted shadow-lg ring-4 ring-white transition-transform duration-150 ease-out group-active:scale-[0.97] md:h-40 md:w-40"
                        style={{ zIndex: 1 }}
                    >
                        {person?.image_url ? (
                            <img
                                src={person.image_url}
                                alt={person?.display_name}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <span className="text-lg font-semibold text-muted-foreground">
                                {person?.display_name[0]}
                            </span>
                        )}
                    </div>
                </div>

                <div className="font-medium text-base text-center transition-colors duration-200">
                    {person?.display_name}
                </div>
            </button>
        );
    };

    const resultText =
        myChoice === 'A'
            ? `${couple.personA?.display_name} surchope 💘`
            : myChoice === 'B'
              ? `${couple.personB?.display_name} surchope 💘`
              : 'égalité parfaite 😳';

    return (
        <>
            <div className="flex-1 flex items-center justify-center gap-4 relative">
                {renderPerson(couple.personA, 'A')}
                <span className="text-muted-foreground text-lg font-semibold select-none">vs</span>
                {renderPerson(couple.personB, 'B')}
            </div>

            <div className="w-[70%] mt-3 mx-auto">
                {onlyMyVotes ? (
                    <div className="text-xs text-center text-muted-foreground italic">
                        Pour toi, <span className="text-primary font-medium">{resultText}</span>
                    </div>
                ) : revealResultsAfterVote && !myChoice ? (
                    <div className="rounded-xl bg-muted/70 px-3 py-2 text-center text-xs font-medium text-muted-foreground">
                        Vote pour découvrir la tendance
                    </div>
                ) : (
                    <Gauge couple={couple} />
                )}
            </div>
        </>
    );
}
