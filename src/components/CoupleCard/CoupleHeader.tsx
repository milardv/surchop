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

    const shareOnWhatsApp = (e: React.MouseEvent) => {
        e.stopPropagation();
        const baseUrl = window.location.origin;
        const message = encodeURIComponent(
            `💘 Vote pour ce couple sur Surchope : ${couple.personA.display_name} & ${couple.personB.display_name} 😏\n👉 ${baseUrl}/couple/${couple.id}`,
        );

        window.open(`https://wa.me/?text=${message}`, '_blank');
    };

    return (
        <div className="absolute top-2 right-2 flex items-center gap-2 opacity-60 hover:opacity-100 transition">
            {isAdmin && onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Supprimer ce couple et les données associées ?')) {
                            onDelete(couple.id, user!.uid);
                        }
                    }}
                    title="Supprimer ce couple"
                    className="hover:text-pink-600"
                >
                    <Trash2 size={16} />
                </button>
            )}

            {!compact && (
                <button
                    onClick={shareOnWhatsApp}
                    title="Partager sur WhatsApp"
                    className="text-green-600 hover:text-green-700"
                >
                    <Share2 size={16} />
                </button>
            )}
        </div>
    );
}
