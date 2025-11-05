import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, where, query } from 'firebase/firestore';
import { getDoc, deleteDoc } from 'firebase/firestore';

import { db } from '../firebase';
import { CoupleDoc, CoupleView, Person } from '../models/models';

export default function ValidateCouplesPage() {
    const [couples, setCouples] = useState<CoupleView[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const q = query(collection(db, 'couples'), where('validated', '!=', true));
            const snap = await getDocs(q);

            const result: CoupleView[] = [];

            for (const d of snap.docs) {
                const c = d.data() as CoupleDoc;

                // Récupération des personnes liées
                const aSnap = await getDoc(doc(db, 'people', c.people_a_id));
                const bSnap = await getDoc(doc(db, 'people', c.people_b_id));

                if (!aSnap.exists() || !bSnap.exists()) continue;

                const a = { id: aSnap.id, ...(aSnap.data() as Person) };
                const b = { id: bSnap.id, ...(bSnap.data() as Person) };

                result.push({
                    id: d.id,
                    personA: a,
                    personB: b,
                    countA: c.count_a ?? 0,
                    countB: c.count_b ?? 0,
                    countTie: c.count_tie ?? 0,
                    category: c.category ?? 'friends',
                });
            }

            setCouples(result);
            setLoading(false);
        })();
    }, []);

    async function handleValidate(id: string) {
        await updateDoc(doc(db, 'couples', id), { validated: true });
        setCouples((prev) => prev.filter((c) => c.id !== id));
    }

    async function handleRefuse(id: string) {
        if (!confirm('Supprimer définitivement ce couple ?')) return;

        const coupleRef = doc(db, 'couples', id);
        const coupleSnap = await getDoc(coupleRef);
        if (!coupleSnap.exists()) return;

        const couple = coupleSnap.data() as CoupleDoc;

        // Supprime aussi les personnes liées
        await Promise.all([
            deleteDoc(doc(db, 'people', couple.people_a_id)),
            deleteDoc(doc(db, 'people', couple.people_b_id)),
            deleteDoc(coupleRef),
        ]);

        setCouples((prev) => prev.filter((c) => c.id !== id));
    }

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Chargement des couples…</div>;
    }

    if (couples.length === 0) {
        return <div className="p-6 text-center text-gray-500">Aucun couple à valider 🎉</div>;
    }

    return (
        <main className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-xl font-semibold mb-6 text-primary">Validation des couples</h2>

            <div className="grid gap-6">
                {couples.map((c) => (
                    <div
                        key={c.id}
                        className="p-4 border rounded-xl bg-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-4">
                                {[c.personA, c.personB].map((p) => (
                                    <img
                                        key={p.id}
                                        src={p.image_url}
                                        alt={p.display_name}
                                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                ))}
                            </div>
                            <div>
                                <div className="font-medium">
                                    {c.personA.display_name} ❤️ {c.personB.display_name}
                                </div>
                                <div className="text-xs text-gray-500">{c.category}</div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleValidate(c.id)}
                                className="px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700"
                            >
                                ✅ Valider
                            </button>
                            <button
                                onClick={() => handleRefuse(c.id)}
                                className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700"
                            >
                                ❌ Refuser
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
