import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    runTransaction,
    serverTimestamp,
    onSnapshot,
} from 'firebase/firestore';

import Header from './components/Header';
import HomePage from './pages/HomePage';
import MyVotesPage from './pages/MyVotesPage';
import { auth, db } from './firebase';
import { CoupleDoc, CoupleView, Person, VoteDoc, VoteView } from './models/models';
import AddCouplePage from './pages/AddCouplePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

/** Représentation locale d'un vote Firestore avec id et Date JS */

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [couples, setCouples] = useState<CoupleView[]>([]);
    const [votesAll, setVotesAll] = useState<VoteView[]>([]);
    const [myVotes, setMyVotes] = useState<Record<string, 'A' | 'B' | 'tie'>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => onAuthStateChanged(auth, setUser), []);

    // Charge couples + people (stats globales via count_a/count_b/count_tie)
    useEffect(() => {
        let unsub: (() => void) | null = null;

        (async () => {
            // 1️⃣ Chargement initial
            const snap = await getDocs(collection(db, 'couples'));
            await processSnapshot(snap);

            // 2️⃣ Puis écoute temps réel
            unsub = onSnapshot(collection(db, 'couples'), processSnapshot);
        })();

        async function processSnapshot(snap: any) {
            const views: CoupleView[] = [];
            for (const d of snap.docs) {
                const c = d.data() as CoupleDoc;
                const [aSnap, bSnap] = await Promise.all([
                    getDoc(doc(db, 'people', c.people_a_id)),
                    getDoc(doc(db, 'people', c.people_b_id)),
                ]);
                if (!aSnap.exists() || !bSnap.exists()) continue;

                const a = { id: aSnap.id, ...(aSnap.data() as any) } as Person;
                const b = { id: bSnap.id, ...(bSnap.data() as any) } as Person;
                views.push({
                    id: d.id,
                    personA: a,
                    personB: b,
                    countA: c.count_a ?? 0,
                    countB: c.count_b ?? 0,
                    countTie: c.count_tie ?? 0, // ⚖️ ajout du compteur égalité
                    category: c.category ?? 'friends',
                });
            }
            setCouples(views);
            setLoading(false);
        }

        return () => unsub && unsub();
    }, []);

    // Charge TOUS les votes (sans filtre uid)
    useEffect(() => {
        (async () => {
            const vq = query(collection(db, 'votes'));
            const snap = await getDocs(vq);

            const list: VoteView[] = snap.docs.map((d) => {
                const v = d.data() as VoteDoc;
                const updatedAt = (v as any).updatedAt?.toDate?.() as Date | undefined;
                return { id: d.id, ...v, updatedAt };
            });

            setVotesAll(list);
        })();
    }, []);

    // Dérive MES votes à partir de votesAll + user + couples
    useEffect(() => {
        if (!user) {
            setMyVotes({});
            return;
        }
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

    // ⚖️ Gestion du vote (A, B ou égalité)
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
            const coupleDoc = coupleSnap.data() as CoupleDoc;

            let countA = coupleDoc.count_a ?? 0;
            let countB = coupleDoc.count_b ?? 0;
            let countTie = coupleDoc.count_tie ?? 0;

            if (!voteSnap.exists()) {
                if (choice === 'A') countA++;
                else if (choice === 'B') countB++;
                else countTie++;
            } else {
                const prev = voteSnap.data() as VoteDoc;
                const prevChoice =
                    prev.people_voted_id === c.personA.id
                        ? 'A'
                        : prev.people_voted_id === c.personB.id
                          ? 'B'
                          : 'tie';

                if (prevChoice === choice) {
                    // même choix: rien à faire
                    return;
                }

                // Annule le vote précédent
                if (prevChoice === 'A') countA--;
                else if (prevChoice === 'B') countB--;
                else countTie--;

                // Ajoute le nouveau vote
                if (choice === 'A') countA++;
                else if (choice === 'B') countB++;
                else countTie++;
            }

            tx.set(
                coupleRef,
                { count_a: countA, count_b: countB, count_tie: countTie },
                { merge: true },
            );
            tx.set(
                voteRef,
                {
                    couple_id: c.id,
                    uid: user.uid,
                    people_voted_id: chosenPersonId,
                    updatedAt: serverTimestamp(),
                } as VoteDoc,
                { merge: true },
            );
        });

        // MAJ optimiste
        setMyVotes((s) => ({ ...s, [c.id]: choice }));

        setCouples((list) =>
            list.map((x) => {
                if (x.id !== c.id) return x;
                const prev = myVotes[c.id];
                if (!prev) {
                    return {
                        ...x,
                        countA: x.countA + (choice === 'A' ? 1 : 0),
                        countB: x.countB + (choice === 'B' ? 1 : 0),
                        countTie: x.countTie + (choice === 'tie' ? 1 : 0),
                    };
                }
                if (prev === choice) return x;

                return {
                    ...x,
                    countA: x.countA + (choice === 'A' ? 1 : 0) - (prev === 'A' ? 1 : 0),
                    countB: x.countB + (choice === 'B' ? 1 : 0) - (prev === 'B' ? 1 : 0),
                    countTie: x.countTie + (choice === 'tie' ? 1 : 0) - (prev === 'tie' ? 1 : 0),
                };
            }),
        );

        setVotesAll((prev) => {
            const next = prev.filter((v) => v.id !== voteId);
            next.push({
                id: voteId,
                couple_id: c.id,
                uid: user.uid,
                people_voted_id: chosenPersonId,
                updatedAt: new Date(),
            });
            return next;
        });
    };

    return (
        <div>
            <Header user={user} />
            <Routes>
                <Route
                    path="/"
                    element={
                        <HomePage
                            user={user}
                            couples={couples}
                            myVotes={myVotes}
                            onVote={handleVote}
                            loading={loading}
                            votesAll={votesAll}
                        />
                    }
                />
                <Route
                    path="/mes-votes"
                    element={<MyVotesPage user={user} couples={couples} votesAll={votesAll} />}
                />
                <Route path="/ajouter-couple" element={<AddCouplePage user={user} />} />
                <Route path="/confidentialite" element={<PrivacyPolicyPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <footer className="text-center text-xs text-gray-500 py-6">
                Fait avec amour, aucun jugement 😇 •{' '}
                <a href="/surchop/confidentialite" className="underline hover:text-gray-700">
                    Politique de confidentialité
                </a>
            </footer>
        </div>
    );
}
