import { Link, useLocation } from 'react-router-dom';
import { User } from 'firebase/auth';
import {
    Menu,
    X,
    Heart,
    UserPlus,
    Home,
    CheckSquare,
    LogOut, // ✅ ajout de l'icône logout
} from 'lucide-react';
import React, { useState } from 'react';

import { loginWithGoogle, logout } from '../firebase';
import InstallPrompt from './InstallPrompt';

export default function Header({ user }: { user: User | null }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

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
                  ? 'bg-pink-100 text-pink-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }
          ${accent ? 'text-pink-600 font-semibold' : ''}`}
            >
                <Icon size={16} />
                {label}
            </Link>
        );
    };

    return (
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                {/* Logo + titre */}
                <Link to="/" className="font-semibold text-base sm:text-lg flex items-center gap-2">
                    <Heart className="text-pink-500" size={18} />
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
                </nav>

                {/* Zone droite */}
                <div className="flex items-center gap-3">
                    <InstallPrompt />
                    {user ? (
                        <>
                            <img
                                className="w-8 h-8 rounded-full border"
                                src={user.photoURL ?? ''}
                                alt={user.displayName ?? ''}
                            />
                            <button
                                className="hidden sm:flex flex-row items-center gap-1 text-sm text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline"
                                onClick={() => logout()}
                                title="Se déconnecter"
                            >
                                <LogOut size={16} className="text-gray-600" />
                                Se déconnecter
                            </button>
                        </>
                    ) : (
                        <button
                            className="px-3 py-1 rounded bg-pink-500 text-white text-sm hover:bg-pink-600 transition"
                            onClick={() => loginWithGoogle()}
                        >
                            Se connecter
                        </button>
                    )}

                    {/* Bouton menu mobile */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 rounded hover:bg-gray-100"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Menu mobile */}
            {menuOpen && (
                <nav className="md:hidden bg-white border-t border-gray-200 flex flex-col p-3 space-y-2 text-sm">
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
                    {user && (
                        <button
                            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-left"
                            onClick={() => {
                                logout();
                                setMenuOpen(false);
                            }}
                        >
                            <LogOut size={16} className="text-gray-600" />
                            Se déconnecter
                        </button>
                    )}
                </nav>
            )}
        </header>
    );
}
