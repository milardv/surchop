import { Share2, Trash2 } from 'lucide-react';
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
        const shareText = `💘 Vote pour ce couple sur Surchope : ${couple.personA.display_name} & ${couple.personB.display_name} 😏`;

        // ✅ Partage natif si disponible
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Surchope 💘',
                    text: shareText,
                    url: shareUrl,
                });
                return;
            } catch (err) {
                console.log('Partage annulé :', err);
            }
        }
    };

    return (
        <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition">
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
