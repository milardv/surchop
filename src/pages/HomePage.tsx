import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { Globe, Heart, Sparkles } from 'lucide-react';

import { db } from '../firebase';
import CoupleCard from '../components/CoupleCard/CoupleCard';
import SurchopeIntroModal from '../components/SurchopeIntroModal';
import SurchopeLoader from '../components/SurchopeLoader';
import SurchopeFooter from '../components/SurchopeFooter';

import SearchBar from '@/components/ui/SearchBar';
import { Couple } from '@/models/models';

export default function HomePage({
    user,
    myVotes,
    onVote,
    loading: initialLoading,
    deleteCouple,
}: {
    user: any;
    couples: Couple[];
    myVotes: Record<string, 'A' | 'B' | 'tie'>;
    onVote: (c: Couple, choice: 'A' | 'B' | 'tie') => void;
    loading: boolean;
    deleteCouple?: (id: string, userUid: string) => void;
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showIntro, setShowIntro] = useState(false);
    const [orderedCouples, setOrderedCouples] = useState<any[]>([]);
    const [filter, setFilter] = useState<'all' | 'fictional' | 'real'>('all');
    const [loading, setLoading] = useState(initialLoading);

    useEffect(() => {
        const fetchCouples = async () => {
            setLoading(true);
            try {
                let q = query(collection(db, 'couples'), where('validated', '==', true));
                if (filter === 'fictional') {
                    q = query(q, where('isFictional', '==', true));
                } else if (filter === 'real') {
                    q = query(q, where('isFictional', '==', false));
                }

                const snapshot = await getDocs(q);

                // 🔁 Pour chaque couple, aller chercher les deux personnes associées
                const couples = await Promise.all(
                    snapshot.docs.map(async (docSnap) => {
                        let data = docSnap.data();
                        const [aSnap, bSnap] = await Promise.all([
                            getDoc(doc(db, 'people', data.people_a_id)),
                            getDoc(doc(db, 'people', data.people_b_id)),
                        ]);
                        console.log(data.count_a);
                        const personA = aSnap.exists() ? aSnap.data() : null;
                        personA.id = data.people_a_id;
                        const personB = bSnap.exists() ? bSnap.data() : null;
                        personB.id = data.people_b_id;
                        return {
                            id: docSnap.id,
                            ...data,
                            personA,
                            personB,
                        };
                    }),
                );

                // 🔍 Tri : non votés d’abord
                const sorted = [...couples].sort((a, b) => {
                    const aVoted = !!myVotes[a.id];
                    const bVoted = !!myVotes[b.id];
                    if (aVoted === bVoted) return 0;
                    return aVoted ? 1 : -1;
                });

                setOrderedCouples(sorted);
            } catch (e) {
                console.error('Erreur de chargement des couples :', e);
            } finally {
                setLoading(false);
            }
        };

        fetchCouples();
    }, [filter]);

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
        const q = searchQuery.trim().toLowerCase();
        return orderedCouples.filter((c) =>
            q === ''
                ? true
                : `${c.personA.display_name} ${c.personB.display_name}`.toLowerCase().includes(q),
        );
    }, [orderedCouples, searchQuery]);

    return (
        <main className="max-w-5xl mx-auto px-4 py-6 space-y-6 relative text-foreground">
            {showIntro && <SurchopeIntroModal onClose={() => setShowIntro(false)} />}

            {loading ? (
                <SurchopeLoader />
            ) : (
                <>
                    {/* 🧭 Barre de filtres */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                        <div className="flex gap-2 border border-gray-200 rounded-full p-1 bg-white/80 backdrop-blur-sm shadow-sm">
                            {[
                                { value: 'all', label: 'Tous', icon: <Globe size={18} /> },
                                {
                                    value: 'fictional',
                                    label: 'Fictifs',
                                    icon: <Sparkles size={18} />,
                                },
                                { value: 'real', label: 'Réels', icon: <Heart size={18} /> },
                            ].map((f) => {
                                const isActive = filter === f.value;
                                return (
                                    <button
                                        key={f.value}
                                        onClick={() => setFilter(f.value as any)}
                                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all
            ${
                isActive
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md scale-[1.05]'
                    : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
            }`}
                                    >
                                        <span
                                            className={`transition-transform ${
                                                isActive ? 'scale-110 drop-shadow-sm' : 'opacity-80'
                                            }`}
                                        >
                                            {f.icon}
                                        </span>
                                        <span>{f.label}</span>
                                    </button>
                                );
                            })}
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
                            {filteredCouples.map((c) =>
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
                        </div>
                    )}
                </>
            )}

            <SurchopeFooter />
        </main>
    );
}
