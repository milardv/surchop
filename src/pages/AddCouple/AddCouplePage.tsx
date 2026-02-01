import React, {useState} from 'react';
import {User} from 'firebase/auth';
import {useNavigate, useParams} from 'react-router-dom';

import UnauthorizedBlock from './UnauthorizedBlock';
import CoupleForm from './CoupleForm';

import {useAddCoupleForm} from '@/hooks/useAddCoupleForm';
import useCategories from '@/hooks/useCategories';
import CategorySelector from '@/components/CategorySelector';
import {Category} from '@/models/models';

export default function AddCouplePage({user}: { user: User | null }) {
    const navigate = useNavigate();
    const {id: coupleId} = useParams();
    const isEdit = !!coupleId;

    // 🔥 catégories depuis Firestore
    const {categories, loading: catLoading, createCategory} = useCategories();
    const [category, setCategory] = useState<Category | null>(null);

    const form = useAddCoupleForm(user, navigate, category, coupleId);

    if (!user) return <UnauthorizedBlock/>;

    return (
        <main className="max-w-3xl mx-auto px-4 py-10">
            <h2 className="text-xl font-semibold mb-6">
                {isEdit ? 'Modifier un couple' : 'Ajouter un nouveau couple'}
            </h2>

            {/* Choix / création de catégorie */}
            <section className="mt-6 mb-8">
                <CategorySelector
                    categories={categories}
                    value={category}
                    onChange={setCategory}
                    onCreate={createCategory}
                />
                {catLoading && (
                    <p className="mt-2 text-xs text-gray-400">Chargement des catégories…</p>
                )}
            </section>

            {/* Formulaire principal */}
            <CoupleForm {...form} category={category}/>
        </main>
    );
}
