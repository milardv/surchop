import { useEffect, useMemo, useState } from 'react';
import {
    collection,
    doc,
    getDocs,
    query,
    runTransaction,
    serverTimestamp,
    where,
} from 'firebase/firestore';
import { User } from 'firebase/auth';

import { db } from '@/firebase';
import { Couple, VoteDoc, VoteView } from '@/models/models';
import { getOrCreateGuestVoterId } from '@/utils/voterIdentity';

export default function useVotes(user: User | null, couples: Couple[]) {
    const [votesAll, setVotesAll] = useState<VoteView[]>([]);
    const [votesLoaded, setVotesLoaded] = useState(false);
    const voterId = useMemo(() => user?.uid ?? getOrCreateGuestVoterId(), [user?.uid]);

    // 📦 Charger les votes du visiteur courant (compte ou invité)
    useEffect(() => {
        let cancelled = false;
        const fallbackTimer = setTimeout(() => {
            if (!cancelled) setVotesLoaded(true);
        }, 5000);

        const fetchVotes = async () => {
            if (!voterId) {
                if (!cancelled) {
                    setVotesAll([]);
                    setVotesLoaded(true);
                }
                return;
            }

            if (!cancelled) setVotesLoaded(false);
            try {
                const votesQuery = query(collection(db, 'votes'), where('uid', '==', voterId));
                const snap = await getDocs(votesQuery);
                const allVotes: VoteView[] = snap.docs.map((docSnap) => {
                    const v = docSnap.data() as VoteDoc;
                    const updatedAt = (v as any).updatedAt?.toDate?.() as Date | undefined;
                    return { id: docSnap.id, ...v, updatedAt };
                });
                if (!cancelled) setVotesAll(allVotes);
            } catch (err) {
                console.error('Erreur de chargement des votes :', err);
            } finally {
                if (!cancelled) setVotesLoaded(true);
                clearTimeout(fallbackTimer);
            }
        };
        fetchVotes();

        return () => {
            cancelled = true;
            clearTimeout(fallbackTimer);
        };
    }, [voterId]);

    // 🧠 Dérive les votes personnels
    const myVotes = useMemo<Record<string, 'A' | 'B' | 'tie'>>(() => {
        if (!voterId) return {};

        const mine: Record<string, 'A' | 'B' | 'tie'> = {};
        for (const v of votesAll) {
            if (v.uid !== voterId) continue;
            const couple = couples.find((c) => c.id === v.couple_id);
            if (!couple) continue;

            if (v.people_voted_id === 'tie') mine[v.couple_id] = 'tie';
            else mine[v.couple_id] = v.people_voted_id === couple.personA.id ? 'A' : 'B';
        }
        return mine;
    }, [voterId, votesAll, couples]);

    // 🗳️ Gestion du vote (transaction sécurisée)
    const handleVote = async (c: Couple, choice: 'A' | 'B' | 'tie') => {
        if (!voterId) return;

        const voteId = `${c.id}_${voterId}`;
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
                        uid: voterId,
                        people_voted_id: chosenPersonId,
                        updatedAt: serverTimestamp(),
                    },
                    { merge: true },
                );
            });

            // 🧠 Met à jour localement l’état sans rechargement
            setVotesAll((prev) => {
                const existing = prev.find((v) => v.id === voteId);
                const updated: VoteView = {
                    id: voteId,
                    couple_id: c.id,
                    uid: voterId,
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

    return { votesAll, myVotes, handleVote, votesLoaded };
}
