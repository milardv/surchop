import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react'; // 🎵 jolie icône play minimaliste

import CoupleCard from '../components/CoupleCard/CoupleCard';
import SurchopeIntroModal from '../components/SurchopeIntroModal';
import SurchopeLoader from '../components/SurchopeLoader';
import SurchopeFooter from '../components/SurchopeFooter';

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
    const [query, setQuery] = useState('');
    const [showIntro, setShowIntro] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const alreadySeen = localStorage.getItem('surchope_intro_seen');
        if (!alreadySeen) {
            setShowIntro(true);
            localStorage.setItem('surchope_intro_seen', 'true');
        }
    }, []);

    if (loading) return <SurchopeLoader />;

    const filteredCouples = couples
        .filter((c) =>
            query.trim() === ''
                ? true
                : `${c.personA.display_name} ${c.personB.display_name}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
        )
        .sort((a, b) => {
            const aVoted = !!myVotes[a.id];
            const bVoted = !!myVotes[b.id];
            if (aVoted === bVoted) return 0;
            return aVoted ? 1 : -1;
        });

    return (
        <main className="max-w-5xl mx-auto px-4 py-6 space-y-6 relative">
            {showIntro && <SurchopeIntroModal onClose={() => setShowIntro(false)} />}

            {/* 🔍 Barre de recherche */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <input
                    type="text"
                    placeholder="🔍 Rechercher un couple ou un prénom..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full sm:w-80 border rounded-full px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
            </div>

            {/* 🔎 Liste des couples */}
            {filteredCouples.length === 0 ? (
                <p className="text-center text-gray-500 mt-6">Aucun couple trouvé.</p>
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

            <SurchopeFooter />

            {/* 🎮 Bouton flottant “Play” */}
            <button
                onClick={() => navigate('/jouer')}
                className="fixed bottom-6 right-6 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg p-4 transition transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-pink-300"
                title="Jouer"
            >
                <Play size={32} fill="white" className="ml-0.5" />
            </button>
        </main>
    );
}
