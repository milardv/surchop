import React from 'react';

import { cn } from '@/lib/utils';

export default function Alert({
    type = 'info',
    children,
    className,
}: {
    type?: 'info' | 'success' | 'error';
    children: React.ReactNode;
    className?: string;
}) {
    const styles = {
        info: 'bg-secondary/10 text-secondary border border-secondary/30',
        success: 'bg-green-50 text-green-700 border border-green-300',
        error: 'bg-red-50 text-red-700 border border-red-300',
    };

    return (
        <div
            role="alert"
            className={cn(
                'rounded-md text-sm px-4 py-2 transition shadow-sm',
                styles[type],
                className,
            )}
        >
            {children}
        </div>
    );
}
