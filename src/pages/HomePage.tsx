import { type ComponentType, useEffect, useMemo, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import { ArrowRight, CalendarHeart, Globe, Shuffle, Sparkles, Tag, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

import CoupleCard from '../components/CoupleCard/CoupleCard';
import ReferralInvite from '../components/ReferralInvite';
import VoteProgress from '../components/VoteProgress';
import SurchopeLoader from '../components/SurchopeLoader';

import useCategories from '@/hooks/useCategories';
import SearchBar from '@/components/ui/SearchBar';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Couple } from '@/models/models';

type CategoryFilterOption = {
    id: string;
    name: string;
    lucideId?: string;
};
const COUPLES_PAGE_SIZE = 12;

export default function HomePage({
    user,
    couples,
    myVotes,
    onVote,
    loading: initialLoading,
    votesLoaded,
    deleteCouple,
    referralCode,
    referralCount,
    referralTrackingReady,
}: {
    user: any;
    couples: Couple[];
    myVotes: Record<string, 'A' | 'B' | 'tie'>;
    // eslint-disable-next-line no-unused-vars -- ESLint's base rule misreads TypeScript callback signatures.
    onVote: (c: Couple, choice: 'A' | 'B' | 'tie') => void;
    loading: boolean;
    votesLoaded: boolean;
    // eslint-disable-next-line no-unused-vars -- ESLint's base rule misreads TypeScript callback signatures.
    deleteCouple?: (id: string, userUid: string) => void;
    referralCode: string;
    referralCount: number;
    referralTrackingReady: boolean | null;
}) {
    const { categories } = useCategories();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<string>('all');
    const [orderSeed] = useState(() => Math.random());
    const [voteOrderSnapshot, setVoteOrderSnapshot] = useState<Record<
        string,
        'A' | 'B' | 'tie'
    > | null>(null);
    const [visibleCount, setVisibleCount] = useState(COUPLES_PAGE_SIZE);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const coupleOfTheDay = useMemo(() => {
        if (couples.length === 0) return undefined;
        const today = new Date().toISOString().slice(0, 10);
        const hash = Array.from(today).reduce(
            (value, character) => value * 31 + character.charCodeAt(0),
            0,
        );
        const stableCouples = [...couples].sort((a, b) => a.id.localeCompare(b.id));
        return stableCouples[Math.abs(hash) % stableCouples.length];
    }, [couples]);

    const sortedCategories = useMemo(
        () =>
            [...categories].sort((a, b) =>
                a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }),
            ),
        [categories],
    );

    const filterOptions = useMemo<CategoryFilterOption[]>(
        () => [{ id: 'all', name: 'Tous' }, ...sortedCategories],
        [sortedCategories],
    );

    const selectedCategory = useMemo(
        () => filterOptions.find((category) => category.id === filter) ?? filterOptions[0],
        [filterOptions, filter],
    );

    const renderIcon = (lucideId?: string, className = 'w-[18px] h-[18px]') => {
        if (!lucideId) return <Tag className={className} />;
        const Icon = Icons[lucideId as keyof typeof Icons] as
            | ComponentType<{ className?: string }>
            | undefined;
        const Comp = Icon ?? Tag;
        return <Comp className={className} />;
    };

    useEffect(() => {
        if (filter === 'all') return;
        if (!sortedCategories.some((category) => category.id === filter)) {
            setFilter('all');
        }
    }, [filter, sortedCategories]);

    useEffect(() => {
        setVoteOrderSnapshot(null);
    }, [user?.uid]);

    useEffect(() => {
        if (voteOrderSnapshot) return;
        if (!votesLoaded || initialLoading) return;
        setVoteOrderSnapshot({ ...myVotes });
    }, [votesLoaded, initialLoading, myVotes, voteOrderSnapshot]);

    // 🔍 Filtrage par recherche texte
    const filteredCouples = useMemo(() => {
        const votesForOrdering = voteOrderSnapshot ?? myVotes;
        const q = searchQuery.trim().toLowerCase();
        const rank = (id: string) => {
            let hash = Math.floor(orderSeed * 0xffffffff);
            for (let index = 0; index < id.length; index += 1) {
                hash = Math.imul(hash ^ id.charCodeAt(index), 16777619);
            }
            return hash >>> 0;
        };

        return [...couples]
            .sort((a, b) => {
                const aVoted = !!votesForOrdering[a.id];
                const bVoted = !!votesForOrdering[b.id];
                if (aVoted !== bVoted) return aVoted ? 1 : -1;
                return rank(a.id) - rank(b.id);
            })
            .filter((c) => {
                if (filter === 'all') return true;
                return c.category?.id === filter;
            })
            .filter((c) =>
                q === ''
                    ? true
                    : `${c.personA?.display_name ?? ''} ${c.personB?.display_name ?? ''}`
                          .toLowerCase()
                          .includes(q),
            );
    }, [couples, myVotes, filter, searchQuery, voteOrderSnapshot, orderSeed]);

    const visibleCouples = useMemo(
        () => filteredCouples.slice(0, visibleCount),
        [filteredCouples, visibleCount],
    );
    const spotlightCouple =
        filteredCouples.find((couple) => !myVotes[couple.id]) ?? filteredCouples[0];
    const feedCouples = visibleCouples.filter((couple) => couple.id !== spotlightCouple?.id);
    const remainingCount = couples.filter((couple) => !myVotes[couple.id]).length;
    const hasMore = visibleCouples.length < filteredCouples.length;

    useEffect(() => {
        setVisibleCount(COUPLES_PAGE_SIZE);
    }, [filter, searchQuery, filteredCouples.length]);

    useEffect(() => {
        const node = loadMoreRef.current;
        if (!node || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (!entry?.isIntersecting) return;
                setVisibleCount((prev) =>
                    Math.min(prev + COUPLES_PAGE_SIZE, filteredCouples.length),
                );
            },
            {
                root: null,
                rootMargin: '300px 0px',
                threshold: 0.01,
            },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [filteredCouples.length, hasMore]);

    const handleVote = (couple: Couple, choice: 'A' | 'B' | 'tie') => {
        if (!voteOrderSnapshot) {
            setVoteOrderSnapshot({ ...myVotes });
        }
        onVote(couple, choice);
    };

    return (
        <main className="mx-auto max-w-6xl space-y-8 px-4 pb-24 pt-5 text-foreground sm:px-6 sm:pt-8">
            {initialLoading && couples.length === 0 ? (
                <SurchopeLoader />
            ) : (
                <>
                    <section className="home-stage px-5 py-5 sm:px-9 sm:py-10">
                        <div className="relative z-10 max-w-2xl">
                            <h1 className="stage-title max-w-xl text-[clamp(2.2rem,7vw,4.7rem)]">
                                Alors, qui surchope&nbsp;?
                            </h1>
                            <p className="mt-3 hidden max-w-md text-sm font-medium text-white/80 sm:block sm:text-base">
                                Un duel, trois choix. Vote et découvre ce que les autres en pensent.
                            </p>
                            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 sm:mt-5">
                                <span className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-white sm:rounded-full sm:bg-white/10 sm:px-4">
                                    <Shuffle size={17} /> {remainingCount} duo
                                    {remainingCount > 1 ? 's' : ''} à voir
                                </span>
                                <Link
                                    to="/jouer"
                                    className="stage-action bg-accent px-5 text-sm text-foreground"
                                >
                                    <Zap size={17} fill="currentColor" /> Mode rafale{' '}
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(290px,.8fr)]">
                        <section aria-labelledby="spotlight-title" className="min-w-0 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <h2 id="spotlight-title" className="section-title">
                                    À toi de jouer
                                </h2>
                                <span className="text-xs font-bold text-muted-foreground">
                                    {spotlightCouple && !myVotes[spotlightCouple.id]
                                        ? 'Nouveau duel'
                                        : 'À revoir'}
                                </span>
                            </div>
                            {spotlightCouple?.personA && spotlightCouple.personB ? (
                                <CoupleCard
                                    couple={spotlightCouple}
                                    user={user}
                                    myChoice={myVotes[spotlightCouple.id]}
                                    onVote={handleVote}
                                    onDelete={deleteCouple}
                                    spotlight
                                />
                            ) : (
                                <p className="rounded-2xl bg-white p-6 text-muted-foreground">
                                    Aucun duo pour le moment. Reviens bientôt !
                                </p>
                            )}
                        </section>

                        <aside className="space-y-4 lg:pt-11" aria-label="Défis et progression">
                            {votesLoaded && !initialLoading && (
                                <VoteProgress votes={Object.keys(myVotes).length} />
                            )}
                            <Link
                                to="/defi"
                                className="mission-surface group flex items-center justify-between gap-4 text-foreground transition-transform duration-150 active:scale-[.98]"
                            >
                                <span>
                                    <strong className="block font-display text-xl font-extrabold">
                                        Joue avec tes amis
                                    </strong>
                                    <span className="mt-1 block text-sm">
                                        Les mêmes duos, des avis parfois opposés.
                                    </span>
                                </span>
                                <ArrowRight className="shrink-0" size={22} />
                            </Link>
                            {coupleOfTheDay && (
                                <Link
                                    to={`/couple/${coupleOfTheDay.id}`}
                                    className="flex min-h-12 items-center justify-between gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-foreground"
                                >
                                    <span className="flex items-center gap-2">
                                        <CalendarHeart size={19} className="text-primary" /> Duo du
                                        jour
                                    </span>
                                    <ArrowRight size={17} />
                                </Link>
                            )}
                            {user?.uid === 'EuindCjjeTYx5ABLPCRWdflHy2c2' && (
                                <Link
                                    to="/valider-couples"
                                    className="flex min-h-12 items-center justify-between rounded-2xl bg-white px-4 text-sm font-bold text-secondary"
                                >
                                    Duos à valider <ArrowRight size={17} />
                                </Link>
                            )}
                        </aside>
                    </div>

                    {referralCode && (
                        <ReferralInvite
                            code={referralCode}
                            referralCount={referralCount}
                            trackingReady={referralTrackingReady}
                        />
                    )}

                    <section aria-labelledby="explore-title" className="space-y-4">
                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                            <div>
                                <h2 id="explore-title" className="section-title">
                                    Tous les duos
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Explore, vote et compare les scores.
                                </p>
                            </div>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                <Sparkles size={15} /> L’ordre change à chaque visite
                            </span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
                            <Select value={filter} onValueChange={setFilter}>
                                <SelectTrigger className="h-12 rounded-2xl border-border bg-white px-4 text-base font-semibold shadow-none">
                                    <div className="flex items-center gap-2">
                                        {selectedCategory?.id === 'all' ? (
                                            <Globe size={18} />
                                        ) : (
                                            renderIcon(selectedCategory?.lucideId)
                                        )}
                                        <span>{selectedCategory?.name ?? 'Tous'}</span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent
                                    position="popper"
                                    className="z-[80] rounded-xl border-border bg-white p-2 shadow-xl"
                                >
                                    {filterOptions.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={category.id}
                                            className="py-2"
                                        >
                                            <div className="flex items-center gap-2">
                                                {category.id === 'all' ? (
                                                    <Globe size={16} />
                                                ) : (
                                                    renderIcon(category.lucideId, 'w-4 h-4')
                                                )}
                                                <span>{category.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <SearchBar
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="Chercher un duo ou un prénom"
                                className="sm:w-full"
                            />
                        </div>
                        {filteredCouples.length === 0 ? (
                            <p className="rounded-2xl bg-white px-5 py-8 text-center text-muted-foreground">
                                Aucun duo trouvé. Essaie une autre recherche.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {feedCouples.map((couple) =>
                                    couple.personA && couple.personB ? (
                                        <CoupleCard
                                            key={couple.id}
                                            couple={couple}
                                            user={user}
                                            myChoice={myVotes[couple.id]}
                                            onVote={handleVote}
                                            onDelete={deleteCouple}
                                        />
                                    ) : null,
                                )}
                                {hasMore && (
                                    <div
                                        ref={loadMoreRef}
                                        className="col-span-full flex justify-center py-6 text-sm text-muted-foreground"
                                    >
                                        Chargement de plus de duos…
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                </>
            )}
        </main>
    );
}
