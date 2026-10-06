import { useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import { deleteDoc, doc } from 'firebase/firestore';
import { ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { db } from '../firebase';
import { Couple, VoteView } from '../models/models';
import CoupleCard from '../components/CoupleCard/CoupleCard';
import VoteProgress from '../components/VoteProgress';

import SurchopeLoader from '@/components/SurchopeLoader';
import { getOrCreateGuestVoterId } from '@/utils/voterIdentity';

type VoteEntry = { id: string; couple: Couple; choice: 'A' | 'B' | 'tie'; updatedAt?: Date };

export default function MyVotesPage({
    user,
    couples,
    votesAll,
}: {
    user: User | null;
    couples: Couple[];
    votesAll: VoteView[];
}) {
    const voterId = useMemo(() => user?.uid ?? getOrCreateGuestVoterId(), [user?.uid]);
    const [loading, setLoading] = useState(true);

    const [entries, setEntries] = useState<VoteEntry[]>([]);

    // 🔁 Chargement des votes du visiteur (connecté ou invité)
    useEffect(() => {
        setLoading(true);

        const list = votesAll
            .filter((vote) => vote.uid === voterId)
            .flatMap<VoteEntry>((vote: VoteView) => {
                const couple = couples.find((c) => c.id === vote.couple_id);
                if (!couple || !couple.personA || !couple.personB) return [];

                if (vote.people_voted_id === 'tie') {
                    return [
                        { id: vote.id, couple, choice: 'tie' as const, updatedAt: vote.updatedAt },
                    ];
                }
                if (vote.people_voted_id === couple.personA.id) {
                    return [
                        { id: vote.id, couple, choice: 'A' as const, updatedAt: vote.updatedAt },
                    ];
                }
                if (vote.people_voted_id === couple.personB.id) {
                    return [
                        { id: vote.id, couple, choice: 'B' as const, updatedAt: vote.updatedAt },
                    ];
                }
                return [];
            })
            .sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));

        setEntries(list);
        setLoading(false);
    }, [votesAll, couples, voterId]);

    // 🗑️ Supprimer un vote
    const handleDeleteVote = async (voteId: string) => {
        if (!confirm('Supprimer ce vote ?')) return;
        try {
            await deleteDoc(doc(db, 'votes', voteId));
            setEntries((prev) => prev.filter((e) => e.id !== voteId));
        } catch (err) {
            console.error('Erreur suppression vote:', err);
            alert('Erreur lors de la suppression du vote.');
        }
    };

    return (
        <main className="mx-auto max-w-6xl space-y-6 px-4 pb-24 pt-6 text-foreground sm:px-6">
            <header className="home-stage p-6 sm:p-8">
                <h1 className="stage-title text-3xl sm:text-5xl">Tes choix, ton palmarès.</h1>
                <p className="mt-3 text-sm text-white/80">
                    Retrouve les duos que tu as départagés.
                </p>
            </header>
            {!user && (
                <p className="text-sm text-muted-foreground">
                    En mode invité, cet historique reste lié à ce navigateur.
                </p>
            )}

            {loading && <SurchopeLoader />}

            {!loading && entries.length === 0 && (
                <div className="rounded-[20px] bg-white p-6">
                    <h2 className="section-title">La partie commence ici.</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Tu n’as pas encore voté. Un premier duel t’attend !
                    </p>
                    <Link
                        to="/jouer"
                        className="stage-action mt-5 bg-primary px-5 text-sm text-white"
                    >
                        Jouer maintenant <ArrowRight size={17} />
                    </Link>
                </div>
            )}

            {!loading && entries.length > 0 && (
                <>
                    <VoteProgress votes={entries.length} />
                    <h2 className="section-title">Tes duos</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {entries.map((entry) => (
                            <div key={entry.id} className="relative">
                                <button
                                    type="button"
                                    onClick={() => handleDeleteVote(entry.id)}
                                    aria-label={`Supprimer le vote pour ${entry.couple.personA?.display_name} et ${entry.couple.personB?.display_name}`}
                                    className="absolute right-4 top-3 z-10 grid h-11 w-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <CoupleCard
                                    couple={entry.couple}
                                    user={user}
                                    myChoice={entry.choice}
                                    onlyMyVotes
                                    compact
                                />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </main>
    );
}
