import { collection, getDocs, query, where } from 'firebase/firestore';

import { db } from '../../firebase';

export function useNameValidation(isEdit: boolean, personA: any, personB: any) {
    async function checkPersonExists(name: string) {
        if (!name.trim()) return false;

        const q = query(collection(db, 'people'), where('display_name', '==', name.trim()));
        const snap = await getDocs(q);

        // autoriser si c’est la personne du couple
        if (isEdit && snap.docs.length === 1) {
            const found = snap.docs[0].id;
            if (found === personA.id || found === personB.id) return false;
        }

        return !snap.empty;
    }

    return { checkPersonExists };
}
