import { useEffect, useState } from 'react';
import { collection, doc, getDocs, runTransaction, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

import { db } from '../firebase';
import { Couple, VoteDoc, VoteView } from '../models/models';

export default function useVotes(user: User | null, couples: Couple[]) {
    const [votesAll, setVotesAll] = useState<VoteView[]>([]);
    const [myVotes, setMyVotes] = useState<Record<string, 'A' | 'B' | 'tie'>>({});

    // 📦 Charger tous les votes une seule fois au montage
    useEffect(() => {
        const fetchVotes = async () => {
            try {
                const snap = await getDocs(collection(db, 'votes'));
                const allVotes: VoteView[] = snap.docs.map((docSnap) => {
                    const v = docSnap.data() as VoteDoc;
                    const updatedAt = (v as any).updatedAt?.toDate?.() as Date | undefined;
                    return { id: docSnap.id, ...v, updatedAt };
                });
                setVotesAll(allVotes);
            } catch (err) {
                console.error('Erreur de chargement des votes :', err);
            }
        };
        fetchVotes();
    }, []);

    // 🧠 Dérive les votes personnels
    useEffect(() => {
        if (!user) return setMyVotes({});

        const mine: Record<string, 'A' | 'B' | 'tie'> = {};
        for (const v of votesAll) {
            if (v.uid !== user.uid) continue;
            const couple = couples.find((c) => c.id === v.couple_id);
            if (!couple) continue;

            if (v.people_voted_id === 'tie') mine[v.couple_id] = 'tie';
            else mine[v.couple_id] = v.people_voted_id === couple.personA.id ? 'A' : 'B';
        }
        setMyVotes(mine);
    }, [user, votesAll, couples]);

    // 🗳️ Gestion du vote (transaction sécurisée)
    const handleVote = async (c: Couple, choice: 'A' | 'B' | 'tie') => {
        if (!user) return;

        const voteId = `${c.id}_${user.uid}`;
        const voteRef = doc(db, 'votes', voteId);
        const coupleRef = doc(db, 'couples', c.id);
        const chosenPersonId =
            choice === 'A' ? c.personA.id : choice === 'B' ? c.personB.id : 'tie';

        try {
            await runTransaction(db, async (tx) => {
                const [voteSnap, coupleSnap] = await Promise.all([
                    tx.get(voteRef),
                    tx.get(coupleRef),
                ]);
                if (!coupleSnap.exists()) throw new Error('Couple not found');
                const coupleData = coupleSnap.data() as any;

                let { count_a = 0, count_b = 0, count_tie = 0 } = coupleData;
                if (!voteSnap.exists()) {
                    // Nouveau vote
                    if (choice === 'A') count_a++;
                    else if (choice === 'B') count_b++;
                    else count_tie++;
                } else {
                    // Mise à jour du vote existant
                    const prev = voteSnap.data() as VoteDoc;
                    const prevChoice =
                        prev.people_voted_id === c.personA.id
                            ? 'A'
                            : prev.people_voted_id === c.personB.id
                              ? 'B'
                              : 'tie';
                    if (prevChoice === choice) return; // rien à changer

                    if (prevChoice === 'A') count_a--;
                    else if (prevChoice === 'B') count_b--;
                    else count_tie--;

                    if (choice === 'A') count_a++;
                    else if (choice === 'B') count_b++;
                    else count_tie++;
                }

                // 🔄 Sauvegarde transactionnelle
                tx.set(coupleRef, { count_a, count_b, count_tie }, { merge: true });
                tx.set(
                    voteRef,
                    {
                        couple_id: c.id,
                        uid: user.uid,
                        people_voted_id: chosenPersonId,
                        updatedAt: serverTimestamp(),
                    },
                    { merge: true },
                );
            });

            // 🧠 Met à jour localement l’état sans rechargement
            setMyVotes((s) => ({ ...s, [c.id]: choice }));
            setVotesAll((prev) => {
                const existing = prev.find((v) => v.id === `${c.id}_${user.uid}`);
                const updated: VoteView = {
                    id: `${c.id}_${user.uid}`,
                    couple_id: c.id,
                    uid: user.uid,
                    people_voted_id: chosenPersonId,
                    updatedAt: new Date(),
                };
                if (existing) return prev.map((v) => (v.id === existing.id ? updated : v));
                return [...prev, updated];
            });
        } catch (err) {
            console.error('Erreur pendant le vote :', err);
        }
    };

    return { votesAll, myVotes, handleVote };
}
