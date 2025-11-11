import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { db } from '../firebase';
import { Couple, VoteDoc, VoteView } from '../models/models';
import CoupleCard from '../components/CoupleCard/CoupleCard';

import SurchopeLoader from '@/components/SurchopeLoader';
import Card from '@/components/ui/Card';
import IconButton from '@/components/ui/IconButton';
import BackButton from '@/components/ui/BackButton';

export default function MyVotesPage({
    user,
    couples,
    votesAll,
}: {
    user: User | null;
    couples: Couple[];
    votesAll: VoteView[];
}) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [entries, setEntries] = useState<
        { id: string; couple: Couple; choice: 'A' | 'B' | 'tie'; updatedAt?: Date }[]
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
                couple: Couple;
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

    // 🔒 Si l’utilisateur n’est pas connecté
    if (!user) {
        return (
            <main className="max-w-5xl mx-auto px-4 py-10">
                <Card className="p-6 text-center bg-card text-card-foreground">
                    <h2 className="text-lg font-semibold mb-2 text-primary">Mes votes</h2>
                    <p className="text-muted-foreground">
                        Connecte-toi pour voir ton historique de votes.
                    </p>
                    <BackButton to="/" label="Retour à la liste" className={'mt-8'} />
                </Card>
            </main>
        );
    }

    return (
        <main className="max-w-5xl mx-auto px-4 py-6 space-y-4 text-foreground">
            <h2 className="text-lg font-semibold mb-4 text-primary">Mon historique</h2>

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
