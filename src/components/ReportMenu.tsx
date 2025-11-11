import React from 'react';
import { Flag, MoreVertical } from 'lucide-react';
import { User } from 'firebase/auth';

import { Couple } from '../models/models';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ReportMenu({ user, couple }: { user: User; couple: Couple }) {
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
            {/* 🔘 Bouton de menu */}
            <DropdownMenuTrigger asChild>
                <button
                    className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2"
                    title="Plus d’options"
                >
                    <MoreVertical size={18} />
                </button>
            </DropdownMenuTrigger>

            {/* 📋 Menu déroulant */}
            <DropdownMenuContent
                align="end"
                sideOffset={6}
                className="bg-card text-card-foreground border border-border rounded-lg shadow-md p-1"
            >
                <DropdownMenuItem
                    onClick={handleReport}
                    className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted transition"
                >
                    <Flag size={14} className="text-amber-500" />
                    <span>Signaler ce couple</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
