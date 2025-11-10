import { Share2, Trash2, Film, Heart } from 'lucide-react';
import { User } from 'firebase/auth';
import React from 'react';

import { CoupleView } from '../../models/models';

export default function CoupleHeader({
    couple,
    user,
    onDelete,
    compact,
}: {
    couple: CoupleView;
    user: User | null;
    onDelete?: (id: string, userUid: string) => void;
    compact?: boolean;
}) {
    const isAdmin = user?.uid === 'EuindCjjeTYx5ABLPCRWdflHy2c2';

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const baseUrl = window.location.origin;
        const shareUrl = `${baseUrl}/couple/${couple.id}`;
        const shareText = `💘 Vote pour ce couple sur Surchope : ${couple.personA?.display_name} & ${couple.personB.display_name} 😏`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Surchope 💘',
                    text: shareText,
                    url: shareUrl,
                });
            } catch (err) {
                console.log('Partage annulé :', err);
            }
        }
    };

    return (
        <div className="flex items-center gap-3 opacity-90 hover:opacity-100 transition">
            {/* 🏷️ Badge fictif ou réel */}
            {couple.isFictional !== undefined && (
                <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                        ${
                            couple.isFictional
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-pink-100 text-pink-700'
                        }
                    `}
                    title={couple.isFictional ? 'Couple fictif' : 'Couple réel'}
                >
                    {couple.isFictional ? (
                        <>
                            <Film size={14} strokeWidth={2} /> <span>Fictif</span>
                        </>
                    ) : (
                        <>
                            <Heart size={14} strokeWidth={2.2} /> <span>Réel</span>
                        </>
                    )}
                </div>
            )}

            {/* 🗑️ Bouton admin supprimer */}
            {isAdmin && onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Supprimer ce couple et les données associées ?')) {
                            onDelete(couple.id, user!.uid);
                        }
                    }}
                    title="Supprimer ce couple"
                    className="p-1.5 rounded-full text-destructive/80 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-[hsl(var(--destructive))]/40 transition active:scale-95"
                >
                    <Trash2 size={18} />
                </button>
            )}

            {/* 📤 Bouton de partage */}
            {!compact && (
                <button
                    onClick={handleShare}
                    title="Partager"
                    className="p-1.5 rounded-full text-primary hover:text-primary/80 hover:bg-primary/10 transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/40"
                >
                    <Share2 size={20} strokeWidth={2.1} />
                </button>
            )}
        </div>
    );
}
