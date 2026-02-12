import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { db } from '../../firebase';
import { uploadToImgBB } from '../../utils/uploadToImgBB';

import { Category } from '@/models/models';

export function useSubmitCouple(
    user: any,
    navigate: (path: string) => void,
    isEdit: boolean,
    category: Category | null,
    coupleId?: string,
) {
    async function submit(personA: any, personB: any): Promise<{ created?: boolean }> {
        if (!user) throw 'Vous devez être connecté';

        const aImg = personA.file ? await uploadToImgBB(personA.file) : personA.image_url;
        const bImg = personB.file ? await uploadToImgBB(personB.file) : personB.image_url;

        // 🔄 MODE ÉDITION
        if (isEdit && coupleId && personA.id && personB.id) {
            await setDoc(
                doc(db, 'people', personA.id),
                {
                    display_name: personA.display_name,
                    image_url: aImg,
                },
                { merge: true },
            );

            await setDoc(
                doc(db, 'people', personB.id),
                {
                    display_name: personB.display_name,
                    image_url: bImg,
                },
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
            return {};
        }

        // 🆕 MODE CRÉATION
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

        return { created: true };
    }

    return { submit };
}
