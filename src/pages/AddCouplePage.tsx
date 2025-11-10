import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import { useAddCoupleForm } from '../hooks/useAddCoupleForm';
// <— utilitaire précédent

import BackButton from '@/components/ui/BackButton';
import { PersonInput } from '@/components/PersonInput';

export default function AddCouplePage({ user }: { user: User | null }) {
    const navigate = useNavigate();
    const [category, setCategory] = useState<'people' | 'friends'>('people');
    const [isFictional, setIsFictional] = useState<boolean>(false);

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
    } = useAddCoupleForm(user, navigate, category, isFictional); // 👈 passe isFictional au hook

    if (!user) {
        return (
            <main className="max-w-3xl mx-auto px-4 py-10">
                <div className="p-6 border rounded-2xl bg-white">
                    <h2 className="text-lg font-semibold mb-2">Ajouter un couple</h2>
                    <p className="text-gray-600">Connecte-toi pour pouvoir ajouter un couple.</p>
                    <BackButton to="/" label="Retour à la liste" className={'mt-8'} />
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-3xl mx-auto px-4 py-10">
            <h2 className="text-lg font-semibold mb-6">Ajouter un nouveau couple</h2>

            {/* 💘 Type de couple */}
            <div className="border-t pt-6 mt-8 mb-8">
                <p className="text-sm font-medium text-gray-800 mb-3">
                    Type de couple <span className="text-red-500">*</span>
                </p>

                <div className="flex gap-9">
                    {[
                        {
                            label: 'Fictif',
                            value: true,
                            description: 'Personnages historique, films, séries, etc.',
                            color: 'from-purple-500 to-pink-500',
                            icon: '🎬',
                        },
                        {
                            label: 'Réel',
                            value: false,
                            description: 'Vrai couple (célébrités, amis, etc.)',
                            color: 'from-blue-500 to-green-500',
                            icon: '💑',
                        },
                    ].map((option) => (
                        <button
                            key={option.label}
                            type="button"
                            onClick={() => setIsFictional(option.value)}
                            className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 text-left shadow-sm 
          ${
              isFictional === option.value
                  ? `border-transparent bg-gradient-to-r ${option.color} text-white scale-105`
                  : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{option.icon}</span>
                                <div>
                                    <p className="font-semibold">{option.label}</p>
                                    <p
                                        className={`text-xs ${
                                            isFictional === option.value
                                                ? 'text-white/90'
                                                : 'text-gray-500'
                                        }`}
                                    >
                                        {option.description}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                }}
                className="space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PersonInput
                        label="Personne A"
                        person={personA}
                        setPerson={setPersonA}
                        err={nameErrors.A}
                        handleBlur={handleBlur}
                    />
                    <PersonInput
                        label="Personne B"
                        person={personB}
                        setPerson={setPersonB}
                        err={nameErrors.B}
                        handleBlur={handleBlur}
                    />
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
                    disabled={!canSubmit || isFictional === null}
                    className={`px-4 py-2 rounded text-white ${
                        canSubmit && isFictional !== null
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
