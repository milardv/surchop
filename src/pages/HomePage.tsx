import { type ComponentType, useEffect, useMemo, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import { Globe, Tag } from 'lucide-react';

import CoupleCard from '../components/CoupleCard/CoupleCard';
import SurchopeIntroModal from '../components/SurchopeIntroModal';
import SurchopeLoader from '../components/SurchopeLoader';
import SurchopeFooter from '../components/SurchopeFooter';

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
}: {
    user: any;
    couples: Couple[];
    myVotes: Record<string, 'A' | 'B' | 'tie'>;
    onVote: (c: Couple, choice: 'A' | 'B' | 'tie') => void;
    loading: boolean;
    votesLoaded: boolean;
    deleteCouple?: (id: string, userUid: string) => void;
}) {
    const { categories } = useCategories();
    const [searchQuery, setSearchQuery] = useState('');
    const [showIntro, setShowIntro] = useState(false);
    const [filter, setFilter] = useState<string>('all');
    const [voteOrderSnapshot, setVoteOrderSnapshot] = useState<Record<
        string,
        'A' | 'B' | 'tie'
    > | null>(null);
    const [visibleCount, setVisibleCount] = useState(COUPLES_PAGE_SIZE);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

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

    // 🧠 Gère le message d’intro
    useEffect(() => {
        const alreadySeen = localStorage.getItem('surchope_intro_seen');
        if (!alreadySeen) {
            setShowIntro(true);
            localStorage.setItem('surchope_intro_seen', 'true');
        }
    }, []);

    // 🔍 Filtrage par recherche texte
    const filteredCouples = useMemo(() => {
        const votesForOrdering = voteOrderSnapshot ?? myVotes;
        const q = searchQuery.trim().toLowerCase();
        return [...couples]
            .sort((a, b) => {
                const aVoted = !!votesForOrdering[a.id];
                const bVoted = !!votesForOrdering[b.id];
                if (aVoted === bVoted) return 0;
                return aVoted ? 1 : -1;
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
    }, [couples, myVotes, filter, searchQuery, voteOrderSnapshot]);

    const visibleCouples = useMemo(
        () => filteredCouples.slice(0, visibleCount),
        [filteredCouples, visibleCount],
    );
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

    return (
        <main className="max-w-5xl mx-auto px-4 py-6 space-y-6 relative text-foreground">
            {showIntro && <SurchopeIntroModal onClose={() => setShowIntro(false)} />}

            {initialLoading || !votesLoaded ? (
                <SurchopeLoader />
            ) : (
                <>
                    {/* 🧭 Barre de filtres */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                        <div className="w-full sm:w-[260px]">
                            <Select value={filter} onValueChange={setFilter}>
                                <SelectTrigger className="h-11 rounded-full border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
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
                                    className="z-[80] rounded-xl border border-gray-200 bg-white p-2 shadow-xl"
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
                        </div>

                        {/* 🔍 Barre de recherche */}
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Rechercher un couple ou un prénom..."
                        />
                    </div>
                    {/* 💑 Liste des couples */}
                    {filteredCouples.length === 0 ? (
                        <p className="text-center text-muted-foreground mt-6">
                            Aucun couple trouvé 😢
                        </p>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4 pb-24">
                            {visibleCouples.map((c) =>
                                c.personA && c.personB ? (
                                    <CoupleCard
                                        key={c.id}
                                        couple={c}
                                        user={user}
                                        myChoice={myVotes[c.id]}
                                        onVote={onVote}
                                        onlyMyVotes={false}
                                        onDelete={deleteCouple}
                                    />
                                ) : null,
                            )}
                            {hasMore && (
                                <div
                                    ref={loadMoreRef}
                                    className="sm:col-span-2 lg:col-span-2 flex justify-center py-6"
                                >
                                    <div className="text-sm text-muted-foreground animate-pulse">
                                        Chargement de plus de couples…
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            <SurchopeFooter />
        </main>
    );
}
