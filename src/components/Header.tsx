import { Link, useLocation } from 'react-router-dom';
import { User } from 'firebase/auth';
import { Menu, X, Heart, UserPlus, Home, CheckSquare, LogOut, Palette } from 'lucide-react';
import React, { useState } from 'react';

import { loginWithGoogle, logout } from '../firebase';
import InstallPrompt from './InstallPrompt';

export default function Header({ user }: { user: User | null }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    const isAdmin = user?.uid === 'EuindCjjeTYx5ABLPCRWdflHy2c2';

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
                onClick={() => setMenuOpen(false)}
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

    return (
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                {/* Logo + titre */}
                <Link
                    to="/"
                    className="font-semibold text-base sm:text-lg flex items-center gap-2 text-primary"
                >
                    <Heart className="text-primary" size={18} />
                    SURCHOPE
                </Link>

                {/* Menu desktop */}
                <nav className="hidden md:flex items-center gap-2">
                    <NavItem to="/" label="Tous les couples" icon={Home} />
                    {user && <NavItem to="/mes-votes" label="Mes votes" icon={CheckSquare} />}
                    {user && (
                        <NavItem
                            to="/ajouter-couple"
                            label="Ajouter un couple"
                            icon={UserPlus}
                            accent
                        />
                    )}
                    {/* 🎨 Lien vers le styleguide (admin uniquement) */}
                    {isAdmin && <NavItem to="/style" label="Styleguide" icon={Palette} accent />}
                </nav>

                {/* Zone droite */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            <img
                                className="w-8 h-8 rounded-full border border-border"
                                src={user.photoURL ?? ''}
                            />
                            <button
                                className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition"
                                onClick={() => logout()}
                                title="Se déconnecter"
                            >
                                <LogOut size={16} className="text-muted-foreground" />
                                Se déconnecter
                            </button>
                        </>
                    ) : (
                        <button
                            className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm hover:opacity-90 transition"
                            onClick={() => loginWithGoogle()}
                        >
                            Se connecter
                        </button>
                    )}

                    {/* Bouton menu mobile */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 rounded-full hover:bg-muted transition"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Menu mobile */}
            {menuOpen && (
                <nav className="md:hidden bg-card border-t border-border flex flex-col p-3 space-y-2 text-sm text-foreground">
                    <NavItem to="/" label="Tous les couples" icon={Home} />
                    {user && <NavItem to="/mes-votes" label="Mes votes" icon={CheckSquare} />}
                    {user && (
                        <NavItem
                            to="/ajouter-couple"
                            label="Ajouter un couple"
                            icon={UserPlus}
                            accent
                        />
                    )}
                    {isAdmin && <NavItem to="/style" label="Styleguide" icon={Palette} accent />}

                    {/* Installer dans le menu mobile 📱 */}
                    <InstallPrompt />

                    {user && (
                        <button
                            className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:bg-muted rounded-md text-left transition"
                            onClick={() => {
                                logout();
                                setMenuOpen(false);
                            }}
                        >
                            <LogOut size={16} className="text-muted-foreground" />
                            Se déconnecter
                        </button>
                    )}
                </nav>
            )}
        </header>
    );
}
