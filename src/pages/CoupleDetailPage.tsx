import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

import CoupleCard from '../components/CoupleCard/CoupleCard';
import SurchopeLoader from '../components/SurchopeLoader';

import { Couple } from '@/models/models';
import BackButton from '@/components/ui/BackButton';

export default function CoupleDetailPage({
    couples,
    user,
    myVotes,
    onVote,
}: {
    couples: Couple[];
    user: any;
    myVotes: Record<string, 'A' | 'B' | 'tie'>;
    // eslint-disable-next-line no-unused-vars -- ESLint's base rule misreads TypeScript callback signatures.
    onVote: (c: Couple, choice: 'A' | 'B' | 'tie') => void;
}) {
    const { id } = useParams();
    const couple = couples.find((c) => c.id === id);

    const [myChoice, setMyChoice] = useState<'A' | 'B' | 'tie' | undefined>(undefined);

    useEffect(() => {
        if (!couple) return;
        setMyChoice(myVotes[couple.id]);
    }, [couple, myVotes]);

    if (!couple)
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <SurchopeLoader />
                <p>Chargement du couple... 😢</p>
            </div>
        );

    const handleVote = (c: Couple, choice: 'A' | 'B' | 'tie') => {
        setMyChoice(choice);
        onVote(c, choice);
    };

    return (
        <main className="mx-auto max-w-xl space-y-5 px-4 pb-24 pt-6 text-foreground">
            <header className="home-stage p-6 text-center sm:p-8">
                <h1 className="stage-title text-3xl sm:text-4xl">
                    {couple.personA.display_name} & {couple.personB.display_name}
                </h1>
                <p className="mt-3 text-sm text-white/80">À ton tour de départager ce duo.</p>
            </header>

            <CoupleCard
                couple={couple}
                user={user}
                onVote={handleVote}
                compact={false}
                onlyMyVotes={false}
                revealResultsAfterVote
                myChoice={myChoice}
            />

            <BackButton to="/" label="Voir tous les duos" className="mt-8" />
        </main>
    );
}
