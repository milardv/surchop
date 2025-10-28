import React from 'react';

import { cn } from '@/lib/utils';

export default function Card({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'bg-card text-card-foreground border border-border rounded-2xl shadow-sm hover:shadow-md transition p-4',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children }: { children: React.ReactNode }) {
    return <div className="mb-2 font-semibold text-foreground">{children}</div>;
}

export function CardContent({ children }: { children: React.ReactNode }) {
    return <div className="text-muted-foreground text-sm">{children}</div>;
}
