import React, { useState } from 'react';
import { User } from 'firebase/auth';

import { CoupleView } from '../../models/models';
import PersonInfoModal from '../PersonInfoModal';
import CoupleHeader from './CoupleHeader';
import CoupleGauge from './CoupleGauge';
import CoupleVoteButtons from './CoupleVoteButtons';
import ReportMenu from '../ReportMenu';

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
        <div className="relative p-4 rounded-2xl bg-card text-card-foreground border border-border shadow-sm hover:shadow-md transition-all duration-200">
            {/* En-tête */}
            <div className="flex justify-between items-start mb-3">
                <CoupleHeader couple={couple} user={user} onDelete={onDelete} compact={compact} />
                {user && !compact && <ReportMenu user={user} couple={couple} />}
            </div>

            {/* Contenu principal */}
            <div className="flex flex-col items-center gap-4">
                <CoupleGauge
                    couple={couple}
                    myChoice={myChoice}
                    onlyMyVotes={onlyMyVotes}
                    onSelectPerson={setSelectedPerson}
                />
            </div>

            {/* Boutons de vote */}
            {!compact && (
                <div className="mt-3">
                    <CoupleVoteButtons
                        couple={couple}
                        user={user}
                        canVote={!!user && !!onVote}
                        myChoice={myChoice}
                        onVote={onVote}
                    />
                </div>
            )}

            {/* Message si non connecté */}
            {!user && !compact && (
                <div className="mt-4 text-center">
                    <div className="inline-block bg-primary/10 text-primary text-sm font-medium px-3 py-2 rounded-full shadow-sm">
                        Connecte-toi pour voter
                    </div>
                </div>
            )}

            {/* Modal info personne */}
            {selectedPerson && (
                <PersonInfoModal name={selectedPerson} onClose={() => setSelectedPerson(null)} />
            )}
        </div>
    );
}
