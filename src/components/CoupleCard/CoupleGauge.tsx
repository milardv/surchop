import React from 'react';

import Gauge from '../Gauge';
import { CoupleView } from '../../models/models';

export default function CoupleGauge({
    couple,
    myChoice,
    onlyMyVotes,
    onSelectPerson,
}: {
    couple: CoupleView;
    myChoice?: 'A' | 'B' | 'tie';
    onlyMyVotes: boolean;
    onSelectPerson: (name: string) => void;
}) {
    const renderPerson = (
        person: { display_name: string; image_url?: string },
        index: 'A' | 'B',
    ) => {
        // 🎨 Détermine la couleur selon le côté
        const colorClass =
            index === 'A'
                ? 'ring-primary bg-primary/25 text-primary'
                : 'ring-secondary bg-secondary/25 text-secondary';

        const colorPerson = index === 'A' ? 'text-primary' : 'text-secondary';

        return (
            <div
                key={index}
                className="flex items-center gap-2 flex-col cursor-pointer relative"
                onClick={() => onSelectPerson(person.display_name)}
            >
                {/* 💫 Halo animé (toujours présent, couleur selon le côté) */}
                <div
                    className={`absolute w-28 h-28 md:w-36 md:h-36 rounded-full blur-md animate-pulse-ring -z-10 ${colorClass}`}
                />

                {/* 🖼️ Image avec halo dégradé visible */}
                <div className="relative flex items-center justify-center">
                    {/* 🖼️ Image principale */}
                    <div
                        className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden flex items-center justify-center transition-transform duration-300 bg-muted hover:scale-105 shadow-lg ring-4 ring-white"
                        style={{
                            zIndex: 1, // 👈 la photo reste au-dessus du halo
                        }}
                    >
                        {person.image_url ? (
                            <img
                                src={person.image_url}
                                alt={person.display_name}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <span className="text-lg font-semibold text-muted-foreground">
                                {person.display_name[0]}
                            </span>
                        )}
                    </div>
                </div>

                {/* Nom */}
                <div className={`font-medium text-base text-center transition-colors duration-200`}>
                    {person.display_name}
                </div>
            </div>
        );
    };

    const resultText =
        myChoice === 'A'
            ? `${couple.personA.display_name} surchope 💘`
            : myChoice === 'B'
              ? `${couple.personB.display_name} surchope 💘`
              : 'égalité parfaite 😳';

    return (
        <>
            {/* Animation des halos */}
            <style>
                {`
          @keyframes pulse-ring {
            0% { transform: scale(0.9); opacity: 0.6; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(0.9); opacity: 0.6; }
          }
          .animate-pulse-ring {
            animation: pulse-ring 1.6s infinite ease-in-out;
          }
        `}
            </style>

            <div className="flex-1 flex items-center justify-center gap-4 relative">
                {renderPerson(couple.personA, 'A')}
                <span className="text-muted-foreground text-lg font-semibold select-none">vs</span>
                {renderPerson(couple.personB, 'B')}
            </div>

            <div className="w-48 mt-3">
                {onlyMyVotes ? (
                    <div className="text-xs text-center text-muted-foreground italic">
                        Pour toi, <span className="text-primary font-medium">{resultText}</span>
                    </div>
                ) : (
                    <Gauge couple={couple} />
                )}
            </div>
        </>
    );
}
