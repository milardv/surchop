import React, {useState} from "react";
import {Link} from "react-router-dom";
import {User} from "firebase/auth";
import {loginWithGoogle, logout} from "../firebase";
import {Menu, X} from "lucide-react"; // icons propres

export default function Header({user}: { user: User | null }) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                {/* Logo + titre */}
                <Link to="/" className="font-semibold text-base sm:text-lg">
                    Le Fun & le Tabou
                </Link>

                {/* Menu desktop */}
                <nav className="hidden md:flex items-center gap-4 text-sm">
                    <Link to="/" className="text-gray-600 hover:text-gray-900">
                        Tous les couples
                    </Link>
                    {user && (
                        <Link to="/mes-votes" className="text-gray-600 hover:text-gray-900">
                            Mes votes
                        </Link>
                    )}
                    {user && (
                        <Link to="/ajouter-couple" className="text-gray-700 font-medium hover:text-gray-900">
                            ➕ Ajouter un couple
                        </Link>
                    )}
                </nav>

                {/* Zone droite */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            <img
                                className="w-8 h-8 rounded-full border"
                                src={user.photoURL ?? ""}
                                alt={user.displayName ?? ""}
                            />
                            <button
                                className="hidden sm:inline text-sm underline"
                                onClick={() => logout()}
                            >
                                Se déconnecter
                            </button>
                        </>
                    ) : (
                        <button
                            className="px-3 py-1 rounded bg-pink-500 text-white text-sm"
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
                        {menuOpen ? <X size={20}/> : <Menu size={20}/>}
                    </button>
                </div>
            </div>

            {/* Menu mobile déroulant */}
            {menuOpen && (
                <nav className="md:hidden bg-white border-t border-gray-200 flex flex-col p-4 space-y-2 text-sm">
                    <Link to="/" className="hover:underline" onClick={() => setMenuOpen(false)}>
                        Tous les couples
                    </Link>
                    {user && (
                        <Link to="/mes-votes" className="hover:underline" onClick={() => setMenuOpen(false)}>
                            Mes votes
                        </Link>
                    )}
                    {user && (
                        <Link to="/ajouter-couple" className="hover:underline" onClick={() => setMenuOpen(false)}>
                            ➕ Ajouter un couple
                        </Link>
                    )}
                    {user && (
                        <button
                            className="text-left underline text-gray-700"
                            onClick={() => {
                                logout();
                                setMenuOpen(false);
                            }}
                        >
                            Se déconnecter
                        </button>
                    )}
                </nav>
            )}
        </header>
    );
}
