import React, { useState } from 'react';
import { User } from 'firebase/auth';

import Gauge from './Gauge';
import { CoupleView } from '../models/models';
import PersonInfoModal from './PersonInfoModal';

export default function CoupleCard({
    couple,
    user,
    myChoice,
    onVote,
    compact = false,
    onlyMyVotes = false,
}: {
    couple: CoupleView;
    user: User | null;
    myChoice?: 'A' | 'B' | 'tie'; // ⚖️ ajout de la valeur "tie"
    onVote?: (c: CoupleView, choice: 'A' | 'B' | 'tie') => void; // ⚖️ même ici
    compact?: boolean;
    onlyMyVotes?: boolean;
}) {
    const canVote = !!user && !!onVote;
    const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

    return (
        <div className="p-4 rounded-2xl bg-white shadow-sm border">
            <div className="flex items-center gap-4 flex-col">
                <div className="flex-1 flex items-center gap-3">
                    {/* 🧍 Personne A */}
                    <div
                        className="flex items-center gap-2 flex-col cursor-pointer"
                        onClick={() => setSelectedPerson(couple.personA.display_name)}
                    >
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center hover:scale-105 transition">
                            {couple.personA.image_url ? (
                                <img
                                    src={couple.personA.image_url}
                                    alt={couple.personA.display_name}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <span className="text-lg">{couple.personA.display_name[0]}</span>
                            )}
                        </div>
                        <div className="font-medium text-lg text-center hover:text-pink-600">
                            {couple.personA.display_name}
                        </div>
                    </div>

                    <span className="text-gray-400 text-lg font-semibold">vs</span>

                    {/* 🧍 Personne B */}
                    <div
                        className="flex items-center gap-2 flex-col cursor-pointer"
                        onClick={() => setSelectedPerson(couple.personB.display_name)}
                    >
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center hover:scale-105 transition">
                            {couple.personB.image_url ? (
                                <img
                                    src={couple.personB.image_url}
                                    alt={couple.personB.display_name}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <span className="text-lg">{couple.personB?.display_name?.[0]}</span>
                            )}
                        </div>
                        <div className="font-medium text-lg text-center hover:text-pink-600">
                            {couple.personB.display_name}
                        </div>
                    </div>
                </div>

                <div className="w-48">
                    {onlyMyVotes ? (
                        <div className="text-xs text-gray-500 mt-2">
                            Pour vous{' '}
                            {myChoice === 'A'
                                ? couple.personA.display_name + ' surchope'
                                : myChoice === 'B'
                                  ? couple.personB.display_name + ' surchope'
                                  : 'il y a égalité parfaite'}{' '}
                        </div>
                    ) : (
                        <Gauge couple={couple} />
                    )}
                </div>
            </div>

            {/* 🗳️ Boutons de vote */}
            <div className={`mt-4 ${compact ? 'hidden' : 'flex flex-col gap-2'}`}>
                <div className="flex gap-2">
                    <button
                        disabled={!canVote}
                        onClick={() => onVote && onVote(couple, 'A')}
                        className={`flex-1 px-3 py-2 rounded border ${
                            myChoice === 'A'
                                ? 'bg-pink-50 border-pink-500 text-pink-600'
                                : 'hover:bg-gray-50'
                        } ${!canVote ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        {couple.personA.display_name} surchope
                    </button>

                    <button
                        disabled={!canVote}
                        onClick={() => onVote && onVote(couple, 'B')}
                        className={`flex-1 px-3 py-2 rounded border ${
                            myChoice === 'B'
                                ? 'bg-pink-50 border-pink-500 text-pink-600'
                                : 'hover:bg-gray-50'
                        } ${!canVote ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        {couple.personB.display_name} surchope
                    </button>
                </div>

                {/* ⚖️ Bouton égalité */}
                <button
                    disabled={!canVote}
                    onClick={() => onVote && onVote(couple, 'tie')}
                    className={`px-3 py-2 rounded border text-sm font-medium transition ${
                        myChoice === 'tie'
                            ? 'bg-blue-50 border-blue-500 text-blue-600'
                            : 'hover:bg-gray-50 text-gray-600'
                    } ${!canVote ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                    ⚖️ Égalité parfaite
                </button>
            </div>

            {!user && !compact && (
                <div className="text-xs text-gray-500 mt-2">Connecte-toi pour voter.</div>
            )}

            {/* 👇 Fiche personne (modale Wikipedia) */}
            {selectedPerson && (
                <PersonInfoModal name={selectedPerson} onClose={() => setSelectedPerson(null)} />
            )}
        </div>
    );
}
