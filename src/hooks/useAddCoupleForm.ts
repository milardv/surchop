import { useEffect, useState } from 'react';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    where,
} from 'firebase/firestore';

import { db } from '../firebase';
import { uploadToImgBB } from '../utils/uploadToImgBB';

import { Category } from '@/models/models';

export interface PersonForm {
    id?: string; // Firestore ID si édition
    display_name: string;
    image_url: string;
    file: File | null;
}

export function useAddCoupleForm(
    user: any,
    navigate: (path: string) => void,
    category: Category | null,
    coupleId?: string, // ← si présent → mode édition
) {
    const isEdit = !!coupleId;

    const [personA, setPersonA] = useState<PersonForm>({
        display_name: '',
        image_url: '',
        file: null,
    });

    const [personB, setPersonB] = useState<PersonForm>({
        display_name: '',
        image_url: '',
        file: null,
    });

    const [consentChecked, setConsentChecked] = useState(false);
    const [nameErrors, setNameErrors] = useState<{ A?: string; B?: string }>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ---------------------------------------------------------
    // 🟪 1. Chargement d’un couple existant en mode édition
    // ---------------------------------------------------------
    useEffect(() => {
        if (!isEdit || !coupleId) return;

        const loadCouple = async () => {
            const snap = await getDoc(doc(db, 'couples', coupleId));
            if (!snap.exists()) return;

            const couple = snap.data();

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

        loadCouple();
    }, [isEdit, coupleId]);

    // ---------------------------------------------------------
    // 🔍 2. Vérification doublons noms
    // ---------------------------------------------------------
    async function checkPersonExists(name: string): Promise<boolean> {
        if (!name.trim()) return false;

        const q = query(collection(db, 'people'), where('display_name', '==', name.trim()));
        const snap = await getDocs(q);

        // en mode édition → ok si c’est la même personne
        if (isEdit && snap.docs.length === 1) {
            const foundId = snap.docs[0].id;
            if (foundId === personA.id || foundId === personB.id) return false;
        }

        return !snap.empty;
    }

    const handleBlur = async (which: 'A' | 'B') => {
        const target = which === 'A' ? personA : personB;
        if (!target.display_name.trim()) return;

        const exists = await checkPersonExists(target.display_name);
        setNameErrors((prev) => ({
            ...prev,
            [which]: exists ? `Le nom "${target.display_name}" est déjà utilisé.` : '',
        }));
    };

    // ---------------------------------------------------------
    // 📝 3. Soumission création ou édition
    // ---------------------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setError('Vous devez être connecté.');
            return;
        }

        if (!personA.display_name || !personB.display_name) {
            setError('Les deux noms sont obligatoires.');
            return;
        }

        if (!consentChecked) {
            setError('Vous devez certifier avoir obtenu le consentement.');
            return;
        }

        if (nameErrors.A || nameErrors.B) {
            setError('Corrigez les erreurs de nom avant de continuer.');
            return;
        }

        setError(null);
        setLoading(true);

        try {
            // 📸 Upload conditionnel
            const aImg = personA.file ? await uploadToImgBB(personA.file) : personA.image_url;
            const bImg = personB.file ? await uploadToImgBB(personB.file) : personB.image_url;

            // ---------------------------------------------------------
            // ✏️ MODE ÉDITION
            // ---------------------------------------------------------
            if (isEdit && coupleId && personA.id && personB.id) {
                await setDoc(
                    doc(db, 'people', personA.id),
                    { display_name: personA.display_name, image_url: aImg },
                    { merge: true },
                );

                await setDoc(
                    doc(db, 'people', personB.id),
                    { display_name: personB.display_name, image_url: bImg },
                    { merge: true },
                );

                await setDoc(
                    doc(db, 'couples', coupleId),
                    {
                        category,
                        updatedAt: serverTimestamp(),
                    },
                    { merge: true },
                );

                navigate(`/couple/${coupleId}`);
                return;
            }

            // ---------------------------------------------------------
            // 🆕 MODE CRÉATION
            // ---------------------------------------------------------
            const peopleCol = collection(db, 'people');

            const aRef = await addDoc(peopleCol, {
                display_name: personA.display_name,
                image_url: aImg,
            });

            const bRef = await addDoc(peopleCol, {
                display_name: personB.display_name,
                image_url: bImg,
            });

            const coupleRef = doc(collection(db, 'couples'));
            await setDoc(coupleRef, {
                id: coupleRef.id,
                people_a_id: aRef.id,
                people_b_id: bRef.id,
                count_a: 0,
                count_b: 0,
                createdAt: serverTimestamp(),
                createdBy: user.uid,
                consentCertified: true,
                category,
                validated: false,
            });

            await Promise.all([
                setDoc(aRef, { couple_id: coupleRef.id }, { merge: true }),
                setDoc(bRef, { couple_id: coupleRef.id }, { merge: true }),
            ]);

            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    // ---------------------------------------------------------
    // 🚦 Validation bouton
    // ---------------------------------------------------------
    const canSubmit =
        !loading &&
        personA.display_name.trim() &&
        personB.display_name.trim() &&
        (personA.file || personA.image_url) &&
        (personB.file || personB.image_url) &&
        consentChecked &&
        !nameErrors.A &&
        !nameErrors.B;

    return {
        isEdit,
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
