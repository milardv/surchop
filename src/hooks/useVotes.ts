import { useEffect, useState } from 'react';
import {
    collection,
    doc,
    onSnapshot,
    query,
    runTransaction,
    serverTimestamp,
} from 'firebase/firestore';
import { User } from 'firebase/auth';

import { db } from '../firebase';
import { CoupleView, VoteDoc, VoteView } from '../models/models';

export default function useVotes(user: User | null, couples: CoupleView[]) {
    const [votesAll, setVotesAll] = useState<VoteView[]>([]);
    const [myVotes, setMyVotes] = useState<Record<string, 'A' | 'B' | 'tie'>>({});

    // Écoute temps réel des votes
    useEffect(() => {
        const q = query(collection(db, 'votes'));
        const unsub = onSnapshot(q, (snap) => {
            const list: VoteView[] = snap.docs.map((d) => {
                const v = d.data() as VoteDoc;
                const updatedAt = (v as any).updatedAt?.toDate?.() as Date | undefined;
                return { id: d.id, ...v, updatedAt };
            });
            setVotesAll(list);
        });
        return () => unsub();
    }, []);

    // Dérive mes votes personnels
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

    // Gestion du vote
    const handleVote = async (c: CoupleView, choice: 'A' | 'B' | 'tie') => {
        if (!user) return;

        const voteId = `${c.id}_${user.uid}`;
        const voteRef = doc(db, 'votes', voteId);
        const coupleRef = doc(db, 'couples', c.id);
        const chosenPersonId =
            choice === 'A' ? c.personA.id : choice === 'B' ? c.personB.id : 'tie';

        await runTransaction(db, async (tx) => {
            const [voteSnap, coupleSnap] = await Promise.all([tx.get(voteRef), tx.get(coupleRef)]);
            if (!coupleSnap.exists()) throw new Error('Couple not found');
            const coupleDoc = coupleSnap.data() as any;

            let { count_a = 0, count_b = 0, count_tie = 0 } = coupleDoc;
            if (!voteSnap.exists()) {
                if (choice === 'A') count_a++;
                else if (choice === 'B') count_b++;
                else count_tie++;
            } else {
                const prev = voteSnap.data() as VoteDoc;
                const prevChoice =
                    prev.people_voted_id === c.personA.id
                        ? 'A'
                        : prev.people_voted_id === c.personB.id
                          ? 'B'
                          : 'tie';
                if (prevChoice === choice) return;
                if (prevChoice === 'A') count_a--;
                else if (prevChoice === 'B') count_b--;
                else count_tie--;
                if (choice === 'A') count_a++;
                else if (choice === 'B') count_b++;
                else count_tie++;
            }

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

        // MAJ optimiste
        setMyVotes((s) => ({ ...s, [c.id]: choice }));
    };

    return { votesAll, myVotes, handleVote };
}
