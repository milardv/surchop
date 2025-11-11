import React, { useEffect, useState } from 'react';
import {
    collection,
    getDocs,
    updateDoc,
    doc,
    where,
    query,
    getDoc,
    deleteDoc,
} from 'firebase/firestore';

import { db } from '../firebase';
import { Couple, Person } from '../models/models';

export default function ValidateCouplesPage() {
    const [couples, setCouples] = useState<Couple[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const q = query(collection(db, 'couples'), where('validated', '!=', true));
                const snap = await getDocs(q);
                const result: Couple[] = [];

                for (const d of snap.docs) {
                    const c = d.data() as Couple;

                    // 🔍 Récupération des personnes liées
                    const [aSnap, bSnap] = await Promise.all([
                        getDoc(doc(db, 'people', c.people_a_id)),
                        getDoc(doc(db, 'people', c.people_b_id)),
                    ]);

                    if (!aSnap.exists() || !bSnap.exists()) continue;

                    const a = { id: aSnap.id, ...(aSnap.data() as Person) };
                    const b = { id: bSnap.id, ...(bSnap.data() as Person) };

                    result.push({
                        ...c,
                        id: d.id,
                        personA: a,
                        personB: b,
                    });
                }

                setCouples(result);
            } catch (err) {
                console.error('Erreur de chargement des couples à valider :', err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // ✅ Validation
    async function handleValidate(id: string) {
        await updateDoc(doc(db, 'couples', id), { validated: true });
        setCouples((prev) => prev.filter((c) => c.id !== id));
    }

    // ❌ Refus (suppression totale)
    async function handleRefuse(id: string) {
        if (!confirm('Supprimer définitivement ce couple ?')) return;

        const coupleRef = doc(db, 'couples', id);
        const coupleSnap = await getDoc(coupleRef);
        if (!coupleSnap.exists()) return;

        const couple = coupleSnap.data() as Couple;

        await Promise.all([
            deleteDoc(doc(db, 'people', couple.people_a_id)),
            deleteDoc(doc(db, 'people', couple.people_b_id)),
            deleteDoc(coupleRef),
        ]);

        setCouples((prev) => prev.filter((c) => c.id !== id));
    }

    // 💡 États d’attente
    if (loading) {
        return <div className="p-6 text-center text-gray-500">Chargement des couples…</div>;
    }

    if (couples.length === 0) {
        return <div className="p-6 text-center text-gray-500">Aucun couple à valider 🎉</div>;
    }

    // 🧠 Rendu principal
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
                                {[c.personA, c.personB].map(
                                    (p) =>
                                        p && (
                                            <img
                                                key={p.id}
                                                src={p.image_url}
                                                alt={p.display_name}
                                                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                                            />
                                        ),
                                )}
                            </div>

                            <div>
                                <div className="font-medium">
                                    {c.personA?.display_name} ❤️ {c.personB?.display_name}
                                </div>
                                <div className="text-xs text-gray-500 capitalize">
                                    {c.category === 'friends' ? '👫 Amis' : '🌍 People'}
                                    {c.isFictional && (
                                        <span className="ml-2 inline-flex items-center text-purple-600 font-medium">
                                            ✨ Fictif
                                        </span>
                                    )}
                                </div>
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
