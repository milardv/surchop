import React from "react";
import {Link} from "react-router-dom";
import {User} from "firebase/auth";
import {loginWithGoogle, logout} from "../firebase";

export default function Header({user}: { user: User | null }) {
    return (
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                <nav className="flex items-center gap-4">
                    <Link to="/" className="font-semibold">
                        Le Fun & le Tabou
                    </Link>
                    <Link to="/" className="text-sm text-gray-600 hover:underline">
                        Tous les couples
                    </Link>
                    {user && (
                        <Link to="/mes-votes" className="text-sm text-gray-600 hover:underline">
                            Mes votes
                        </Link>
                    )}
                </nav>

                <div>
                    {user ? (
                        <div className="flex items-center gap-3">
                            <img className="w-8 h-8 rounded-full" src={user.photoURL ?? ""} alt=""/>
                            <button className="text-sm underline" onClick={() => logout()}>
                                Se déconnecter
                            </button>
                        </div>
                    ) : (
                        <button className="px-3 py-1 rounded bg-pink-500 text-white" onClick={() => loginWithGoogle()}>
                            Se connecter
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
