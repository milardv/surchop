import React, { useState } from 'react';
import { User } from 'firebase/auth';

import { CoupleView } from '../../models/models';
import PersonInfoModal from '../PersonInfoModal';
import CoupleHeader from './CoupleHeader';
import CoupleGauge from './CoupleGauge';
import CoupleVoteButtons from './CoupleVoteButtons';

export default function CoupleCard({
    couple,
    user,
    myChoice,
    onVote,
    compact = false,
    onlyMyVotes = false,
    onDelete,
}: {
    couple: CoupleView;
    user: User | null;
    myChoice?: 'A' | 'B' | 'tie';
    onVote?: (c: CoupleView, choice: 'A' | 'B' | 'tie') => void;
    compact?: boolean;
    onlyMyVotes?: boolean;
    onDelete?: (id: string, userUid: string) => void;
}) {
    const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

    return (
        <div className="relative p-4 rounded-2xl bg-white shadow-sm border hover:shadow-md transition">
            <CoupleHeader couple={couple} user={user} onDelete={onDelete} compact={compact} />

            <div className="flex items-center gap-4 flex-col">
                <div className="flex-1 flex items-center gap-3 flex-col">
                    <CoupleGauge
                        couple={couple}
                        myChoice={myChoice}
                        onlyMyVotes={onlyMyVotes}
                        onSelectPerson={setSelectedPerson}
                    />
                </div>
            </div>

            {!compact && (
                <CoupleVoteButtons
                    couple={couple}
                    user={user}
                    canVote={!!user && !!onVote}
                    myChoice={myChoice}
                    onVote={onVote}
                />
            )}

            {!user && !compact && (
                <div className="text-xs text-gray-500 mt-2 text-center">
                    Connecte-toi pour voter.
                </div>
            )}

            {selectedPerson && (
                <PersonInfoModal name={selectedPerson} onClose={() => setSelectedPerson(null)} />
            )}
        </div>
    );
}
