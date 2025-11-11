import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import { Couple } from '../models/models';
import CoupleCard from '../components/CoupleCard/CoupleCard';
import SurchopeLoader from '../components/SurchopeLoader';

import BackButton from '@/components/ui/BackButton';

export default function CoupleDetailPage({
    couples,
    user,
    onVote,
}: {
    couples: Couple[];
    user: any;
    onVote: (c: Couple, choice: 'A' | 'B' | 'tie') => void;
}) {
    const { id } = useParams();
    const couple = couples.find((c) => c.id === id);

    const [myChoice, setMyChoice] = useState<'A' | 'B' | 'tie' | undefined>(undefined);

    useEffect(() => {
        if (!couple) return;
        setMyChoice(undefined);
    }, [couple]);

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
        <main className="max-w-md mx-auto px-4 py-6 text-foreground">
            <h1 className="text-2xl font-semibold text-center text-primary mb-4">
                💘 {couple.personA.display_name} & {couple.personB.display_name}
            </h1>

            <CoupleCard
                couple={couple}
                user={user}
                onVote={handleVote}
                compact={false}
                onlyMyVotes={false}
                myChoice={myChoice}
            />

            <BackButton to="/" label="Retour à la liste" className={'mt-8'} />
        </main>
    );
}
