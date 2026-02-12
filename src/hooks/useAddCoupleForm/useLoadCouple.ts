import { doc, getDoc } from 'firebase/firestore';
import { useEffect } from 'react';

import { db } from '../../firebase';
import { PersonForm } from './types';

export function useLoadCouple(
    isEdit: boolean,
    coupleId: string | undefined,
    setPersonA: (p: PersonForm) => void,
    setPersonB: (p: PersonForm) => void,
    setConsentChecked: (v: boolean) => void,
    setCategory: (c: any) => void,
) {
    useEffect(() => {
        if (!isEdit || !coupleId) return;

        const fetchCouple = async () => {
            const coupleSnap = await getDoc(doc(db, 'couples', coupleId));
            if (!coupleSnap.exists()) return;

            const couple = coupleSnap.data();
            if (couple.category) {
                setCategory(couple.category);
            }
            const [aSnap, bSnap] = await Promise.all([
                getDoc(doc(db, 'people', couple.people_a_id)),
                getDoc(doc(db, 'people', couple.people_b_id)),
            ]);

            if (aSnap.exists()) {
                const a = aSnap.data();
                setPersonA({
                    id: couple.people_a_id,
                    display_name: a.display_name,
                    image_url: a.image_url,
                    file: null,
                });
            }

            if (bSnap.exists()) {
                const b = bSnap.data();
                setPersonB({
                    id: couple.people_b_id,
                    display_name: b.display_name,
                    image_url: b.image_url,
                    file: null,
                });
            }

            setConsentChecked(true);
        };

        fetchCouple();
    }, [isEdit, coupleId]);
}
