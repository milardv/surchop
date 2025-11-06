import { useEffect, useState, useMemo } from 'react';

import CoupleCard from '../components/CoupleCard/CoupleCard';
import SurchopeIntroModal from '../components/SurchopeIntroModal';
import SurchopeLoader from '../components/SurchopeLoader';
import SurchopeFooter from '../components/SurchopeFooter';

import SearchBar from '@/components/ui/SearchBar';

export default function HomePage({
    user,
    couples,
    myVotes,
    onVote,
    loading,
    deleteCouple,
}: {
    user: any;
    couples: any[];
    myVotes: Record<string, 'A' | 'B' | 'tie'>;
    onVote: (c: any, choice: 'A' | 'B' | 'tie') => void;
    loading: boolean;
    deleteCouple?: (id: string, userUid: string) => void;
}) {
    // Tous les hooks ici
    const [query, setQuery] = useState('');
    const [showIntro, setShowIntro] = useState(false);
    const [orderedCouples, setOrderedCouples] = useState<any[]>([]);

    // Tri initial : non votés d'abord, exécuté une seule fois
    useEffect(() => {
        // 🟢 Si c’est le premier chargement → tri initial
        if (orderedCouples.length === 0 && couples.length > 0) {
            const sorted = [...couples].sort((a, b) => {
                const aVoted = !!myVotes[a.id];
                const bVoted = !!myVotes[b.id];
                if (aVoted === bVoted) return 0;
                return aVoted ? 1 : -1; // non votés d’abord
            });
            setOrderedCouples(sorted);
            return;
        }

        // 🟣 Si couples change après le premier tri
        if (orderedCouples.length > 0 && couples.length > 0) {
            setOrderedCouples((prev) => {
                const next = [...prev];

                // ✅ Mettre à jour ou ajouter les couples modifiés
                couples.forEach((updated) => {
                    const existingIndex = next.findIndex((c) => c.id === updated.id);

                    if (existingIndex !== -1) {
                        // On remplace seulement les données du couple modifié
                        next[existingIndex] = { ...next[existingIndex], ...updated };
                    } else {
                        // Nouveau couple → on l’ajoute à la fin
                        next.push(updated);
                    }
                });

                // ✅ Supprimer les couples disparus
                return next.filter((c) => couples.some((updated) => updated.id === c.id));
            });
        }
    }, [couples, myVotes]);

    useEffect(() => {
        const alreadySeen = localStorage.getItem('surchope_intro_seen');
        if (!alreadySeen) {
            setShowIntro(true);
            localStorage.setItem('surchope_intro_seen', 'true');
        }
    }, []);

    // Même si loading=true, ce hook doit s’exécuter
    const filteredCouples = useMemo(() => {
        const q = query.trim().toLowerCase();
        return orderedCouples.filter((c) =>
            q === ''
                ? true
                : `${c.personA.display_name} ${c.personB.display_name}`.toLowerCase().includes(q),
        );
    }, [orderedCouples, query]);

    // ✅ plus de "return" conditionnel : on affiche le loader dans le JSX
    return (
        <main className="max-w-5xl mx-auto px-4 py-6 space-y-6 relative text-foreground">
            {showIntro && <SurchopeIntroModal onClose={() => setShowIntro(false)} />}

            {loading ? (
                <SurchopeLoader />
            ) : (
                <>
                    {/* 🔍 Barre de recherche */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                        <SearchBar
                            value={query}
                            onChange={setQuery}
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
                            {filteredCouples.map((c) => (
                                <CoupleCard
                                    key={c.id}
                                    couple={c}
                                    user={user}
                                    myChoice={myVotes[c.id]}
                                    onVote={onVote}
                                    onlyMyVotes={false}
                                    onDelete={deleteCouple}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            <SurchopeFooter />
        </main>
    );
}
