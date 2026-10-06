import React from 'react';
import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';

type SearchBarProps = {
    value: string;
    // eslint-disable-next-line no-unused-vars -- ESLint's base rule misreads TypeScript callback signatures.
    onChange: (v: string) => void;
    placeholder?: string;
    className?: string;
};

export default function SearchBar({
    value,
    onChange,
    placeholder = 'Rechercher...',
    className,
}: SearchBarProps) {
    return (
        <div className={cn('relative w-full sm:w-80 flex items-center', className)}>
            {/* Icône loupe */}
            <Search
                size={18}
                className="absolute left-3 text-muted-foreground/80 pointer-events-none"
            />

            {/* Champ texte */}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                aria-label="Rechercher un duo"
                className="h-12 w-full rounded-2xl border border-border bg-white pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
        </div>
    );
}
