import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import Button from '@/components/ui/Button';

type BackButtonProps = {
    to?: string;
    label?: string;
    className?: string;
};

export default function BackButton({
    to = '/',
    label = 'Retour à la liste',
    className,
}: BackButtonProps) {
    return (
        <div className={`flex justify-center ${className ?? ''}`}>
            <Link to={to}>
                <Button
                    variant="outline"
                    size="sm"
                    className="group flex items-center gap-2 px-4 py-2 rounded-full shadow-sm hover:bg-muted transition"
                >
                    <ArrowLeft
                        size={16}
                        className="text-primary transition-transform group-hover:-translate-x-1"
                    />
                    <span>{label}</span>
                </Button>
            </Link>
        </div>
    );
}
