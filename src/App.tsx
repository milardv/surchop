import React, { useEffect, useState } from "react";
import { auth, db, loginWithGoogle, logout } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    where,
    runTransaction,
    serverTimestamp,
} from "firebase/firestore";
import { CoupleDoc, CoupleView, Person, VoteDoc } from "./models/models";

function Header({ user }: { user: User | null }) {
    return (
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                <div className="font-semibold">Le Fun & le Tabou</div>
                <div>
                    {user ? (
                        <div className="flex items-center gap-3">
                            <img className="w-8 h-8 rounded-full" src={user.photoURL ?? ""} alt="" />
                            <button className="text-sm underline" onClick={() => logout()}>
                                Se déconnecter
                            </button>
                        </div>
                    ) : (
                        <button className="px-3 py-1 rounded bg-pink-500 text-white" onClick={() => loginWithGoogle()}>
                            Se connecter
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

function Gauge({ a, b }: { a: number; b: number }) {
    const total = Math.max(1, a + b);
    const pctA = Math.round((a / total) * 100);
    return (
        <div>
            <div className="h-2 bg-gray-200 rounded overflow-hidden">
                <div className="h-full bg-pink-500" style={{ width: `${pctA}%` }} />
            </div>
            <div className="text-xs mt-1 text-gray-600">
                {a} vs {b}
            </div>
        </div>
    );
}

function CoupleCard({
                        couple,
                        user,
                        myChoice,
                        onVote,
                    }: {
    couple: CoupleView;
    user: User | null;
    myChoice?: "A" | "B";
    onVote: (c: CoupleView, choice: "A" | "B") => void;
}) {
    return (
        <div className="p-4 rounded-2xl bg-white shadow-sm border">
            <div className="flex items-center gap-4">
                <div className="flex-1 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                            {couple.a.image_url ? (
                                <img src={couple.a.image_url} alt={couple.a.display_name} />
                            ) : (
                                <span className="text-sm">{couple.a.display_name[0]}</span>
                            )}
                        </div>
                        <div className="font-medium">{couple.a.display_name}</div>
                    </div>
                    <span className="text-gray-400">vs</span>
                    <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                            {couple.b.image_url ? (
                                <img src={couple.b.image_url} alt={couple.b.display_name} />
                            ) : (
                                <span className="text-sm">{couple.b.display_name[0]}</span>
                            )}
                        </div>
                        <div className="font-medium">{couple.b.display_name}</div>
                    </div>
                </div>
                <div className="w-48">
                    <Gauge a={couple.countA} b={couple.countB} />
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                <button
                    disabled={!user}
                    onClick={() => onVote(couple, "A")}
                    className={`flex-1 px-3 py-2 rounded border ${
                        myChoice === "A" ? "bg-pink-50 border-pink-500 text-pink-600" : "hover:bg-gray-50"
                    }`}
                >
                    {couple.a.display_name} surchope
                </button>
                <button
                    disabled={!user}
                    onClick={() => onVote(couple, "B")}
                    className={`flex-1 px-3 py-2 rounded border ${
                        myChoice === "B" ? "bg-pink-50 border-pink-500 text-pink-600" : "hover:bg-gray-50"
                    }`}
                >
                    {couple.b.display_name} surchope
                </button>
            </div>

            {!user && <div className="text-xs text-gray-500 mt-2">Connecte-toi pour voter.</div>}
        </div>
    );
}

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [couples, setCouples] = useState<CoupleView[]>([]);
    const [myVotes, setMyVotes] = useState<Record<string, "A" | "B">>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => onAuthStateChanged(auth, setUser), []);

    // Charge couples + people
    useEffect(() => {
        (async () => {
            console.log('get couples')
            const cq = query(collection(db, "/couples"));
            const snap = await getDocs(cq);
console.log(snap.docs);
            const views: CoupleView[] = [];
            for (const d of snap.docs) {
                const c = d.data() as CoupleDoc;
                const [aSnap, bSnap] = await Promise.all([
                    getDoc(doc(db, "people", c.people_a_id)),
                    getDoc(doc(db, "people", c.people_b_id)),
                ]);
                if (!aSnap.exists() || !bSnap.exists()) continue;

                const a = { id: aSnap.id, ...(aSnap.data() as any) } as Person;
                const b = { id: bSnap.id, ...(bSnap.data() as any) } as Person;

                views.push({
                    id: d.id,
                    a,
                    b,
                    countA: c.count_a ?? 0,
                    countB: c.count_b ?? 0,
                });
            }
            setCouples(views);
            setLoading(false);
        })();
    }, []);

    // Charge mes votes (filtré par uid)
    useEffect(() => {
        (async () => {
            if (!user) {
                setMyVotes({});
                return;
            }
            const vq = query(collection(db, "votes"), where("uid", "==", user.uid));
            const snap = await getDocs(vq);

            const mine: Record<string, "A" | "B"> = {};
            snap.forEach((d) => {
                const v = d.data() as VoteDoc;
                const couple = couples.find((c) => c.id === v.couple_id);
                if (!couple) return;
                mine[v.couple_id] = v.people_voted_id === couple.a.id ? "A" : "B";
            });
            setMyVotes(mine);
        })();
    }, [user, couples]);

    const handleVote = async (c: CoupleView, choice: "A" | "B") => {
        if (!user) return;

        const voteId = `${c.id}_${user.uid}`;
        const voteRef = doc(db, "votes", voteId);
        const coupleRef = doc(db, "couples", c.id);
        const chosenPersonId = choice === "A" ? c.a.id : c.b.id;

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
                    return; // même choix
                }
                if (prev.people_voted_id === c.a.id) {
                    countA--;
                    countB++;
                } else {
                    countB--;
                    countA++;
                }
            }

            tx.set(coupleRef, { count_a: countA, count_b: countB }, { merge: true });
            tx.set(
                voteRef,
                {
                    couple_id: c.id,
                    uid: user.uid,
                    people_voted_id: chosenPersonId,
                    updatedAt: serverTimestamp(),
                } as VoteDoc,
                { merge: true }
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
                        countA: x.countA + (choice === "A" ? 1 : 0),
                        countB: x.countB + (choice === "B" ? 1 : 0),
                    };
                }
                if (prev === choice) return x;
                return {
                    ...x,
                    countA: x.countA + (choice === "A" ? 1 : -1),
                    countB: x.countB + (choice === "B" ? 1 : -1),
                };
            })
        );
    };

    return (
        <div>
            <Header user={user} />
            <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">
                {loading && <div>Chargement…</div>}

                {!loading &&
                    couples.map((c) => (
                        <CoupleCard key={c.id} couple={c} user={user} myChoice={myVotes[c.id]} onVote={handleVote} />
                    ))}
            </main>
            <footer className="text-center text-xs text-gray-500 py-6">Fait avec amour, aucun jugement 😇</footer>
        </div>
    );
}
