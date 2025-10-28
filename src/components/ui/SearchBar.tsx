import React from 'react';
import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';

type SearchBarProps = {
    value: string;
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
                className="w-full border border-border rounded-full pl-10 pr-4 py-2 text-sm bg-background text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] placeholder:text-muted-foreground/60"
            />
        </div>
    );
}
