import {Link, useLocation} from 'react-router-dom';
import {User} from 'firebase/auth';
import {CheckSquare, Heart, Home, LogOut, Play, UserPlus} from 'lucide-react';
import React from 'react';

import {loginWithGoogle, logout} from '../firebase';

export default function Header({ user }: { user: User | null }) {
    const location = useLocation();
    const isAdmin = user?.uid === 'EuindCjjeTYx5ABLPCRWdflHy2c2';
    const isPlayMode = location.pathname === '/jouer';

    const NavItem = ({
        to,
        label,
        icon: Icon,
        accent = false,
    }: {
        to: string;
        label: string;
        icon: any;
        accent?: boolean;
    }) => {
        const active = location.pathname === to;
        return (
            <Link
                to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition
          ${
              active
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground/70 hover:bg-muted hover:text-foreground'
          }
          ${accent ? 'text-primary font-semibold' : ''}`}
            >
                <Icon size={16} />
                {label}
            </Link>
        );
    };

    const BottomNavItem = ({ to, label, icon: Icon }: { to: string; label: string; icon: any }) => {
        const active = location.pathname === to;
        return (
            <Link
                to={to}
                className={`flex flex-col items-center justify-center flex-1 py-3 
                transition-all duration-150 
                ${active ? 'text-primary scale-[1.1] font-semibold' : 'text-muted-foreground hover:text-foreground'}
            `}
            >
                <Icon size={26} className="mb-1"/>
                <span className="text-[13px] tracking-wide">{label}</span>
            </Link>
        );
    };

    return (
        <>
            {/* 🧭 HEADER TOP (visible sur desktop) */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="font-semibold text-base sm:text-lg flex items-center gap-2 text-primary"
                    >
                        <Heart className="text-primary" size={18} />
                        SURCHOPE
                    </Link>

                    {/* Navigation desktop */}
                    <nav className="hidden md:flex items-center gap-1">
                        <NavItem to="/" label="Couples" icon={Home} />
                        {user && <NavItem to="/mes-votes" label="Mes votes" icon={CheckSquare} />}
                        <NavItem to="/jouer" label="Jouer" icon={Play} accent />
                        {user && <NavItem to="/ajouter-couple" label="Ajouter" icon={UserPlus} />}
                        {isAdmin && (
                            <NavItem to="/valider-couples" label="À valider" icon={CheckSquare} />
                        )}
                    </nav>

                    {/* Partie droite (profil / connexion) */}
                    <div className="flex items-center gap-2">
                        {user ? (
                            <>
                                {/* Photo de profil */}
                                <img
                                    className="w-8 h-8 rounded-full border border-border object-cover"
                                    src={user.photoURL ?? ''}
                                    alt={user.displayName ?? 'Avatar'}
                                />
                                {/* Déconnexion desktop */}
                                <button
                                    className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition"
                                    onClick={() => logout()}
                                    title="Se déconnecter"
                                >
                                    <LogOut size={16} className="text-muted-foreground" />
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => loginWithGoogle()}
                                className="
        flex items-center justify-center gap-3
        px-4 py-2
        bg-white text-black
        border border-gray-300 rounded-full
        shadow-sm
        hover:bg-gray-50 active:scale-[0.98]
        transition
    "
                            >
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png"
                                    alt="Logo Google"
                                    className="w-5 h-5"
                                    loading="lazy"
                                />
                                <span className="font-medium text-sm">Connexion Google</span>
                            </button>
                        )}

                        {/* Bouton d'installation (mobile uniquement) */}

                        {/*<div className="flex sm:hidden">
                            <InstallPrompt />
                        </div>
                        */}
                    </div>
                </div>
            </header>

            {/* 📱 MENU BAS (mobile uniquement) */}
            {!isPlayMode && (
                <nav
                    className="md:hidden fixed bottom-0 inset-x-0 z-50
        bg-background/95 backdrop-blur-xl
        border-t border-border
        py-2 shadow-[0_-3px_12px_rgba(0,0,0,0.08)]
        h-20"
                >
                    <div className="max-w-5xl mx-auto flex items-center justify-around px-4 h-full">
                        <BottomNavItem to="/" label="Couples" icon={Home} />
                        {user && (
                            <BottomNavItem to="/mes-votes" label="Mes votes" icon={CheckSquare} />
                        )}
                        <BottomNavItem to="/jouer" label="Jouer" icon={Play} />
                        {user && (
                            <BottomNavItem to="/ajouter-couple" label="Ajouter" icon={UserPlus} />
                        )}
                        {isAdmin && (
                            <BottomNavItem
                                to="/valider-couples"
                                label="Valider"
                                icon={CheckSquare}
                            />
                        )}
                    </div>
                </nav>
            )}
        </>
    );
}
