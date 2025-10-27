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

        // ❎ Fallback : WhatsApp / Instagram
        const encodedMsg = encodeURIComponent(`${shareText}\n👉 ${shareUrl}`);
        const whatsappUrl = `https://wa.me/?text=${encodedMsg}`;
        const instagramUrl = `https://www.instagram.com/`;

        const choice = window.prompt(
            'Choisis où partager 💬\n\n1️⃣ WhatsApp\n2️⃣ Instagram\n\nTape 1 ou 2 :',
        );
        if (choice === '1') window.open(whatsappUrl, '_blank');
        if (choice === '2') window.open(instagramUrl, '_blank');
    };

    return (
        <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition">
            {/* Bouton admin supprimer */}
            {isAdmin && onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Supprimer ce couple et les données associées ?')) {
                            onDelete(couple.id, user!.uid);
                        }
                    }}
                    title="Supprimer ce couple"
                    className="hover:text-pink-600 transition active:scale-95"
                >
                    <Trash2 size={20} />
                </button>
            )}

            {/* Bouton de partage */}
            {!compact && (
                <button
                    onClick={handleShare}
                    title="Partager"
                    className="text-pink-600 hover:text-pink-700 transition active:scale-95 p-1"
                >
                    <Share2 size={24} strokeWidth={2.2} />
                </button>
            )}
        </div>
    );
}
