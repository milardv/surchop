import Gauge from '../Gauge';

import { Couple } from '@/models/models';

export default function CoupleGauge({
    couple,
    onSelectPerson,
}: {
    couple: Couple;
    // eslint-disable-next-line no-unused-vars -- ESLint's base rule misreads TypeScript callback signatures.
    onSelectPerson: (...args: [string]) => void;
}) {
    const renderPerson = (
        person: { display_name: string; image_url?: string },
        index: 'A' | 'B',
    ) => {
        return (
            <button
                key={index}
                type="button"
                aria-label={`En savoir plus sur ${person.display_name}`}
                className="duel-person"
                onClick={() => onSelectPerson(person.display_name)}
            >
                <div className="duel-avatar">
                    {person?.image_url ? (
                        <img
                            src={person.image_url}
                            alt={person?.display_name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <span className="text-4xl font-bold text-foreground/70">
                            {person?.display_name?.[0] ?? '?'}
                        </span>
                    )}
                </div>

                <div className="duel-name">{person?.display_name}</div>
            </button>
        );
    };

    return (
        <div className="duel-people">
            {renderPerson(couple.personA, 'A')}
            <span className="duel-vs" aria-hidden="true">
                VS
            </span>
            {renderPerson(couple.personB, 'B')}
        </div>
    );
}

export function CoupleResults({
    couple,
    myChoice,
    onlyMyVotes,
    revealResultsAfterVote,
}: {
    couple: Couple;
    myChoice?: 'A' | 'B' | 'tie';
    onlyMyVotes: boolean;
    revealResultsAfterVote?: boolean;
}) {
    const resultText =
        myChoice === 'A'
            ? `${couple.personA?.display_name} surchope 💘`
            : myChoice === 'B'
              ? `${couple.personB?.display_name} surchope 💘`
              : 'égalité parfaite 😳';

    return (
        <div className="duel-result">
            {onlyMyVotes ? (
                <div>
                    <p className="mb-3 text-center text-sm font-semibold text-secondary">
                        Ton choix : {resultText}
                    </p>
                    <Gauge couple={couple} />
                </div>
            ) : revealResultsAfterVote && !myChoice ? (
                <div className="rounded-xl bg-muted px-3 py-2 text-center text-sm font-semibold text-muted-foreground">
                    Vote pour découvrir la tendance
                </div>
            ) : (
                <Gauge couple={couple} />
            )}
        </div>
    );
}
