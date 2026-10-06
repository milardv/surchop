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

type VoteChoice = 'A' | 'B' | 'tie';

function getVoteChoice(vote: VoteDoc, couple: Couple): VoteChoice {
    if (vote.people_voted_id === couple.personA.id) return 'A';
    if (vote.people_voted_id === couple.personB.id) return 'B';
    return 'tie';
}

function updateVoteCounts(
    coupleData: Record<string, number>,
    previousChoice: VoteChoice | undefined,
    choice: VoteChoice,
) {
    const delta = (candidate: VoteChoice) =>
        Number(choice === candidate) - Number(previousChoice === candidate);
    return {
        count_a: Math.max(0, (coupleData.count_a ?? 0) + delta('A')),
        count_b: Math.max(0, (coupleData.count_b ?? 0) + delta('B')),
        count_tie: Math.max(0, (coupleData.count_tie ?? 0) + delta('tie')),
    };
}

async function recordReferralParticipation(voterId: string) {
    const referrerCode = localStorage.getItem('surchope_pending_referral');
    const ownCode = localStorage.getItem(`surchope_referral_code_${voterId}`);
    if (!referrerCode) return;
    if (referrerCode === ownCode) {
        localStorage.removeItem('surchope_pending_referral');
        return;
    }

    try {
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(voterId));
        const referralId = Array.from(new Uint8Array(digest), (byte) =>
            byte.toString(16).padStart(2, '0'),
        ).join('');
        const referralRef = doc(db, 'referrals', referralId);
        await runTransaction(db, async (tx) => {
            const referralSnap = await tx.get(referralRef);
            if (!referralSnap.exists()) {
                tx.set(referralRef, { referrerCode, createdAt: serverTimestamp() });
            }
        });
        localStorage.removeItem('surchope_pending_referral');
    } catch (error) {
        console.error('Impossible de valider cette invitation :', error);
    }
}

export default function useVotes(user: User | null, couples: Couple[]) {
    const [votesAll, setVotesAll] = useState<VoteView[]>([]);
    const [votesLoaded, setVotesLoaded] = useState(false);
    const voterId = useMemo(() => user?.uid ?? getOrCreateGuestVoterId(), [user?.uid]);

    useEffect(() => {
        const url = new URL(window.location.href);
        const referralCode = url.searchParams.get('ref');
        if (!referralCode) return;

        localStorage.setItem('surchope_pending_referral', referralCode);
        url.searchParams.delete('ref');
        window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }, []);

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
        let createdVote = false;

        try {
            await runTransaction(db, async (tx) => {
                const [voteSnap, coupleSnap] = await Promise.all([
                    tx.get(voteRef),
                    tx.get(coupleRef),
                ]);
                if (!coupleSnap.exists()) throw new Error('Couple not found');
                const previousChoice = voteSnap.exists()
                    ? getVoteChoice(voteSnap.data() as VoteDoc, c)
                    : undefined;
                if (previousChoice === choice) return;
                createdVote = !voteSnap.exists();
                const counts = updateVoteCounts(
                    coupleSnap.data() as Record<string, number>,
                    previousChoice,
                    choice,
                );

                // 🔄 Sauvegarde transactionnelle
                tx.set(coupleRef, counts, { merge: true });
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

            if (createdVote) await recordReferralParticipation(voterId);
        } catch (err) {
            console.error('Erreur pendant le vote :', err);
        }
    };

    return { votesAll, myVotes, handleVote, votesLoaded, voterId };
}
