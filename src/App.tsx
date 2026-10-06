import React, { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';

import { auth } from './firebase';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import MyVotesPage from './pages/MyVotesPage';
import AddCouplePage from './pages/AddCouple/AddCouplePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import useCouples from './hooks/useCouples';
import useVotes from './hooks/useVotes';
import CoupleDetailPage from './pages/CoupleDetailPage';
import PlayModePage from './pages/PlayModePage';
import FriendsChallengePage from './pages/FriendsChallengePage';

import StyleGuide from '@/tools/StyleGuide';
import ValidateCouplesPage from '@/pages/ValidateCouplesPage';
import FaqPage from '@/pages/Faq';
import useReferrals from '@/hooks/useReferrals';

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const { couples, loading, deleteCouple } = useCouples();
    const { votesAll, myVotes, handleVote, votesLoaded, voterId } = useVotes(user, couples);
    const { code: referralCode, referralCount, trackingReady } = useReferrals(voterId);

    useEffect(() => onAuthStateChanged(auth, setUser), []);

    return (
        <div className="pb-20 md:pb-0">
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
                            votesLoaded={votesLoaded}
                            deleteCouple={deleteCouple}
                            referralCode={referralCode}
                            referralCount={referralCount}
                            referralTrackingReady={trackingReady}
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
                            loading={loading || !votesLoaded}
                        />
                    }
                />
                <Route
                    path="/defi"
                    element={
                        <FriendsChallengePage
                            couples={couples}
                            myVotes={myVotes}
                            user={user}
                            loading={loading}
                            onVote={handleVote}
                            referralCode={referralCode}
                            referralCount={referralCount}
                            referralTrackingReady={trackingReady}
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
                    element={
                        <CoupleDetailPage
                            couples={couples}
                            user={user}
                            myVotes={myVotes}
                            onVote={handleVote}
                        />
                    }
                />
                <Route path="/modifier-couple/:id" element={<AddCouplePage user={user} />} />

                <Route path="/valider-couples" element={<ValidateCouplesPage />} />
                <Route path="/confidentialite" element={<PrivacyPolicyPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/style" element={<StyleGuide />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-border px-4 pb-28 pt-6 text-center text-xs text-muted-foreground md:pb-6">
                <span>Fait avec amour, sans jugement.</span>
                <Link to="/faq" className="underline underline-offset-4 hover:text-primary">
                    FAQ
                </Link>
                <Link
                    to="/confidentialite"
                    className="underline underline-offset-4 hover:text-primary"
                >
                    Confidentialité
                </Link>
            </footer>
        </div>
    );
}
