import React from 'react';

import { cn } from '@/lib/utils';

export default function Tag({
    children,
    color = 'primary',
    className,
}: {
    children: React.ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'neutral';
    className?: string;
}) {
    const colors = {
        primary: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary/10 text-secondary',
        success: 'bg-green-100 text-green-700',
        neutral: 'bg-muted text-muted-foreground',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                colors[color],
                className,
            )}
        >
            {children}
        </span>
    );
}
