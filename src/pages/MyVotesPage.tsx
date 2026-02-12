import React, { useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import { deleteDoc, doc } from 'firebase/firestore';
import { Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { db } from '../firebase';
import { Couple, VoteView } from '../models/models';
import CoupleCard from '../components/CoupleCard/CoupleCard';

import SurchopeLoader from '@/components/SurchopeLoader';
import Card from '@/components/ui/Card';
import IconButton from '@/components/ui/IconButton';
import { getOrCreateGuestVoterId } from '@/utils/voterIdentity';

export default function MyVotesPage({
    user,
    couples,
    votesAll,
}: {
    user: User | null;
    couples: Couple[];
    votesAll: VoteView[];
}) {
    const voterId = useMemo(() => user?.uid ?? getOrCreateGuestVoterId(), [user?.uid]);
    const [loading, setLoading] = useState(true);

    const [entries, setEntries] = useState<
        { id: string; couple: Couple; choice: 'A' | 'B' | 'tie'; updatedAt?: Date }[]
    >([]);

    // 🔁 Chargement des votes du visiteur (connecté ou invité)
    useEffect(() => {
        setLoading(true);

        const list = votesAll
            .filter((vote) => vote.uid === voterId)
            .flatMap((vote: VoteView) => {
                const couple = couples.find((c) => c.id === vote.couple_id);
                if (!couple || !couple.personA || !couple.personB) return [];

                if (vote.people_voted_id === 'tie') {
                    return [
                        { id: vote.id, couple, choice: 'tie' as const, updatedAt: vote.updatedAt },
                    ];
                }
                if (vote.people_voted_id === couple.personA.id) {
                    return [
                        { id: vote.id, couple, choice: 'A' as const, updatedAt: vote.updatedAt },
                    ];
                }
                if (vote.people_voted_id === couple.personB.id) {
                    return [
                        { id: vote.id, couple, choice: 'B' as const, updatedAt: vote.updatedAt },
                    ];
                }
                return [];
            })
            .sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));

        setEntries(list);
        setLoading(false);
    }, [votesAll, couples, voterId]);

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

    return (
        <main className="max-w-5xl mx-auto px-4 py-6 space-y-4 text-foreground">
            <h2 className="text-lg font-semibold mb-4 text-primary">Mon historique</h2>
            {!user && (
                <p className="text-xs text-muted-foreground -mt-2">
                    Mode invité: historique lié à ce navigateur.
                </p>
            )}

            {loading && <SurchopeLoader />}

            {!loading && entries.length === 0 && (
                <div className="text-muted-foreground text-sm">
                    Tu n’as encore voté pour aucun couple 😢
                </div>
            )}

            <AnimatePresence>
                {!loading &&
                    entries.map((e) => (
                        <motion.div
                            key={e.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="relative p-3 flex flex-col gap-2">
                                {/* 🗑️ Bouton suppression */}
                                <div className="">
                                    <IconButton
                                        icon={Trash2}
                                        label="Supprimer ce vote"
                                        color="default"
                                        onClick={() => handleDeleteVote(e.id)}
                                    />
                                </div>

                                {/* 💞 Couple */}
                                <CoupleCard
                                    couple={e.couple}
                                    user={user}
                                    myChoice={e.choice}
                                    onlyMyVotes={true}
                                    compact
                                />
                            </Card>
                        </motion.div>
                    ))}
            </AnimatePresence>
        </main>
    );
}
