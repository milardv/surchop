import { useEffect, useState } from 'react';
import {
    collection,
    doc,
    getDoc,
    onSnapshot,
    query,
    where,
    getDocs,
    deleteDoc,
} from 'firebase/firestore';

import { db } from '../firebase';
import { CoupleDoc, CoupleView, Person } from '../models/models';

export default function useCouples() {
    const [couples, setCouples] = useState<CoupleView[]>([]);
    const [loading, setLoading] = useState(true);
    const personCache = new Map<string, Person>();

    useEffect(() => {
        const q = query(collection(db, 'couples'), where('validated', '==', true));

        // ✅ async wrapper — Firestore callback cannot be directly async
        const unsub = onSnapshot(q, (snap) => {
            const changes = snap.docChanges();
            if (changes.length === 0) return;

            // On traite les changements
            changes.forEach(async (change) => {
                const c = change.doc.data() as CoupleDoc;
                const coupleId = change.doc.id;

                if (change.type === 'removed') {
                    setCouples((prev) => prev.filter((x) => x.id !== coupleId));
                    return;
                }

                // Charger les personnes (avec cache)
                const a = await loadPerson(c.people_a_id);
                const b = await loadPerson(c.people_b_id);
                if (!a || !b) return;

                const newCouple: CoupleView = {
                    id: coupleId,
                    personA: a,
                    personB: b,
                    countA: c.count_a ?? 0,
                    countB: c.count_b ?? 0,
                    countTie: c.count_tie ?? 0,
                    category: c.category ?? 'friends',
                };

                setCouples((prev) => {
                    const exists = prev.find((x) => x.id === coupleId);
                    if (!exists && change.type === 'added') {
                        return [...prev, newCouple];
                    }
                    if (exists && change.type === 'modified') {
                        return prev.map((x) => (x.id === coupleId ? newCouple : x));
                    }
                    return prev;
                });
            });

            setLoading(false);
        });

        async function loadPerson(id: string): Promise<Person | null> {
            if (personCache.has(id)) return personCache.get(id)!;
            const snap = await getDoc(doc(db, 'people', id));
            if (!snap.exists()) return null;
            const person = { id: snap.id, ...(snap.data() as any) } as Person;
            personCache.set(id, person);
            return person;
        }

        return () => unsub();
    }, []);

    // 🔥 Suppression d’un couple
    const deleteCouple = async (id: string, userUid: string) => {
        if (userUid !== 'EuindCjjeTYx5ABLPCRWdflHy2c2') {
            alert('Tu n’as pas les droits pour supprimer ce couple.');
            return;
        }

        try {
            const coupleRef = doc(db, 'couples', id);
            const coupleSnap = await getDoc(coupleRef);
            if (!coupleSnap.exists()) return alert('Couple introuvable.');

            const couple = coupleSnap.data() as CoupleDoc;

            // Supprimer votes + personnes
            const votesSnap = await getDocs(
                query(collection(db, 'votes'), where('couple_id', '==', id)),
            );
            const voteDeletions = votesSnap.docs.map((d) => deleteDoc(d.ref));

            await Promise.all([
                ...voteDeletions,
                deleteDoc(doc(db, 'people', couple.people_a_id)),
                deleteDoc(doc(db, 'people', couple.people_b_id)),
                deleteDoc(coupleRef),
            ]);

            setCouples((prev) => prev.filter((c) => c.id !== id));
            alert('✅ Couple supprimé avec succès.');
        } catch (err) {
            console.error('Erreur pendant la suppression du couple :', err);
            alert('❌ Erreur lors de la suppression du couple.');
        }
    };

    return { couples, loading, deleteCouple };
}
