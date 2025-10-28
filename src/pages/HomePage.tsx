import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

import CoupleCard from '../components/CoupleCard/CoupleCard';
import SurchopeIntroModal from '../components/SurchopeIntroModal';
import SurchopeLoader from '../components/SurchopeLoader';
import SurchopeFooter from '../components/SurchopeFooter';

import Button from '@/components/ui/Button';
import SearchBar from '@/components/ui/SearchBar';

export default function HomePage({
    user,
    couples,
    myVotes,
    onVote,
    loading,
    deleteCouple,
}: {
    user: any;
    couples: any[];
    myVotes: Record<string, 'A' | 'B' | 'tie'>;
    onVote: (c: any, choice: 'A' | 'B' | 'tie') => void;
    loading: boolean;
    deleteCouple?: (id: string, userUid: string) => void;
}) {
    const [query, setQuery] = useState('');
    const [showIntro, setShowIntro] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const alreadySeen = localStorage.getItem('surchope_intro_seen');
        if (!alreadySeen) {
            setShowIntro(true);
            localStorage.setItem('surchope_intro_seen', 'true');
        }
    }, []);

    if (loading) return <SurchopeLoader />;

    const filteredCouples = couples
        .filter((c) =>
            query.trim() === ''
                ? true
                : `${c.personA.display_name} ${c.personB.display_name}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
        )
        .sort((a, b) => {
            const aVoted = !!myVotes[a.id];
            const bVoted = !!myVotes[b.id];
            if (aVoted === bVoted) return 0;
            return aVoted ? 1 : -1;
        });

    return (
        <main className="max-w-5xl mx-auto px-4 py-6 space-y-6 relative text-foreground">
            Pour créer une mise en page attrayante pour votre site « SURCHOPE.FR », vous pourriez
            opter pour un design simple et épuré qui met en valeur votre titre et votre slogan.
            Voici une suggestion : Titre :
            <h1 style="font-size: 3em; color: #EB4799; text-align: center; font-weight: bold;">
                SURCHOPE.FR
            </h1>
            Slogan :
            <p style="font-size: 1.5em; color: #EB4799; text-align: center; font-style: italic;">
                Vote qui surchope qui
            </p>
            En utilisant la couleur #EB4799 pour le texte, vous assurez une harmonie visuelle avec
            l'identité de votre site. Pensez à ajouter des éléments visuels complémentaires qui
            reflètent l'esprit de votre plateforme et attirent l'attention des visiteurs.
            {showIntro && <SurchopeIntroModal onClose={() => setShowIntro(false)} />}
            {/* 🔍 Barre de recherche */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <SearchBar
                    value={query}
                    onChange={setQuery}
                    placeholder="Rechercher un couple ou un prénom..."
                />
            </div>
            {/* 🔎 Liste des couples */}
            {filteredCouples.length === 0 ? (
                <p className="text-center text-muted-foreground mt-6">Aucun couple trouvé 😢</p>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4 pb-24">
                    {filteredCouples.map((c) => (
                        <CoupleCard
                            key={c.id}
                            couple={c}
                            user={user}
                            myChoice={myVotes[c.id]}
                            onVote={onVote}
                            onlyMyVotes={false}
                            onDelete={deleteCouple}
                        />
                    ))}
                </div>
            )}
            <SurchopeFooter />
            {/* 🎮 Bouton flottant “Play” */}
            <Button
                onClick={() => navigate('/jouer')}
                variant="primary"
                size="lg"
                className="!fixed bottom-6 right-6 rounded-full shadow-lg p-4 w-14 h-14 flex items-center justify-center"
                title="Jouer"
            >
                <Play size={28} className="ml-0.5" />
            </Button>
        </main>
    );
}
