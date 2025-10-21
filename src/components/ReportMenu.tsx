import React from 'react';
import { Flag, MoreVertical } from 'lucide-react';
import { User } from 'firebase/auth';

import { CoupleView } from '../models/models';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ReportMenu({ user, couple }: { user: User; couple: CoupleView }) {
    const handleReport = () => {
        const confirmReport = window.confirm(
            `Souhaites-tu signaler le couple "${couple.personA.display_name} et ${couple.personB.display_name}" ?`,
        );
        if (!confirmReport) return;

        const userName = user.displayName ?? 'Utilisateur anonyme';
        const subject = `Signalement d'un couple : ${couple.personA.display_name} & ${couple.personB.display_name}`;
        const body = `
Bonjour,

Un utilisateur a signalé un couple sur Surchope :

👤 Utilisateur : ${userName}
🔗 Lien : https://surchope.fr/couple/${couple.id}
💬 Raison : (à compléter)

Merci.
        `.trim();

        const mailto = `mailto:contact@surchope.fr?subject=${encodeURIComponent(
            subject,
        )}&body=${encodeURIComponent(body)}`;

        window.location.href = mailto;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    title="Plus d’options"
                >
                    <MoreVertical size={18} />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={4}>
                <DropdownMenuItem
                    onClick={handleReport}
                    className="flex items-center gap-2 text-gray-700 cursor-pointer"
                >
                    <Flag size={14} className="text-amber-500" />
                    <span>Signaler ce couple</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
