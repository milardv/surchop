import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';

import { db } from '../firebase';
import { CoupleView, VoteDoc, VoteView } from '../models/models';
import CoupleCard from '../components/CoupleCard';

export default function MyVotesPage({
    user,
    couples,
    votesAll,
}: {
    user: User | null;
    couples: CoupleView[];
    votesAll: VoteView[];
}) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [entries, setEntries] = useState<
        { couple: CoupleView; choice: 'A' | 'B'; updatedAt?: Date }[]
    >([]);

    useEffect(() => {
        (async () => {
            if (!user) {
                setEntries([]);
                setLoading(false);
                return;
            }
            const vq = query(
                collection(db, 'votes'),
                where('uid', '==', user.uid),
                orderBy('updatedAt', 'desc'),
            );
            const snap = await getDocs(vq);

            const list: { couple: CoupleView; choice: 'A' | 'B'; updatedAt?: Date }[] = [];
            snap.forEach((d) => {
                const v = d.data() as VoteDoc;
                const couple = couples.find((c) => c.id === v.couple_id);
                if (!couple) return;
                const choice: 'A' | 'B' = v.people_voted_id === couple.personA.id ? 'A' : 'B';
                const ts = (v as any).updatedAt?.toDate?.() as Date | undefined;
                list.push({ couple, choice, updatedAt: ts });
            });

            setEntries(list);
            setLoading(false);
        })();
    }, [user, couples]);

    if (!user) {
        return (
            <main className="max-w-5xl mx-auto px-4 py-10">
                <div className="p-6 border rounded-2xl bg-white">
                    <h2 className="text-lg font-semibold mb-2">Mes votes</h2>
                    <p className="text-gray-600">Connecte-toi pour voir ton historique de votes.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 px-3 py-2 rounded bg-gray-900 text-white"
                    >
                        Retour à l’accueil
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">
            <h2 className="text-lg font-semibold">Mon historique</h2>
            {loading && <div>Chargement…</div>}
            {!loading && entries.length === 0 && (
                <div className="text-gray-600 text-sm">Tu n’as encore voté pour aucun couple.</div>
            )}
            {!loading &&
                entries.map((e, i) => (
                    <div key={e.couple.id + '_' + i} className="space-y-2">
                        {e.updatedAt && (
                            <div className="text-xs text-gray-500">
                                Mis à jour le {e.updatedAt.toLocaleDateString()} à{' '}
                                {e.updatedAt.toLocaleTimeString()}
                            </div>
                        )}
                        <CoupleCard
                            couple={e.couple}
                            user={user}
                            myChoice={e.choice}
                            onlyMyVotes={true}
                            compact
                        />
                    </div>
                ))}
        </main>
    );
}
