import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';

import { auth } from './firebase';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import MyVotesPage from './pages/MyVotesPage';
import AddCouplePage from './pages/AddCouplePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import useCouples from './hooks/useCouples';
import useVotes from './hooks/useVotes';
import CoupleDetailPage from './pages/CoupleDetailPage';
import PlayModePage from './pages/PlayModePage';

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const { couples, loading, deleteCouple } = useCouples();
    const { votesAll, myVotes, handleVote } = useVotes(user, couples);

    useEffect(() => onAuthStateChanged(auth, setUser), []);

    return (
        <div>
            <Header user={user} />

            <Routes>
                <Route
                    path="/"
                    element={
                        <HomePage
                            user={user}
                            couples={couples}
                            myVotes={myVotes}
                            onVote={handleVote}
                            loading={loading}
                            deleteCouple={deleteCouple}
                        />
                    }
                />
                <Route
                    path="/jouer"
                    element={
                        <PlayModePage
                            couples={couples}
                            user={user}
                            myVotes={myVotes}
                            onVote={handleVote}
                        />
                    }
                />
                <Route
                    path="/mes-votes"
                    element={<MyVotesPage user={user} couples={couples} votesAll={votesAll} />}
                />

                <Route path="/ajouter-couple" element={<AddCouplePage user={user} />} />
                <Route
                    path="/couple/:id"
                    element={<CoupleDetailPage couples={couples} user={user} />}
                />
                <Route path="/confidentialite" element={<PrivacyPolicyPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <footer className="text-center text-xs text-gray-500 py-6">
                Fait avec amour, aucun jugement 😇 •{' '}
                <a href="/confidentialite" className="underline hover:text-gray-700">
                    Politique de confidentialité
                </a>
            </footer>
        </div>
    );
}
