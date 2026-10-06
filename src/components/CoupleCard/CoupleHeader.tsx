import * as Icons from 'lucide-react';
import { Pencil, Share2, Tag, Trash2 } from 'lucide-react';
import { User } from 'firebase/auth';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Couple } from '../../models/models';

import { shareLink } from '@/utils/shareLink';

export default function CoupleHeader({
    couple,
    user,
    onDelete,
    compact,
}: {
    couple: Couple;
    user: User | null;
    // eslint-disable-next-line no-unused-vars -- ESLint's base rule misreads TypeScript callback signatures.
    onDelete?: (id: string, userUid: string) => void;
    compact?: boolean;
}) {
    const isAdmin = user?.uid === 'EuindCjjeTYx5ABLPCRWdflHy2c2';
    const navigate = useNavigate();
    const [shareStatus, setShareStatus] = useState('');
    const category = couple.category as any;
    const categoryName = category?.name || 'Sans catégorie';
    const categoryLucideId = category?.lucideId;
    const CategoryIcon = (
        categoryLucideId ? Icons[categoryLucideId as keyof typeof Icons] : null
    ) as React.ComponentType<{ size?: number; strokeWidth?: number }> | null;

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const shareUrl = `${window.location.origin}/couple/${couple.id}`;
        const shareText = `💘 Vote pour ce couple sur Surchope : ${couple.personA?.display_name} & ${couple.personB.display_name} 😏`;
        try {
            const result = await shareLink(shareUrl, 'Surchope', shareText);
            setShareStatus(result === 'copied' ? 'Lien copié' : 'Lien partagé');
        } catch {
            setShareStatus('Partage impossible');
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-1">
            <div
                className="flex min-h-9 items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-bold text-secondary"
                title={categoryName}
            >
                {CategoryIcon ? <CategoryIcon size={14} strokeWidth={2.1} /> : <Tag size={14} />}
                <span>{categoryName}</span>
            </div>

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
                    className="grid h-10 w-10 place-items-center rounded-full text-red-700 transition-transform duration-150 active:scale-[.97]"
                >
                    <Trash2 size={18} />
                </button>
            )}

            {/* ✏️ Bouton admin modifier */}
            {isAdmin && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/modifier-couple/${couple.id}`);
                    }}
                    title="Modifier ce couple"
                    className="grid h-10 w-10 place-items-center rounded-full text-secondary transition-transform duration-150 active:scale-[.97]"
                >
                    <Pencil size={18} />
                </button>
            )}

            {/* 📤 Bouton de partage */}
            {!compact && (
                <button
                    onClick={handleShare}
                    title="Partager"
                    aria-label="Partager ce duo"
                    className="grid h-10 w-10 place-items-center rounded-full text-primary transition-transform duration-150 active:scale-[.97]"
                >
                    <Share2 size={20} strokeWidth={2.1} />
                </button>
            )}
            {shareStatus && (
                <span role="status" className="text-xs font-semibold text-primary">
                    {shareStatus}
                </span>
            )}
        </div>
    );
}
