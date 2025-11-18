import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqPage() {
    const items = [
        {
            q: 'Qu’est-ce que “surchoper” ?',
            a: 'Surchoper, c’est sortir avec quelqu’un considéré comme plus attractif que soi. Sur Surchope, tu votes pour savoir qui surchope qui dans des couples improbables, drôles ou célèbres.',
        },
        {
            q: 'Comment fonctionne le jeu ?',
            a: 'Un couple apparaît, tu votes pour celui qui « surchope ». Tu peux aussi voter égalité. Les statistiques globales apparaissent ensuite immédiatement.',
        },
        {
            q: 'Le jeu est-il gratuit ?',
            a: 'Oui, Surchope est 100% gratuit. Jouer avec un compte permet simplement de suivre tes votes et proposer des couples.',
        },
        {
            q: 'D’où viennent les couples ?',
            a: 'Certains couples sont ajoutés par les joueurs, d’autres par l’équipe. Tu peux proposer tes propres couples via la page « Ajouter un couple ».',
        },
        {
            q: 'Puis-je jouer sans compte ?',
            a: "Tu peux juste voir les couples et leurs stats. Le compte te permet de voter, de sauvegarder tes votes et d'ajouter des couples.",
        },
        {
            q: 'Puis-je jouer sur mobile ?',
            a: 'Oui ! Surchope fonctionne très bien sur mobile et peut être installé comme une application (PWA).',
        },
        {
            q: 'Les données personnelles sont-elles protégées ?',
            a: 'Oui. Surchope collecte très peu de données et respecte entièrement la confidentialité des utilisateurs.',
        },
    ];

    const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 pb-20 pt-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-pink-600">FAQ — Surchope</h1>

            <p className="text-gray-600 text-center mb-10">
                Toutes les réponses à tes questions sur le jeu. Simple, fun et sans jugement 😇
            </p>

            <div className="space-y-4">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 rounded-xl shadow-sm bg-white"
                    >
                        <button
                            onClick={() => toggle(index)}
                            className="w-full flex justify-between items-center px-4 py-4 text-left"
                        >
                            <span className="font-medium text-gray-800">{item.q}</span>
                            <ChevronDown
                                className={`transition-transform ${
                                    openIndex === index ? 'rotate-180' : ''
                                }`}
                            />
                        </button>

                        {openIndex === index && (
                            <div className="px-4 pb-4 text-gray-600 leading-relaxed">{item.a}</div>
                        )}
                    </div>
                ))}
            </div>

            <div className="text-center mt-12 text-sm text-gray-500">
                Encore une question ?
                <br />
                Contacte-nous sur Instagram ou envoie un message via la PWA 💘
            </div>
        </div>
    );
}
