import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import ImageUploader from '../components/ImageUploader';
import { useAddCoupleForm } from '../hooks/useAddCoupleForm';

export default function AddCouplePage({ user }: { user: User | null }) {
    const navigate = useNavigate();
    const [category, setCategory] = useState<'people' | 'friends'>('people');

    const {
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
    } = useAddCoupleForm(user, navigate, category);

    if (!user) {
        return (
            <main className="max-w-3xl mx-auto px-4 py-10">
                <div className="p-6 border rounded-2xl bg-white">
                    <h2 className="text-lg font-semibold mb-2">Ajouter un couple</h2>
                    <p className="text-gray-600">Connecte-toi pour pouvoir ajouter un couple.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 px-3 py-2 rounded bg-gray-900 text-white"
                    >
                        Retour à l’accueil
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-3xl mx-auto px-4 py-10">
            <h2 className="text-lg font-semibold mb-6">Ajouter un nouveau couple</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        {
                            label: 'Personne A',
                            data: personA,
                            set: setPersonA,
                            err: nameErrors.A,
                            key: 'A',
                        },
                        {
                            label: 'Personne B',
                            data: personB,
                            set: setPersonB,
                            err: nameErrors.B,
                            key: 'B',
                        },
                    ].map(({ label, data, set, err, key }) => (
                        <div key={label}>
                            <h3 className="font-medium mb-2">{label}</h3>
                            <input
                                type="text"
                                placeholder="Nom"
                                value={data.display_name}
                                onChange={(e) => set({ ...data, display_name: e.target.value })}
                                onBlur={() => handleBlur(key as 'A' | 'B')}
                                className={`w-full border rounded p-2 mb-4 ${
                                    err ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                            />
                            {err && <div className="text-xs text-red-600 mb-2">{err}</div>}
                            <ImageUploader
                                label={label}
                                imageUrl={data.image_url}
                                file={data.file}
                                onFileChange={(file) => set({ ...data, file })}
                                onUrlChange={(url) => set({ ...data, image_url: url })}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex items-start gap-2 border-t pt-4 mt-6">
                    <input
                        id="consent"
                        type="checkbox"
                        checked={consentChecked}
                        onChange={(e) => setConsentChecked(e.target.checked)}
                        className="mt-1"
                    />
                    <label htmlFor="consent" className="text-sm text-gray-700">
                        Je certifie avoir obtenu le <strong>consentement explicite</strong> des deux
                        personnes représentées (textes et images) pour la publication sur Surchope.
                        J’assume l’entière responsabilité en cas de contenu non autorisé.
                    </label>
                </div>

                {error && <div className="text-red-600 text-sm">{error}</div>}

                <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`px-4 py-2 rounded text-white ${
                        canSubmit
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-300 cursor-not-allowed'
                    }`}
                >
                    {loading ? 'Enregistrement...' : 'Créer le couple'}
                </button>
            </form>
        </main>
    );
}
