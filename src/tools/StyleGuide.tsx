import React, { useState } from 'react';

import SearchBar from '@/components/ui/SearchBar';

export default function StyleGuide() {
    const colors = [
        { name: 'primary', label: 'Primary 💘' },
        { name: 'secondary', label: 'Secondary 💙' },
        { name: 'accent', label: 'Accent 💫' },
        { name: 'muted', label: 'Muted 🌫️' },
        { name: 'card', label: 'Card 🪶' },
    ];

    const [search, setSearch] = useState('');

    return (
        <main className="max-w-4xl mx-auto p-8 space-y-10 text-foreground">
            {/* Titre principal */}
            <header className="text-center">
                <h1 className="text-4xl font-extrabold text-primary drop-shadow-sm mb-2">
                    🎨 Styleguide Surchope
                </h1>
                <p className="text-muted-foreground text-sm">
                    Aperçu de la palette, des composants et des styles de l’application 💘
                </p>
            </header>

            {/* 🔍 Barre de recherche */}
            <section>
                <h2 className="font-semibold mb-3 text-lg text-foreground">Barre de recherche</h2>
                <div className="flex justify-center">
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        placeholder="🔍 Recherche d’exemple..."
                        className="max-w-sm"
                    />
                </div>
                <p className="text-center text-muted-foreground text-xs mt-2">
                    Tape quelque chose pour tester le comportement du champ ✨
                </p>
            </section>

            {/* Couleurs */}
            <section>
                <h2 className="font-semibold mb-3 text-lg text-foreground">Couleurs</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {colors.map(({ name, label }) => (
                        <div
                            key={name}
                            className={`flex flex-col items-center text-center rounded-xl overflow-hidden border border-border bg-${name} text-${name}-foreground shadow-sm`}
                        >
                            <div className={`w-full h-16 bg-${name}`} />
                            <div className="p-2 text-xs font-medium text-foreground">{label}</div>
                            <code className="text-[10px] text-muted-foreground mb-2">
                                {`bg-${name}`}
                            </code>
                        </div>
                    ))}
                </div>
            </section>

            {/* Boutons */}
            <section>
                <h2 className="font-semibold mb-3 text-lg text-foreground">Boutons</h2>
                <div className="flex flex-wrap gap-4">
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium shadow-sm hover:opacity-90 transition">
                        Surchope 💘
                    </button>
                    <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-full font-medium shadow-sm hover:opacity-90 transition">
                        Partager
                    </button>
                    <button className="border border-border text-foreground px-4 py-2 rounded-full hover:bg-muted transition">
                        Neutre
                    </button>
                </div>
            </section>

            {/* Tags */}
            <section>
                <h2 className="font-semibold mb-3 text-lg text-foreground">Tags</h2>
                <div className="flex gap-3 flex-wrap">
                    <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                        Surchope 💘
                    </span>
                    <span className="bg-secondary/10 text-secondary text-xs font-semibold px-3 py-1 rounded-full">
                        Égalité ⚖️
                    </span>
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                        Nouveau 🌱
                    </span>
                </div>
            </section>

            {/* Card */}
            <section>
                <h2 className="font-semibold mb-3 text-lg text-foreground">Card</h2>
                <div className="bg-card border border-border rounded-2xl shadow-sm p-5 max-w-sm text-card-foreground">
                    <h3 className="font-semibold mb-2 text-foreground">Exemple de carte 💌</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Les cartes servent à encadrer du contenu (comme les couples ou les
                        informations utilisateur). Elles utilisent une ombre douce et des arrondis
                        cohérents avec le reste de l’UI.
                    </p>
                    <div className="mt-4 flex justify-end">
                        <button className="bg-primary hover:opacity-90 text-primary-foreground text-sm px-3 py-1.5 rounded-full shadow-sm transition">
                            Action 💬
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}
