import { Couple } from '../models/models';

export default function Gauge({ couple }: { couple: Couple }) {
    const aVotes = couple.count_a ?? 0;
    const bVotes = couple.count_b ?? 0;
    const tieVotes = couple.count_tie ?? 0;
    const total = aVotes + bVotes + tieVotes;
    const pctA = total ? (aVotes / total) * 100 : 0;
    const pctB = total ? (bVotes / total) * 100 : 0;
    const pctTie = total ? (tieVotes / total) * 100 : 0;
    return (
        <div className="w-full select-none" aria-label={`${total} votes au total`}>
            <div className="mb-2 flex items-end justify-between gap-2">
                <span className="text-xs font-bold text-muted-foreground">Le public a voté</span>
                <span className="font-display text-2xl font-extrabold leading-none tabular-nums text-foreground">
                    {total}{' '}
                    <span className="text-xs font-semibold">vote{total > 1 ? 's' : ''}</span>
                </span>
            </div>
            <div
                className="flex h-3 overflow-hidden rounded-full bg-muted"
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
                    className="bg-cyan-400 transition-[width] duration-200 ease-out"
                    style={{ width: `${pctB}%` }}
                />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="min-w-0">
                    <span className="mx-auto mb-1 block h-2 w-2 rounded-full bg-primary" />
                    <span className="block truncate font-semibold">
                        {couple.personA?.display_name}
                    </span>
                    <strong className="block text-base tabular-nums">
                        {aVotes}{' '}
                        <span className="text-[10px] font-medium text-muted-foreground">
                            {Math.round(pctA)}%
                        </span>
                    </strong>
                </div>
                <div className="min-w-0">
                    <span className="mx-auto mb-1 block h-2 w-2 rounded-full bg-amber-300" />
                    <span className="block truncate font-semibold">Égalité</span>
                    <strong className="block text-base tabular-nums">
                        {tieVotes}{' '}
                        <span className="text-[10px] font-medium text-muted-foreground">
                            {Math.round(pctTie)}%
                        </span>
                    </strong>
                </div>
                <div className="min-w-0">
                    <span className="mx-auto mb-1 block h-2 w-2 rounded-full bg-cyan-400" />
                    <span className="block truncate font-semibold">
                        {couple.personB?.display_name}
                    </span>
                    <strong className="block text-base tabular-nums">
                        {bVotes}{' '}
                        <span className="text-[10px] font-medium text-muted-foreground">
                            {Math.round(pctB)}%
                        </span>
                    </strong>
                </div>
            </div>
        </div>
    );
}
