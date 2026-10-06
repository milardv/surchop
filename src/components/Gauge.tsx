import { Couple } from '../models/models';

export default function Gauge({ couple }: { couple: Couple }) {
    const aVotes = couple.count_a ?? 0;
    const bVotes = couple.count_b ?? 0;
    const tieVotes = couple.count_tie ?? 0;
    const total = aVotes + bVotes + tieVotes;
    const pctA = total ? (aVotes / total) * 100 : 0;
    const pctB = total ? (bVotes / total) * 100 : 0;
    const pctTie = total ? (tieVotes / total) * 100 : 0;
    const isAWinner = aVotes > bVotes;

    return (
        <div className="mt-3 w-full select-none" aria-label={`${total} votes au total`}>
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold uppercase tracking-wide">Avis de la communauté</span>
                <span className="rounded-full bg-muted px-2.5 py-1 font-bold text-foreground">
                    {total} {total > 1 ? 'votes' : 'vote'}
                </span>
            </div>
            <div
                className="flex h-3 overflow-hidden rounded-full bg-muted shadow-inner"
                role="img"
                aria-label={`${aVotes} votes pour ${couple.personA?.display_name}, ${bVotes} pour ${couple.personB?.display_name}, ${tieVotes} égalités`}
            >
                <div
                    className="bg-primary transition-[width] duration-200 ease-out"
                    style={{ width: `${pctA}%` }}
                />
                <div
                    className="bg-amber-300 transition-[width] duration-200 ease-out"
                    style={{ width: `${pctTie}%` }}
                />
                <div
                    className="bg-violet-500 transition-[width] duration-200 ease-out"
                    style={{ width: `${pctB}%` }}
                />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1 text-center">
                <div className="rounded-xl bg-primary/5 px-1.5 py-2 text-primary">
                    <div className="truncate text-[11px] font-medium">
                        {couple.personA?.display_name}
                    </div>
                    <div className="text-sm font-extrabold">
                        {aVotes}{' '}
                        <span className="text-[10px] font-semibold">({Math.round(pctA)}%)</span>
                    </div>
                </div>
                <div className="rounded-xl bg-amber-50 px-1.5 py-2 text-amber-700">
                    <div className="text-[11px] font-medium">Égalité</div>
                    <div className="text-sm font-extrabold">
                        {tieVotes}{' '}
                        <span className="text-[10px] font-semibold">({Math.round(pctTie)}%)</span>
                    </div>
                </div>
                <div className="rounded-xl bg-violet-50 px-1.5 py-2 text-violet-700">
                    <div className="truncate text-[11px] font-medium">
                        {couple.personB?.display_name}
                    </div>
                    <div className="text-sm font-extrabold">
                        {bVotes}{' '}
                        <span className="text-[10px] font-semibold">({Math.round(pctB)}%)</span>
                    </div>
                </div>
            </div>
            {total > 0 && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                    {aVotes === bVotes
                        ? 'Match nul, le public hésite 😳'
                        : `${isAWinner ? couple.personA?.display_name : couple.personB?.display_name} mène le classement 💘`}
                </p>
            )}
        </div>
    );
}
