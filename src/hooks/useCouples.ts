import { useEffect, useState } from 'react';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    deleteDoc,
    query,
    where,
} from 'firebase/firestore';

import { db } from '../firebase';
import { CoupleDoc, CoupleView, Person } from '../models/models';

export default function useCouples() {
    const [couples, setCouples] = useState<CoupleView[]>([]);
    const [loading, setLoading] = useState(true);

    // Cache pour éviter de recharger plusieurs fois les mêmes personnes
    const personCache = new Map<string, Person>();

    useEffect(() => {
        let unsub: (() => void) | null = null;

        (async () => {
            // ✅ On ne récupère que les couples validés
            const q = query(collection(db, 'couples'), where('validated', '==', true));
            const snap = await getDocs(q);
            await processSnapshot(snap);

            unsub = onSnapshot(q, processSnapshot);
        })();

        async function processSnapshot(snap: any) {
            const views: CoupleView[] = [];

            for (const d of snap.docs) {
                const c = d.data() as CoupleDoc;

                const a = await loadPerson(c.people_a_id);
                const b = await loadPerson(c.people_b_id);
                if (!a || !b) continue;

                views.push({
                    id: d.id,
                    personA: a,
                    personB: b,
                    countA: c.count_a ?? 0,
                    countB: c.count_b ?? 0,
                    countTie: c.count_tie ?? 0,
                    category: c.category ?? 'friends',
                });
            }

            setCouples(views);
            setLoading(false);
        }

        async function loadPerson(id: string): Promise<Person | null> {
            if (personCache.has(id)) return personCache.get(id)!;
            const snap = await getDoc(doc(db, 'people', id));
            if (!snap.exists()) return null;
            const person = { id: snap.id, ...(snap.data() as any) } as Person;
            personCache.set(id, person);
            return person;
        }

        return () => unsub && unsub();
    }, []);

    /**
     * 🔥 Supprime un couple et toutes ses données associées
     * (votes + personnes liées)
     */
    const deleteCouple = async (id: string, userUid: string) => {
        if (userUid !== 'EuindCjjeTYx5ABLPCRWdflHy2c2') {
            alert('Tu n’as pas les droits pour supprimer ce couple.');
            return;
        }

        try {
            const coupleRef = doc(db, 'couples', id);
            const coupleSnap = await getDoc(coupleRef);

            if (!coupleSnap.exists()) {
                alert('Couple introuvable.');
                return;
            }

            const couple = coupleSnap.data() as CoupleDoc;

            // 1️⃣ Supprimer tous les votes liés à ce couple
            const votesSnap = await getDocs(
                query(collection(db, 'votes'), where('couple_id', '==', id)),
            );
            const voteDeletions = votesSnap.docs.map((d) => deleteDoc(d.ref));

            // 2️⃣ Supprimer les deux personnes liées
            const personARef = doc(db, 'people', couple.people_a_id);
            const personBRef = doc(db, 'people', couple.people_b_id);

            // 3️⃣ Supprimer le couple lui-même
            await Promise.all([
                ...voteDeletions,
                deleteDoc(personARef),
                deleteDoc(personBRef),
                deleteDoc(coupleRef),
            ]);

            // 4️⃣ Mise à jour locale
            setCouples((prev) => prev.filter((c) => c.id !== id));

            alert('✅ Couple supprimé avec succès.');
        } catch (err) {
            console.error('Erreur pendant la suppression du couple :', err);
            alert('❌ Erreur lors de la suppression du couple.');
        }
    };

    return { couples, loading, setCouples, deleteCouple };
}
