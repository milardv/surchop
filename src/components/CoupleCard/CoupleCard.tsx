import React, { useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';

import PersonInfoModal from '../PersonInfoModal';
import CoupleHeader from './CoupleHeader';
import CoupleGauge from './CoupleGauge';
import CoupleVoteButtons from './CoupleVoteButtons';
import ReportMenu from '../ReportMenu';

import { Couple } from '@/models/models';

export default function CoupleCard({
    couple,
    user,
    myChoice,
    onVote,
    compact = false,
    onlyMyVotes = false,
    onDelete,
}: {
    couple: Couple;
    user: User | null;
    myChoice?: 'A' | 'B' | 'tie';
    onVote?: (c: Couple, choice: 'A' | 'B' | 'tie') => void;
    compact?: boolean;
    onlyMyVotes?: boolean;
    onDelete?: (id: string, userUid: string) => void;
}) {
    const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
    const [localChoice, setLocalChoice] = useState<'A' | 'B' | 'tie' | undefined>(myChoice);
    const [localCounts, setLocalCounts] = useState(() => ({
        count_a: couple.count_a ?? 0,
        count_b: couple.count_b ?? 0,
        count_tie: couple.count_tie ?? 0,
    }));

    useEffect(() => {
        setLocalChoice(myChoice);
    }, [myChoice, couple.id]);

    useEffect(() => {
        setLocalCounts({
            count_a: couple.count_a ?? 0,
            count_b: couple.count_b ?? 0,
            count_tie: couple.count_tie ?? 0,
        });
    }, [couple.id, couple.count_a, couple.count_b, couple.count_tie]);

    const displayedCouple = useMemo(
        () => ({
            ...couple,
            count_a: localCounts.count_a,
            count_b: localCounts.count_b,
            count_tie: localCounts.count_tie,
        }),
        [couple, localCounts.count_a, localCounts.count_b, localCounts.count_tie],
    );

    const handleVote = (c: Couple, choice: 'A' | 'B' | 'tie') => {
        setLocalCounts((prev) => {
            let countA = prev.count_a;
            let countB = prev.count_b;
            let countTie = prev.count_tie;

            const removePreviousVote = () => {
                if (localChoice === 'A') countA = Math.max(0, countA - 1);
                else if (localChoice === 'B') countB = Math.max(0, countB - 1);
                else if (localChoice === 'tie') countTie = Math.max(0, countTie - 1);
            };

            const addCurrentVote = () => {
                if (choice === 'A') countA += 1;
                else if (choice === 'B') countB += 1;
                else countTie += 1;
            };

            removePreviousVote();
            addCurrentVote();

            return { count_a: countA, count_b: countB, count_tie: countTie };
        });

        setLocalChoice(choice);
        onVote?.(c, choice);
    };

    return (
        <div className="relative p-4 rounded-2xl bg-card text-card-foreground border border-border shadow-sm hover:shadow-md transition-all duration-200">
            {/* En-tête */}
            <div className="flex justify-between items-start mb-3">
                <CoupleHeader
                    couple={displayedCouple}
                    user={user}
                    onDelete={onDelete}
                    compact={compact}
                />
                {user && !compact && <ReportMenu user={user} couple={displayedCouple} />}
            </div>

            {/* Contenu principal */}
            <div className="flex flex-col items-center gap-4">
                <CoupleGauge
                    couple={displayedCouple}
                    myChoice={localChoice}
                    onlyMyVotes={onlyMyVotes}
                    onSelectPerson={setSelectedPerson}
                />
            </div>

            {/* Boutons de vote */}
            {!compact && (
                <div className="mt-3">
                    <CoupleVoteButtons
                        couple={displayedCouple}
                        user={user}
                        canVote={!!user && !!onVote}
                        myChoice={localChoice}
                        onVote={handleVote}
                    />
                </div>
            )}

            {/* Modal info personne */}
            {selectedPerson && (
                <PersonInfoModal name={selectedPerson} onClose={() => setSelectedPerson(null)} />
            )}
        </div>
    );
}
