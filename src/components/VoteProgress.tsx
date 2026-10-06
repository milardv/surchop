import { BadgeCheck, Heart, Medal, Shield, Sparkles, Trophy } from 'lucide-react';

const BADGES = [
    { votes: 1, name: 'Déclic', Icon: Heart },
    { votes: 5, name: 'Cupidon', Icon: Sparkles },
    { votes: 10, name: 'Entremetteur', Icon: BadgeCheck },
    { votes: 25, name: 'Expert', Icon: Shield },
    { votes: 50, name: 'Légende', Icon: Trophy },
];

export default function VoteProgress({
    votes,
    compact = false,
}: {
    votes: number;
    compact?: boolean;
}) {
    const nextBadge = BADGES.find((badge) => votes < badge.votes);
    const previousThreshold =
        [...BADGES].reverse().find((badge) => votes >= badge.votes)?.votes ?? 0;
    const progress = nextBadge
        ? Math.min(100, ((votes - previousThreshold) / (nextBadge.votes - previousThreshold)) * 100)
        : 100;
    const earned = BADGES.filter((badge) => votes >= badge.votes).length;
    const CurrentIcon = earned ? BADGES[earned - 1].Icon : Medal;

    return (
        <section
            aria-label="Progression et badges de vote"
            className={`rounded-2xl border border-pink-200/70 bg-white ${compact ? 'p-3' : 'p-4 sm:p-5'}`}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pink-100 text-primary">
                        <CurrentIcon size={21} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-bold text-gray-900">
                            {earned ? BADGES[earned - 1].name : 'À toi de jouer'}
                        </h2>
                        <p className="text-xs text-gray-600">
                            {nextBadge
                                ? `${nextBadge.votes - votes} vote${nextBadge.votes - votes > 1 ? 's' : ''} avant le badge ${nextBadge.name}`
                                : 'Tous les badges sont à toi !'}
                        </p>
                    </div>
                </div>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-gray-600">
                    {votes} vote{votes > 1 ? 's' : ''}
                </span>
            </div>

            <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-pink-100"
                role="progressbar"
                aria-label="Progression vers le prochain badge"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
            >
                <div
                    className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {!compact && (
                <ul
                    className="mt-3 flex gap-2 overflow-x-auto pb-1"
                    aria-label="Collection de badges"
                >
                    {BADGES.map(({ votes: threshold, name, Icon }) => {
                        const unlocked = votes >= threshold;
                        return (
                            <li
                                key={name}
                                aria-label={`${name}, ${unlocked ? 'débloqué' : `à ${threshold} votes`}`}
                                className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold ${unlocked ? 'bg-pink-50 text-primary' : 'bg-gray-50 text-gray-400'}`}
                            >
                                <Icon size={13} aria-hidden="true" />
                                {name}
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
