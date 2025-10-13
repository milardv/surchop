import React, {useEffect, useState} from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import {onAuthStateChanged, User} from "firebase/auth";
import {collection, doc, getDoc, getDocs, query, runTransaction, serverTimestamp,} from "firebase/firestore";

import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import MyVotesPage from "./pages/MyVotesPage";

import {auth, db} from "./firebase";
import {CoupleDoc, CoupleView, Person, VoteDoc, VoteView} from "./models/models";
import AddCouplePage from "./pages/AddCouplePage";

/** Représentation locale d'un vote Firestore avec id et Date JS */

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [couples, setCouples] = useState<CoupleView[]>([]);
    const [votesAll, setVotesAll] = useState<VoteView[]>([]);
    const [myVotes, setMyVotes] = useState<Record<string, "A" | "B">>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => onAuthStateChanged(auth, setUser), []);

    // Charge couples + people (stats globales via count_a/count_b)
    useEffect(() => {
        (async () => {
            const cq = query(collection(db, "/couples"));
            const snap = await getDocs(cq);
            const views: CoupleView[] = [];
            for (const d of snap.docs) {
                const c = d.data() as CoupleDoc;
                const [aSnap, bSnap] = await Promise.all([
                    getDoc(doc(db, "people", c.people_a_id)),
                    getDoc(doc(db, "people", c.people_b_id)),
                ]);
                if (!aSnap.exists() || !bSnap.exists()) continue;

                const a = {id: aSnap.id, ...(aSnap.data() as any)} as Person;
                const b = {id: bSnap.id, ...(bSnap.data() as any)} as Person;

                views.push({
                    id: d.id,
                    personA: a,
                    personB: b,
                    countA: c.count_a ?? 0,
                    countB: c.count_b ?? 0,
                });
            }
            setCouples(views);
            setLoading(false);
        })();
    }, []);

    // Charge TOUS les votes (sans filtre uid)
    useEffect(() => {
        (async () => {
            const vq = query(collection(db, "votes"));
            const snap = await getDocs(vq);

            const list: VoteView[] = snap.docs.map((d) => {
                const v = d.data() as VoteDoc;
                console.log(v)
                const updatedAt = (v as any).updatedAt?.toDate?.() as Date | undefined;
                return {id: d.id, ...v, updatedAt};
            });
            console.log(list)

            setVotesAll(list);
        })();
    }, []);

    // Dérive MES votes à partir de votesAll + user + couples
    useEffect(() => {
        if (!user) {
            setMyVotes({});
            return;
        }
        const mine: Record<string, "A" | "B"> = {};
        for (const v of votesAll) {
            if (v.uid !== user.uid) continue;
            const couple = couples.find((c) => c.id === v.couple_id);
            if (!couple) continue;
            mine[v.couple_id] = v.people_voted_id === couple.personA.id ? "A" : "B";
        }
        setMyVotes(mine);
    }, [user, votesAll, couples]);

    const handleVote = async (c: CoupleView, choice: "A" | "B") => {
        if (!user) return;

        const voteId = `${c.id}_${user.uid}`;
        const voteRef = doc(db, "votes", voteId);
        const coupleRef = doc(db, "couples", c.id);
        const chosenPersonId = choice === "A" ? c.personA.id : c.personB.id;

        await runTransaction(db, async (tx) => {
            const [voteSnap, coupleSnap] = await Promise.all([tx.get(voteRef), tx.get(coupleRef)]);
            if (!coupleSnap.exists()) throw new Error("Couple not found");
            const coupleDoc = coupleSnap.data() as CoupleDoc;

            let countA = coupleDoc.count_a ?? 0;
            let countB = coupleDoc.count_b ?? 0;

            if (!voteSnap.exists()) {
                if (choice === "A") countA++;
                else countB++;
            } else {
                const prev = voteSnap.data() as VoteDoc;
                if (prev.people_voted_id === chosenPersonId) {
                    // même choix: rien à faire
                    return;
                }
                if (prev.people_voted_id === c.personA.id) {
                    countA--;
                    countB++;
                } else {
                    countB--;
                    countA++;
                }
            }

            tx.set(coupleRef, {count_a: countA, count_b: countB}, {merge: true});
            tx.set(
                voteRef,
                {
                    couple_id: c.id,
                    uid: user.uid,
                    people_voted_id: chosenPersonId,
                    updatedAt: serverTimestamp(),
                } as VoteDoc,
                {merge: true}
            );
        });

        // MAJ optimiste: ma sélection
        setMyVotes((s) => ({...s, [c.id]: choice}));

        // MAJ optimiste: compteurs du couple
        setCouples((list) =>
            list.map((x) => {
                if (x.id !== c.id) return x;
                const prev = myVotes[c.id];
                if (!prev) {
                    // premier vote
                    return {
                        ...x,
                        countA: x.countA + (choice === "A" ? 1 : 0),
                        countB: x.countB + (choice === "B" ? 1 : 0),
                    };
                }
                if (prev === choice) return x; // rien à changer
                return {
                    ...x,
                    countA: x.countA + (choice === "A" ? 1 : -1),
                    countB: x.countB + (choice === "B" ? 1 : -1),
                };
            })
        );

        // MAJ optimiste: votesAll (remplace/ajoute mon vote)
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
            <Header user={user}/>
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
                    element={<MyVotesPage user={user} couples={couples} votesAll={votesAll}/>}
                />
                <Route path="/ajouter-couple" element={<AddCouplePage user={user}/>}/>
                <Route path="*" element={<Navigate to="/" replace/>}/>
            </Routes>
            <footer className="text-center text-xs text-gray-500 py-6">
                Fait avec amour, aucun jugement 😇
            </footer>
        </div>
    );
}
