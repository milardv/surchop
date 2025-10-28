import React from 'react';

import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
};

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className,
    ...props
}: ButtonProps) {
    const base =
        'inline-flex items-center justify-center font-medium rounded-full transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants = {
        primary:
            'bg-primary text-primary-foreground hover:opacity-90 focus:ring-[hsl(var(--primary))]',
        secondary:
            'bg-secondary text-secondary-foreground hover:opacity-90 focus:ring-[hsl(var(--secondary))]',
        outline:
            'border border-border text-foreground hover:bg-muted focus:ring-[hsl(var(--ring))]',
        ghost: 'text-foreground/70 hover:bg-muted focus:ring-[hsl(var(--ring))]',
    };

    const sizes = {
        sm: 'px-3 py-1 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-base',
    };

    return (
        <button
            className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
            {...props}
        >
            {children}
        </button>
    );
}
