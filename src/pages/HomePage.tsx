import { useState } from 'react';

import CoupleCard from '../components/CoupleCard';

export default function HomePage({ user, couples, myVotes, onVote, loading }) {
    const [filter, setFilter] = useState<'friends' | 'people'>('friends');

    if (loading) return <div>Chargement…</div>;

    const visibleCouples = couples.filter((c) => c.category === filter);

    return (
        <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
            {/* 👇 Ton sélecteur d’onglets ici */}
            <div className="flex border-b mb-6">
                {['friends', 'people'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat as 'friends' | 'people')}
                        className={`flex-1 py-2 text-center text-sm font-medium border-b-2 transition
                            ${
                                filter === cat
                                    ? 'border-pink-500 text-pink-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {cat === 'friends' ? '👫 Potes' : '🌟 People'}
                    </button>
                ))}
            </div>

            {/* 👇 Liste des couples filtrés */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {visibleCouples.map((c) => (
                    <CoupleCard
                        key={c.id}
                        couple={c}
                        user={user}
                        myChoice={myVotes[c.id]}
                        onVote={onVote}
                        onlyMyVotes={false}
                    />
                ))}
            </div>
        </main>
    );
}
