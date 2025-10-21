import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { db } from '../firebase';
import { CoupleView, VoteDoc, VoteView } from '../models/models';
import CoupleCard from '../components/CoupleCard/CoupleCard';

import SurchopeLoader from '@/components/SurchopeLoader';

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
        { id: string; couple: CoupleView; choice: 'A' | 'B' | 'tie'; updatedAt?: Date }[]
    >([]);

    // 🔁 Chargement des votes utilisateur
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
            const list: {
                id: string;
                couple: CoupleView;
                choice: 'A' | 'B' | 'tie';
                updatedAt?: Date;
            }[] = [];

            snap.forEach((d) => {
                const v = d.data() as VoteDoc;
                const couple = couples.find((c) => c.id === v.couple_id);
                if (!couple) return;

                let choice: 'A' | 'B' | 'tie';
                if (v.people_voted_id === 'tie') choice = 'tie';
                else choice = v.people_voted_id === couple.personA.id ? 'A' : 'B';

                const ts = (v as any).updatedAt?.toDate?.() as Date | undefined;
                list.push({ id: d.id, couple, choice, updatedAt: ts });
            });

            setEntries(list);
            setLoading(false);
        })();
    }, [user, couples]);

    // 🗑️ Supprimer un vote
    const handleDeleteVote = async (voteId: string) => {
        if (!confirm('Supprimer ce vote ?')) return;
        try {
            await deleteDoc(doc(db, 'votes', voteId));
            setEntries((prev) => prev.filter((e) => e.id !== voteId));
        } catch (err) {
            console.error('Erreur suppression vote:', err);
            alert('Erreur lors de la suppression du vote.');
        }
    };

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
            <h2 className="text-lg font-semibold mb-4">Mon historique</h2>
            {loading && <SurchopeLoader />}
            {!loading && entries.length === 0 && (
                <div className="text-gray-600 text-sm">Tu n’as encore voté pour aucun couple.</div>
            )}
            <AnimatePresence>
                {!loading &&
                    entries.map((e, i) => (
                        <motion.div
                            key={e.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="relative bg-white rounded-2xl shadow-sm p-3"
                        >
                            {/* 🗑️ Bouton suppression */}
                            <button
                                onClick={() => handleDeleteVote(e.id)}
                                className="text-gray-400 hover:text-red-500 transition"
                                title="Supprimer ce vote"
                            >
                                <Trash2 size={16} />
                            </button>

                            {/* 💞 Couple */}
                            <CoupleCard
                                couple={e.couple}
                                user={user}
                                myChoice={e.choice}
                                onlyMyVotes={true}
                                compact
                            />
                        </motion.div>
                    ))}
            </AnimatePresence>
        </main>
    );
}
