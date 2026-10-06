import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Copy, Share2, Sparkles } from 'lucide-react';

import CoupleCard from '@/components/CoupleCard/CoupleCard';
import ReferralInvite from '@/components/ReferralInvite';
import SurchopeLoader from '@/components/SurchopeLoader';
import { Couple } from '@/models/models';
import { shareLink } from '@/utils/shareLink';

type VoteChoice = 'A' | 'B' | 'tie';
type ChallengeResult = { playerId: string; choices: Record<string, VoteChoice> };
const MAX_CHALLENGE_COUPLES = 5;

function decodeResults(value: string | null): ChallengeResult[] {
    if (!value) return [];
    try {
        const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
        const binary = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='));
        const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
        const parsed = JSON.parse(new TextDecoder().decode(bytes));
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter(
                (item): item is ChallengeResult =>
                    typeof item?.playerId === 'string' &&
                    typeof item?.choices === 'object' &&
                    item.choices !== null &&
                    !Array.isArray(item.choices),
            )
            .slice(-20);
    } catch {
        return [];
    }
}

function encodeResults(results: ChallengeResult[]) {
    const bytes = new TextEncoder().encode(JSON.stringify(results));
    let binary = '';
    bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
    return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function playerStorageKey(ids: string[]) {
    return `surchope_challenge_player_${[...ids].sort().join('_')}`;
}

export default function FriendsChallengePage({
    couples,
    myVotes,
    user,
    loading,
    onVote,
    referralCode,
    referralCount,
    referralTrackingReady,
}: {
    couples: Couple[];
    myVotes: Record<string, VoteChoice>;
    user: any;
    loading: boolean;
    // eslint-disable-next-line no-unused-vars -- ESLint's base rule misreads TypeScript callback signatures.
    onVote: (couple: Couple, choice: VoteChoice) => void;
    referralCode: string;
    referralCount: number;
    referralTrackingReady: boolean | null;
}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const challengeIds = useMemo(
        () =>
            Array.from(new Set((searchParams.get('ids') ?? '').split(',').filter(Boolean))).slice(
                0,
                MAX_CHALLENGE_COUPLES,
            ),
        [searchParams],
    );
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const challengeCouples = challengeIds
        .map((id) => couples.find((couple) => couple.id === id))
        .filter((couple): couple is Couple => Boolean(couple));
    const results = decodeResults(searchParams.get('r'));
    const isChallenge = challengeIds.length >= 2;
    const completed = isChallenge && challengeIds.every((id) => Boolean(myVotes[id]));
    const filteredCouples = couples.filter((couple) =>
        `${couple.personA?.display_name ?? ''} ${couple.personB?.display_name ?? ''}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
    );

    const toggleCouple = (id: string) => {
        setSelectedIds((current) => {
            if (current.includes(id)) return current.filter((selected) => selected !== id);
            if (current.length >= MAX_CHALLENGE_COUPLES) return current;
            return [...current, id];
        });
    };

    const makeChallengeUrl = (ids: string[], challengeResults?: ChallengeResult[]) => {
        const url = new URL('/defi', window.location.origin);
        url.searchParams.set('ids', ids.join(','));
        if (challengeResults?.length) url.searchParams.set('r', encodeResults(challengeResults));
        if (referralCode) url.searchParams.set('ref', referralCode);
        return url.toString();
    };

    const shareChallenge = async () => {
        try {
            const result = await shareLink(
                makeChallengeUrl(
                    challengeIds.length ? challengeIds : selectedIds,
                    results.length ? results : undefined,
                ),
                'Défi Surchope',
                'On départage les mêmes duos ? À toi de jouer !',
            );
            setStatus(result === 'copied' ? 'Lien du défi copié.' : 'Défi prêt à être partagé.');
        } catch {
            setStatus('Impossible de partager le lien pour le moment.');
        }
    };

    const shareResults = async () => {
        const playerKey = playerStorageKey(challengeIds);
        let playerId = localStorage.getItem(playerKey);
        if (!playerId) {
            playerId = crypto.randomUUID();
            localStorage.setItem(playerKey, playerId);
        }
        const participation = {
            playerId,
            choices: Object.fromEntries(challengeIds.map((id) => [id, myVotes[id]])),
        } as ChallengeResult;
        const updatedResults = [
            ...results.filter((result) => result.playerId !== playerId),
            participation,
        ];
        try {
            const shareState = await shareLink(
                makeChallengeUrl(challengeIds, updatedResults),
                'Mon résultat Surchope',
                `J’ai terminé le défi avec ${challengeIds.length} duos. À ton tour !`,
            );
            setStatus(shareState === 'copied' ? 'Ton résultat a été copié.' : 'Résultat partagé.');
        } catch {
            setStatus('Impossible de partager le résultat pour le moment.');
        }
    };

    const clearChallenge = () => {
        setSearchParams({});
        setSelectedIds([]);
        setStatus('');
    };

    if (loading && couples.length === 0) return <SurchopeLoader />;

    if (!isChallenge) {
        return (
            <main className="mx-auto max-w-3xl space-y-5 px-4 pb-24 pt-6 text-foreground">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft size={16} /> Accueil
                </Link>
                <div className="home-stage p-6 sm:p-8">
                    <h1 className="stage-title max-w-xl text-3xl sm:text-5xl">
                        Les mêmes duos. Vos avis.
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                        Choisis entre 2 et 5 duos, puis partage le même défi. À la fin, comparez vos
                        choix et découvrez les tendances des autres votes.
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-extrabold text-foreground">
                        <Sparkles size={16} /> {selectedIds.length}/{MAX_CHALLENGE_COUPLES} duos
                        choisis
                    </div>
                </div>

                <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Chercher un duo"
                    aria-label="Chercher un duo à ajouter au défi"
                    className="h-12 w-full rounded-2xl border border-border bg-white px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                />
                <div className="max-h-[48vh] space-y-2 overflow-y-auto pr-1">
                    {filteredCouples.map((couple) => {
                        const selected = selectedIds.includes(couple.id);
                        const disabled = !selected && selectedIds.length >= MAX_CHALLENGE_COUPLES;
                        return (
                            <button
                                key={couple.id}
                                type="button"
                                aria-pressed={selected}
                                disabled={disabled}
                                onClick={() => toggleCouple(couple.id)}
                                className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border px-4 text-left transition-[background-color,border-color,transform] duration-150 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-50 ${selected ? 'border-primary/50 bg-[#fce8ee]' : 'border-border bg-white hover:border-primary/30'}`}
                            >
                                <span className="min-w-0 truncate text-sm font-semibold">
                                    {couple.personA?.display_name}{' '}
                                    <span className="text-muted-foreground">&</span>{' '}
                                    {couple.personB?.display_name}
                                </span>
                                <span
                                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${selected ? 'border-primary bg-primary text-white' : 'border-gray-300 text-transparent'}`}
                                >
                                    <Check size={14} />
                                </span>
                            </button>
                        );
                    })}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        disabled={selectedIds.length < 2}
                        onClick={() => setSearchParams({ ids: selectedIds.join(',') })}
                        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Lancer le défi <ArrowLeft className="rotate-180" size={16} />
                    </button>
                    {selectedIds.length >= 2 && (
                        <button
                            type="button"
                            onClick={shareChallenge}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-pink-200 bg-white px-5 text-sm font-bold text-primary hover:bg-pink-50"
                        >
                            <Share2 size={16} /> Inviter
                        </button>
                    )}
                </div>
                <ReferralInvite
                    code={referralCode}
                    referralCount={referralCount}
                    trackingReady={referralTrackingReady}
                />
                {status && (
                    <p role="status" className="text-center text-sm text-muted-foreground">
                        {status}
                    </p>
                )}
            </main>
        );
    }

    if (loading && challengeCouples.length < challengeIds.length) return <SurchopeLoader />;
    if (challengeCouples.length !== challengeIds.length) {
        return (
            <main className="mx-auto max-w-xl px-4 py-12 text-center">
                <h1 className="text-xl font-bold">Ce défi n’est plus disponible.</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Certains couples du lien ont été retirés ou ne sont plus accessibles.
                </p>
                <button
                    type="button"
                    onClick={clearChallenge}
                    className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white"
                >
                    Créer un autre défi
                </button>
            </main>
        );
    }

    const leadingChoice = (couple: Couple): VoteChoice => {
        const counts = [couple.count_a ?? 0, couple.count_tie ?? 0, couple.count_b ?? 0];
        return (['A', 'tie', 'B'] as const)[counts.indexOf(Math.max(...counts))];
    };
    const communityMatches = challengeIds.filter((id) => {
        const couple = challengeCouples.find((candidate) => candidate.id === id);
        return couple && myVotes[id] === leadingChoice(couple);
    }).length;

    return (
        <main className="mx-auto max-w-5xl space-y-5 px-4 pb-24 pt-6 text-foreground">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={clearChallenge}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft size={16} /> Changer de défi
                </button>
                <button
                    type="button"
                    onClick={shareChallenge}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-4 text-sm font-bold text-primary hover:bg-pink-100"
                >
                    <Share2 size={16} /> Inviter des amis
                </button>
            </div>
            <header className="home-stage p-6 sm:p-8">
                <h1 className="stage-title text-3xl sm:text-5xl">Les mêmes duos. Vos avis.</h1>
                <p className="mt-3 text-sm text-white/80">
                    {challengeIds.length} duos à départager · les tendances se dévoilent après ton
                    vote.
                </p>
            </header>

            {completed && (
                <section className="rounded-2xl border border-primary/20 bg-pink-50 p-4 sm:p-5">
                    <h2 className="font-bold text-gray-900">
                        Défi terminé : {communityMatches}/{challengeIds.length} choix suivent l’avis
                        du public.
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Partage ton résultat pour l’ajouter à la chaîne et comparer vos choix.
                    </p>
                    <button
                        type="button"
                        onClick={shareResults}
                        className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-white hover:bg-primary/90"
                    >
                        <Share2 size={15} /> Partager mon résultat
                    </button>
                </section>
            )}

            {results.length > 0 && (
                <section className="rounded-2xl border border-border bg-white p-4 sm:p-5">
                    <h2 className="font-bold text-gray-900">Résultats des amis</h2>
                    <p className="mt-1 text-xs text-gray-600">
                        Les choix sont transmis dans le lien partagé ; chaque participant peut le
                        faire suivre.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {results.map((result, index) => {
                            const matches = challengeIds.filter(
                                (id) => result.choices[id] === myVotes[id],
                            ).length;
                            return (
                                <span
                                    key={result.playerId}
                                    className="rounded-full bg-pink-50 px-3 py-1.5 text-xs font-semibold text-primary"
                                >
                                    Joueur {index + 1} ·{' '}
                                    {completed
                                        ? `${matches}/${challengeIds.length} choix en commun`
                                        : 'prêt à comparer'}
                                </span>
                            );
                        })}
                    </div>
                    {completed && (
                        <button
                            type="button"
                            onClick={shareResults}
                            className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-primary"
                        >
                            <Copy size={14} /> Mettre à jour le lien du groupe
                        </button>
                    )}
                </section>
            )}

            <div
                className={`grid gap-4 ${challengeCouples.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2'}`}
            >
                {challengeCouples.map((couple) => (
                    <CoupleCard
                        key={couple.id}
                        couple={couple}
                        user={user}
                        myChoice={myVotes[couple.id]}
                        onVote={onVote}
                        revealResultsAfterVote
                    />
                ))}
            </div>
            <ReferralInvite
                code={referralCode}
                referralCount={referralCount}
                trackingReady={referralTrackingReady}
            />
            {status && (
                <p role="status" className="text-center text-sm text-muted-foreground">
                    {status}
                </p>
            )}
        </main>
    );
}
