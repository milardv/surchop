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
        const isWinner = myChoice === index;
        return (
            <div
                key={index}
                className="flex items-center gap-2 flex-col cursor-pointer relative"
                onClick={() => onSelectPerson(person.display_name)}
            >
                {/* Halo animé */}
                {isWinner && (
                    <div className="absolute w-28 h-28 md:w-36 md:h-36 rounded-full bg-pink-400/30 blur-md animate-pulse-ring -z-10" />
                )}

                {/* Image */}
                <div
                    className={`w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center hover:scale-105 transition ${
                        isWinner ? 'ring-4 ring-pink-400 shadow-lg' : ''
                    }`}
                >
                    {person.image_url ? (
                        <img
                            src={person.image_url}
                            alt={person.display_name}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <span className="text-lg">{person.display_name[0]}</span>
                    )}
                </div>
                <div
                    className={`font-medium text-lg text-center ${
                        isWinner ? 'text-pink-600' : 'hover:text-pink-600'
                    }`}
                >
                    {person.display_name}
                </div>
            </div>
        );
    };

    const resultText =
        myChoice === 'A'
            ? `${couple.personA.display_name} surchope`
            : myChoice === 'B'
              ? `${couple.personB.display_name} surchope`
              : 'il y a égalité parfaite';

    return (
        <>
            {/* Animation keyframes */}
            <style>
                {`
                @keyframes pulse-ring {
                    0% { transform: scale(0.9); opacity: 0.6; }
                    50% { transform: scale(1.1); opacity: 0.9; }
                    100% { transform: scale(0.9); opacity: 0.6; }
                }
                .animate-pulse-ring {
                    animation: pulse-ring 1.5s infinite ease-in-out;
                }
                `}
            </style>

            <div className="flex-1 flex items-center justify-center gap-3 relative">
                {renderPerson(couple.personA, 'A')}
                <span className="text-gray-400 text-lg font-semibold select-none">vs</span>
                {renderPerson(couple.personB, 'B')}
            </div>

            <div className="w-48 mt-2">
                {onlyMyVotes ? (
                    <div className="text-xs text-gray-500 text-center">Pour vous {resultText}</div>
                ) : (
                    <Gauge couple={couple} />
                )}
            </div>
        </>
    );
}
