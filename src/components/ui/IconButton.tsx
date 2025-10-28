import React from 'react';

import { cn } from '@/lib/utils';

export default function IconButton({
    icon: Icon,
    label,
    onClick,
    color = 'default',
    className,
}: {
    icon: any;
    label?: string;
    onClick?: () => void;
    color?: 'default' | 'primary' | 'secondary';
    className?: string;
}) {
    const colors = {
        default: 'bg-muted hover:bg-muted/80 text-foreground/80 focus:ring-[hsl(var(--ring))]',
        primary:
            'bg-primary text-primary-foreground hover:opacity-90 focus:ring-[hsl(var(--primary))]',
        secondary:
            'bg-secondary text-secondary-foreground hover:opacity-90 focus:ring-[hsl(var(--secondary))]',
    };

    return (
        <button
            onClick={onClick}
            title={label}
            className={cn(
                'flex items-center justify-center rounded-full p-2 transition focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95',
                colors[color],
                className,
            )}
        >
            <Icon size={18} />
        </button>
    );
}
