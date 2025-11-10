import { useState } from 'react';
import {
    addDoc,
    collection,
    doc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    where,
} from 'firebase/firestore';

import { db } from '../firebase';
import { uploadToImgBB } from '../utils/uploadToImgBB';

export function useAddCoupleForm(
    user: any,
    navigate: (path: string) => void,
    category: 'friends' | 'people',
    isFictional: boolean | null, // ✅ champ ajouté
) {
    const [personA, setPersonA] = useState({
        display_name: '',
        image_url: '',
        file: null as File | null,
    });
    const [personB, setPersonB] = useState({
        display_name: '',
        image_url: '',
        file: null as File | null,
    });
    const [consentChecked, setConsentChecked] = useState(false);
    const [nameErrors, setNameErrors] = useState<{ A?: string; B?: string }>({});
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function checkPersonExists(name: string): Promise<boolean> {
        if (!name.trim()) return false;
        const q = query(collection(db, 'people'), where('display_name', '==', name.trim()));
        const snap = await getDocs(q);
        return !snap.empty;
    }

    const handleBlur = async (which: 'A' | 'B') => {
        const person = which === 'A' ? personA : personB;
        if (!person?.display_name.trim()) return;
        const exists = await checkPersonExists(person?.display_name);
        setNameErrors((prev) => ({
            ...prev,
            [which]: exists
                ? `Le nom "${person?.display_name}" existe déjà dans un autre couple.`
                : '',
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 🧩 Validation supplémentaire pour le couple fictif
        if (isFictional === null) {
            setError('Veuillez indiquer si le couple est fictif ou réel.');
            return;
        }

        if (!personA.display_name || !personB.display_name) {
            setError('Les deux noms sont obligatoires.');
            return;
        }
        if (!consentChecked) {
            setError('Vous devez certifier avoir obtenu le consentement des deux personnes.');
            return;
        }
        if ((!personA.file && !personA.image_url) || (!personB.file && !personB.image_url)) {
            setError('Chaque personne doit avoir au moins une image ou une URL d’image.');
            return;
        }
        if (nameErrors.A || nameErrors.B) {
            setError('Un des noms existe déjà. Modifiez-le avant de continuer.');
            return;
        }

        setError(null);
        setLoading(true);

        try {
            // 📸 Upload images si besoin
            let aImageURL = personA.image_url;
            let bImageURL = personB.image_url;
            if (personA.file) aImageURL = await uploadToImgBB(personA.file);
            if (personB.file) bImageURL = await uploadToImgBB(personB.file);

            // 👥 Création des documents dans Firestore
            const peopleCol = collection(db, 'people');
            const aRef = await addDoc(peopleCol, {
                display_name: personA.display_name,
                image_url: aImageURL ?? '',
            });
            const bRef = await addDoc(peopleCol, {
                display_name: personB.display_name,
                image_url: bImageURL ?? '',
            });

            // 💑 Création du couple
            const coupleRef = doc(collection(db, 'couples'));
            await setDoc(coupleRef, {
                id: coupleRef.id,
                people_a_id: aRef.id,
                people_b_id: bRef.id,
                count_a: 0,
                count_b: 0,
                createdBy: user.uid,
                createdAt: serverTimestamp(),
                consentCertified: true,
                category,
                validated: false,
                isFictional, // ✅ ajouté ici
            });

            // 🔗 Ajoute la référence du couple dans les personnes
            await Promise.all([
                setDoc(aRef, { couple_id: coupleRef.id }, { merge: true }),
                setDoc(bRef, { couple_id: coupleRef.id }, { merge: true }),
            ]);

            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError('Erreur lors de l’enregistrement : ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const canSubmit =
        !loading &&
        consentChecked &&
        personA.display_name.trim() !== '' &&
        personB.display_name.trim() !== '' &&
        (personA.file || personA.image_url.trim() !== '') &&
        (personB.file || personB.image_url.trim() !== '') &&
        !nameErrors.A &&
        !nameErrors.B;

    return {
        personA,
        personB,
        setPersonA,
        setPersonB,
        consentChecked,
        setConsentChecked,
        nameErrors,
        error,
        loading,
        canSubmit,
        handleBlur,
        handleSubmit,
    };
}
