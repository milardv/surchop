import { Link, useLocation } from 'react-router-dom';
import { User } from 'firebase/auth';
import { Heart, Home, LogOut, Plus, Swords, Trophy, Zap, type LucideIcon } from 'lucide-react';

import { loginWithGoogle, logout } from '../firebase';

const navigation: { to: string; label: string; Icon: LucideIcon }[] = [
    { to: '/', label: 'Duos', Icon: Home },
    { to: '/jouer', label: 'Rafale', Icon: Zap },
    { to: '/defi', label: 'Défier', Icon: Swords },
    { to: '/mes-votes', label: 'Mes votes', Icon: Trophy },
];

export default function Header({ user }: { user: User | null }) {
    const location = useLocation();
    const isAdmin = user?.uid === 'EuindCjjeTYx5ABLPCRWdflHy2c2';

    return (
        <>
            <header className="site-header sticky top-0 z-40">
                <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
                    <Link
                        to="/"
                        aria-label="Surchope, accueil"
                        className="brand-wordmark flex items-center gap-2 text-xl text-foreground sm:text-2xl"
                    >
                        <span
                            className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white"
                            aria-hidden="true"
                        >
                            <Heart size={21} fill="currentColor" />
                        </span>
                        Surchope<span className="text-primary">.</span>
                    </Link>

                    <nav
                        className="hidden items-center gap-1 md:flex"
                        aria-label="Navigation principale"
                    >
                        {navigation.map(({ to, label, Icon }) => {
                            const active = location.pathname === to;
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    aria-current={active ? 'page' : undefined}
                                    className={`arcade-nav-link flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-bold ${active ? 'bg-secondary text-white' : 'text-foreground hover:bg-muted'}`}
                                >
                                    <Icon size={17} />
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-2">
                        {user && (
                            <Link
                                to="/ajouter-couple"
                                aria-label="Proposer un duo"
                                className="arcade-nav-link grid h-11 w-11 place-items-center rounded-full bg-accent text-foreground sm:hidden"
                            >
                                <Plus size={20} />
                            </Link>
                        )}
                        {user && (
                            <Link
                                to="/ajouter-couple"
                                className="arcade-nav-link hidden min-h-11 items-center gap-1 rounded-full bg-accent px-4 text-sm font-bold text-foreground active:scale-[.97] sm:flex"
                            >
                                <Plus size={18} /> Proposer
                            </Link>
                        )}
                        {isAdmin && (
                            <Link
                                to="/valider-couples"
                                className="hidden text-sm font-bold text-primary lg:block"
                            >
                                À valider
                            </Link>
                        )}
                        {user ? (
                            <button
                                type="button"
                                onClick={() => logout()}
                                aria-label="Se déconnecter"
                                className="arcade-nav-link grid h-11 w-11 place-items-center rounded-full bg-white text-foreground active:scale-[.97]"
                            >
                                <LogOut size={19} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => loginWithGoogle()}
                                className="arcade-nav-link min-h-11 rounded-full bg-accent px-4 text-sm font-bold text-foreground active:scale-[.97]"
                            >
                                Connexion
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <nav
                className="arcade-nav fixed bottom-[max(10px,env(safe-area-inset-bottom))] left-3 right-3 z-50 mx-auto flex h-[68px] max-w-lg items-center justify-around rounded-[22px] px-1 md:hidden"
                aria-label="Navigation mobile"
            >
                {navigation.map(({ to, label, Icon }) => {
                    const active = location.pathname === to;
                    return (
                        <Link
                            key={to}
                            to={to}
                            aria-current={active ? 'page' : undefined}
                            className={`arcade-nav-link flex h-[58px] min-w-[66px] flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-bold ${active ? 'bg-secondary text-white' : 'text-foreground/75'}`}
                        >
                            <Icon size={21} strokeWidth={active ? 2.8 : 2.2} />
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
