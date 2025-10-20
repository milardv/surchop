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
    const renderPerson = (person: { display_name: string; image_url?: string }) => (
        <div
            className="flex items-center gap-2 flex-col cursor-pointer"
            onClick={() => onSelectPerson(person.display_name)}
        >
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center hover:scale-105 transition">
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
            <div className="font-medium text-lg text-center hover:text-pink-600">
                {person.display_name}
            </div>
        </div>
    );

    const resultText =
        myChoice === 'A'
            ? `${couple.personA.display_name} surchope`
            : myChoice === 'B'
                ? `${couple.personB.display_name} surchope`
                : 'il y a égalité parfaite';

    return (
        <>
            {/* Photos + VS */}
            <div className="flex-1 flex items-center justify-center gap-3">
                {renderPerson(couple.personA)}
                <span className="text-gray-400 text-lg font-semibold select-none">vs</span>
                {renderPerson(couple.personB)}
            </div>

            {/* Résultat ou jauge */}
            <div className="w-48 mt-2">
                {onlyMyVotes ? (
                    <div className="text-xs text-gray-500 text-center">
                        Pour vous {resultText}
                    </div>
                ) : (
                    <Gauge couple={couple} />
                )}
            </div>
        </>
    );
}
