import {useEffect, useState} from 'react';
import {addDoc, collection, onSnapshot} from 'firebase/firestore';

import {db} from '../firebase';

import {Category} from '@/models/models';

export default function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const ref = collection(db, 'category');

        const unsub = onSnapshot(ref, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Category, 'id'>),
            })) as Category[];

            setCategories(data);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const createCategory = async (name: string) => {
        const ref = collection(db, 'category');
        const doc = await addDoc(ref, {name});
        return {id: doc.id, name};
    };

    return {categories, loading, createCategory};
}
